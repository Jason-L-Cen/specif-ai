import { HumanMessage } from "@langchain/core/messages";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { WorkflowEventsService } from "../../services/events/workflow-events.service";
import { LangChainModelProvider } from "../../services/llm/langchain-providers/base";
import { ITool } from "../common/types";
import { buildReactAgent } from "../react-agent";
import { refinePrompt } from "../../prompts/feature/evaluation/refine";
import { evaluatePrompt } from "../../prompts/feature/evaluation/evaluate";
import { repairJSON } from "../../utils/custom-json-parser";
import { IUserStoryWorkflowStateAnnotation } from "./state";
import { UserStoryWorkflowRunnableConfig } from "./types";
import { createUserStoryResearchInformationPrompt } from "./prompts/research-information";
import { createSummarizeUserStoryResearchPrompt } from "./prompts/summarize-research";

const workflowEvents = new WorkflowEventsService("user-story");

type BuildResearchNodeParams = {
  model: LangChainModelProvider;
  tools: Array<ITool>;
  checkpointer?: BaseCheckpointSaver | false | undefined;
};

export const buildResearchNode = ({
  model,
  tools,
  checkpointer,
}: BuildResearchNodeParams) => {
  return async (
    state: IUserStoryWorkflowStateAnnotation["State"],
    runnableConfig: UserStoryWorkflowRunnableConfig
  ) => {
    const { trace, sendMessagesInTelemetry = false } =
      runnableConfig?.configurable ?? {};
    const span = trace?.span({
      name: "research",
    });

    const researchCorrelationId = uuid();

    if (tools.length === 0) {
      const message = "No tools are passed so skipping research phase";
      span?.end({
        statusMessage: message,
      });

      await workflowEvents.dispatchAction(
        "research",
        {
          title: "没有可用工具，已跳过调研阶段",
        },
        runnableConfig
      );

      return {
        referenceInformation: "",
      };
    }

    await workflowEvents.dispatchThinking(
      "research",
      {
        title: `正在根据产品需求文档（PRD）“${state.reqName}”的背景进行调研`,
      },
      runnableConfig,
      researchCorrelationId
    );

    const agent = buildReactAgent({
      model: model,
      tools: tools,
      responseFormat: {
        prompt: createSummarizeUserStoryResearchPrompt({
          appName: state.appName,
          appDescription: state.appDescription,
          reqName: state.reqName,
          reqDesc: state.reqDesc,
          technicalDetails: state.technicalDetails,
          extraContext: state.extraContext,
        }),
        schema: z.object({
          referenceInformation: z.string(),
        }),
      },
      checkpointer: checkpointer,
    });

    // max(min(64, each tool called twice (for each tool call - llm node + tool node + trim messages node) so 3) + 1 (for structured output)), 128)
    const recursionLimit = Math.min(
      Math.max(64, tools.length * 2 * 3 + 1),
      128
    );

    const response = await agent.invoke(
      {
        messages: [
          createUserStoryResearchInformationPrompt({
            appName: state.appName,
            appDescription: state.appDescription,
            reqName: state.reqName,
            reqDesc: state.reqDesc,
            technicalDetails: state.technicalDetails,
            extraContext: state.extraContext,
            recursionLimit: recursionLimit,
          }),
        ],
      },
      {
        recursionLimit: recursionLimit,
        configurable: {
          trace: span,
          thread_id: runnableConfig.configurable?.thread_id,
          sendMessagesInTelemetry: sendMessagesInTelemetry,
        },
      }
    );

    await workflowEvents.dispatchAction(
      "research",
      {
        title: `产品需求文档（PRD）“${state.reqName}”的调研已完成`,
        output: response.structuredResponse.referenceInformation,
      },
      runnableConfig,
      researchCorrelationId
    );

    span?.end({
      statusMessage: "Research completed successfully!",
    });

    return {
      referenceInformation: response.structuredResponse.referenceInformation,
    };
  };
};

// Generate Initial Stories Node
export const buildGenerateStoriesNode = (
  modelProvider: LangChainModelProvider
) => {
  return async (
    state: IUserStoryWorkflowStateAnnotation["State"],
    runnableConfig: UserStoryWorkflowRunnableConfig
  ) => {
    const { trace, sendMessagesInTelemetry = false } =
      runnableConfig?.configurable ?? {};

    const span = trace?.span({
      name: "generate-stories",
    });

    const generateCorrelationId = uuid();

    try {
      await workflowEvents.dispatchThinking(
        "generate-stories",
        {
          title:
            state.feedbackLoops === 0
              ? `正在根据产品需求文档（PRD）“${state.reqName}”生成用户故事`
              : `正在完善产品需求文档（PRD）“${state.reqName}”的用户故事`,
        },
        runnableConfig,
        generateCorrelationId
      );

      // Use existing refinePrompt logic
      const prompt = refinePrompt({
        reqName: state.reqName,
        reqDesc: state.reqDesc,
        extraContext: state.extraContext,
        referenceInformation: state.referenceInformation,
        technologies: state.technicalDetails,
        features:
          state.stories.length > 0
            ? JSON.stringify({ features: state.stories })
            : undefined,
        evaluation: state.evaluation,
      });

      const generation = span?.generation({
        name: "llm",
        model: modelProvider.getModel().id,
        environment: process.env.APP_ENVIRONMENT,
        input: sendMessagesInTelemetry
          ? state.messages.length > 0
            ? state.messages
            : [new HumanMessage(prompt)]
          : undefined,
      });

      // LLM Call
      const model = modelProvider.getChatModel();
      const response = await model.invoke(prompt);
      console.log(response);

      generation?.end({
        usage: {
          input: response.usage_metadata?.input_tokens,
          output: response.usage_metadata?.output_tokens,
          total: response.usage_metadata?.total_tokens,
        },
        output: sendMessagesInTelemetry ? response : undefined,
      });

      let parsedStories;
      try {
        // Use existing JSON repair utility
        const responseText =
          typeof response === "string" ? response : response.content.toString();
        let cleanedResponse = repairJSON(responseText);
        parsedStories = JSON.parse(cleanedResponse);
      } catch (error) {
        console.error("Error parsing LLM response:", error);
        span?.end({
          level: "ERROR",
          statusMessage: `Error parsing LLM response: ${error}`,
        });
        throw new Error("大语言模型返回的响应格式无效");
      }

      console.log("[user-story-node] Successfully parsed stories:", {
        storiesCount: parsedStories.features?.length || 0,
      });

      await workflowEvents.dispatchAction(
        "generate-stories",
        {
          title:
            state.feedbackLoops === 0
              ? `已根据产品需求文档（PRD）“${state.reqName}”生成 ${
                  parsedStories.features?.length || 0
                } 个用户故事`
              : `已完善产品需求文档（PRD）“${state.reqName}”的 ${
                  parsedStories.features?.length || 0
                } 个用户故事`,
          input: prompt,
          output: JSON.stringify(parsedStories.features || []),
        },
        runnableConfig,
        generateCorrelationId
      );

      span?.end({
        statusMessage: "Successfully generated user stories",
      });

      return {
        stories: parsedStories.features || [],
        feedbackLoops: state.feedbackLoops + 1,
        messages: [...state.messages, new HumanMessage(prompt)],
      };
    } catch (error) {
      const message = `[user-story-workflow] Error in generate-stories node: ${error}`;
      span?.end({
        level: "ERROR",
        statusMessage: message,
      });

      await workflowEvents.dispatchError(
        "generate-stories",
        { title: `产品需求文档（PRD）“${state.reqName}”的用户故事生成失败` },
        runnableConfig,
        generateCorrelationId
      );

      // Return current state to avoid breaking the workflow
      return {
        feedbackLoops: state.feedbackLoops + 1,
        isComplete: true, // Force completion on error
      };
    }
  };
};

// Evaluate Stories Node
export const buildEvaluateStoriesNode = (
  modelProvider: LangChainModelProvider
) => {
  return async (
    state: IUserStoryWorkflowStateAnnotation["State"],
    runnableConfig: UserStoryWorkflowRunnableConfig
  ) => {
    const { trace, sendMessagesInTelemetry = false } =
      runnableConfig.configurable ?? {};
    const span = trace?.span({
      name: "evaluate-stories",
    });

    const evaluateCorrelationId = uuid();

    try {
      if (state.stories.length === 0) {
        const message = "No stories to evaluate";
        span?.end({
          statusMessage: message,
        });

        await workflowEvents.dispatchAction(
          "evaluate-stories",
          {
            title: "没有可供评估的用户故事",
          },
          runnableConfig,
          evaluateCorrelationId
        );

        return {
          evaluation: message,
          isComplete: true,
        };
      }

      await workflowEvents.dispatchThinking(
        "evaluate-stories",
        {
          title:
            "正在评估已生成用户故事的质量和完整性",
        },
        runnableConfig,
        evaluateCorrelationId
      );

      // Use existing evaluatePrompt
      const prompt = evaluatePrompt({
        reqName: state.reqName,
        reqDesc: state.reqDesc,
        features: JSON.stringify(state.stories),
      });

      const generation = span?.generation({
        name: "llm",
        model: modelProvider.getModel().id,
        input: sendMessagesInTelemetry
          ? state.messages.length > 0
            ? state.messages
            : [new HumanMessage(prompt)]
          : undefined,
      });

      const model = modelProvider.getChatModel();
      const response = await model.invoke(prompt);

      generation?.end({
        usage: {
          input: response.usage_metadata?.input_tokens,
          output: response.usage_metadata?.output_tokens,
          total: response.usage_metadata?.total_tokens,
        },
        output: sendMessagesInTelemetry ? response : undefined,
      });

      // Check if approved
      const responseText =
        typeof response === "string" ? response : response.content.toString();
      const isApproved = responseText.includes(
        "APPROVED AND READY FOR REFINEMENT"
      );

      const isComplete = isApproved || state.feedbackLoops >= 3;

      await workflowEvents.dispatchAction(
        "evaluate-stories",
        {
          title: isApproved
            ? "用户故事已成功生成"
            : isComplete
            ? "已达到最大评估次数，正在结束评估"
            : "用户故事需要完善，正在继续迭代",
        },
        runnableConfig,
        evaluateCorrelationId
      );

      span?.end({
        statusMessage: isApproved
          ? "Stories approved"
          : "Stories need refinement",
      });

      return {
        evaluation: response,
        isComplete: isComplete, // Max 3 feedback loops
        messages: [...state.messages, new HumanMessage(prompt)],
      };
    } catch (error) {
      const message = `Error in evaluate-stories node: ${error}`;
      console.error(message, error);
      span?.end({
        level: "ERROR",
        statusMessage: message,
      });

      await workflowEvents.dispatchError(
        "evaluate-stories",
        {
          title: `产品需求文档（PRD）“${state.reqName}”的用户故事评估失败`,
        },
        runnableConfig,
        evaluateCorrelationId
      );

      // Return current state to avoid breaking the workflow
      return {
        isComplete: true, // Force completion on error
      };
    }
  };
};

// Decide whether to continue or exit
export const shouldContinueEdge = (
  state: IUserStoryWorkflowStateAnnotation["State"]
) => {
  if (state.isComplete) {
    return "complete";
  }
  return "needs_refinement";
};
