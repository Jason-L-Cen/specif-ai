import { HumanMessage } from "@langchain/core/messages";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { WorkflowEventsService } from "../../services/events/workflow-events.service";
import { LangChainModelProvider } from "../../services/llm/langchain-providers/base";
import { ITool } from "../common/types";
import { buildReactAgent } from "../react-agent";
import { IStrategicInitiativeWorkflowStateAnnotation } from "./state";
import { StrategicInitiativeWorkflowRunnableConfig } from "./types";
import { getSIPrompt } from "../../prompts/core/strategic-initiative";
import { 
  getResearchPrompt, 
  getResearchSummaryPrompt,
  getStrategicInitiativePrompt, 
  getStrategicInitiativeResponseFormatPrompt 
} from "../../prompts/core/strategic-initiative";

const workflowEvents = new WorkflowEventsService("strategic-initiative");

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
    state: IStrategicInitiativeWorkflowStateAnnotation["State"],
    runnableConfig: StrategicInitiativeWorkflowRunnableConfig
  ) => {
    const { trace, sendMessagesInTelemetry = false } = runnableConfig.configurable ?? {};
    const span = trace?.span({ name: "research" });

    if (tools.length === 0) {
      span?.end({ statusMessage: "No tools are passed so skipping research phase" });
      await workflowEvents.dispatchAction(
        "research",
        { title: "没有可用工具，已跳过调研阶段" },
        runnableConfig
      );
      return { referenceInformation: "" };
    }

    const researchCorrelationId = uuid();
    await workflowEvents.dispatchThinking(
      "research",
      { title: "正在根据业务提案背景进行调研" },
      runnableConfig,
      researchCorrelationId
    );

    const agent = buildReactAgent({
      model: model,
      tools: tools,
      responseFormat: {
        prompt: getResearchSummaryPrompt(),
        schema: z.object({
          referenceInformation: z.string(),
        }),
      },
      checkpointer: checkpointer,
    });

    const recursionLimit = Math.min(Math.max(64, tools.length * 2 * 3 + 1), 128);

    const researchUrls = state.requirement?.researchUrls || [];
    const hasResearchUrls = Array.isArray(researchUrls) && researchUrls.length > 0;
    
    const researchPrompt = getResearchPrompt(state.project, state.requirement);

    const response = await agent.invoke(
      { messages: [new HumanMessage(researchPrompt)] },
      {
        recursionLimit: recursionLimit,
        configurable: {
          trace: span,
          thread_id: runnableConfig.configurable?.thread_id,
          sendMessagesInTelemetry: sendMessagesInTelemetry
        },
        signal: runnableConfig.signal,
      }
    );

    let referenceInformation = response.structuredResponse.referenceInformation;
    
    if (referenceInformation.includes('Could you please provide') || 
        referenceInformation.includes('please provide') ||
        referenceInformation.includes('need more information') ||
        referenceInformation.includes('need additional information')) {
      
      const usefulParts = referenceInformation
        .replace(/Could you please provide.*$/gm, '')
        .replace(/Please provide.*$/gm, '')
        .replace(/I need more information.*$/gm, '')
        .replace(/I need additional information.*$/gm, '')
        .trim();
      
      if (usefulParts.length > 100) {
        referenceInformation = usefulParts;
      } else {
        referenceInformation = `请根据“${state.requirement?.title || state.project.description}”的已有信息，继续生成完整的业务提案。`;
      }
    }
    
    await workflowEvents.dispatchAction(
      "research",
      {
        title: "调研已完成，已整理战略举措生成所需的摘要",
        output: referenceInformation,
      },
      runnableConfig,
      researchCorrelationId
    );

    span?.end({ statusMessage: "Research completed successfully!" });
    return { referenceInformation };
  };
};

type BuildGenerationNodeParams = {
  model: LangChainModelProvider;
  checkpointer?: BaseCheckpointSaver | false | undefined;
};

export const buildStrategicInitiativeGenerationNode = ({
  model,
  checkpointer,
}: BuildGenerationNodeParams) => {
  return async (
    state: IStrategicInitiativeWorkflowStateAnnotation["State"],
    runnableConfig: StrategicInitiativeWorkflowRunnableConfig
  ) => {
    const { trace, sendMessagesInTelemetry = false } = runnableConfig.configurable ?? {};
    const span = trace?.span({ name: "generate-strategic-initiative" });

    try {
      const strategicInitiativeGenerationCorrelationId = uuid();
      await workflowEvents.dispatchThinking(
        "strategic-initiative-generation",
        { title: "正在生成战略举措提案" },
        runnableConfig,
        strategicInitiativeGenerationCorrelationId
      );

      const agent = buildReactAgent({
        model: model,
        tools: [],
        responseFormat: {
          prompt: getStrategicInitiativeResponseFormatPrompt(),
          schema: z.object({
            title: z.string().describe("A concise, descriptive title for the business proposal (without mentioning 'SI' or 'strategic initiative')"),
            requirement: z.string().describe("The complete business proposal content in properly escaped JSON string format"),
          }),
        },
        checkpointer: checkpointer,
      });

      const strategicInitiativeParams = {
        project: state.project,
        requirement: state.requirement,
        requestId: uuid(),
        requirementAbbr: "SI" as const
      };

      const prompt = getSIPrompt(strategicInitiativeParams);
      
      const solutionInfo = {
        name: state.project.solution.name,
        description: state.project.solution.description,
        techDetails: state.project.solution.techDetails
      };
      
      const strategicInitiativePrompt = getStrategicInitiativePrompt(
        state.referenceInformation, 
        solutionInfo
      );
      
      const response = await agent.invoke(
        {
          messages: [
            new HumanMessage(`${prompt}\n\n${strategicInitiativePrompt}`),
          ],
        },
        {
          configurable: {
            trace: span,
            thread_id: runnableConfig.configurable?.thread_id,
            sendMessagesInTelemetry: sendMessagesInTelemetry
          },
          signal: runnableConfig.signal,
        }
      );

      await workflowEvents.dispatchAction(
        "strategic-initiative-generation",
        {
          title: "战略举措提案已成功生成",
          output: {
            title: response.structuredResponse.title,
            requirement: response.structuredResponse.requirement,
          }
        },
        runnableConfig,
        strategicInitiativeGenerationCorrelationId
      );

      span?.end({ statusMessage: "Successfully generated strategic initiative proposal" });
      return {
        strategicInitiativeDraft: {
          title: response.structuredResponse.title,
          requirement: response.structuredResponse.requirement,
        },
      };
    } catch (error) {
      span?.end({ level: "ERROR" });
      return {
        strategicInitiativeDraft: {
          title: state.requirement?.title || "生成战略举措时出错",
          requirement: `生成战略举措提案时出错：${error}`,
        },
      };
    }
  };
};
