import { t as appText } from "../../services/language";
import { chatUpdateRequirementSchema, type ChatUpdateRequirementResponse } from '../../schema/requirement/chat.schema';
import { LLMUtils } from '../../services/llm/llm-utils';
import { buildLLMHandler } from '../../services/llm';
import { store } from '../../services/store';
import type { IpcMainInvokeEvent } from 'electron';
import type { LLMConfigModel } from '../../services/llm/llm-types';
import { chatUpdateRequirementPrompt } from '../../prompts/requirement/chat';
import { repairJSON } from '../../utils/custom-json-parser';
import { OPERATIONS } from '../../helper/constants';
import { traceBuilder } from '../../utils/trace-builder';
import { LLMHandlerGuardrails, GuardrailsShouldBlock } from "../../guardrails";

export async function chatUpdateRequirement(event: IpcMainInvokeEvent, data: unknown): Promise<ChatUpdateRequirementResponse> {
  try {
    const llmConfig = store.get<LLMConfigModel>('llmConfig');
    if (!llmConfig) {
      throw new Error(appText("未找到大语言模型配置"));
    }

    console.log('[chat-update-requirement] Using LLM config:', llmConfig);
    const validatedData = chatUpdateRequirementSchema.parse(data);
    
    const {
      name,
      description,
      type,
      requirement,
      userMessage,
      requirementAbbr,
      chatHistory,
      knowledgeBase,
      bedrockConfig,
      brds
    } = validatedData;

    // Generate prompt
    const prompt = chatUpdateRequirementPrompt({
      name,
      description,
      type,
      requirement,
      userMessage,
      requirementAbbr,
      brds
    });

    // Generate knowledge base constraint prompt if provided
    let basePrompt = prompt;
    if (knowledgeBase) {
      if (!bedrockConfig) {
        throw new Error(appText("使用知识库时需要配置 Bedrock"));
      }
      basePrompt = await LLMUtils.generateKnowledgeBasePromptConstraint(
        knowledgeBase,
        prompt,
        bedrockConfig
      );
    }

    // Prepare messages for LLM
    const messages = await LLMUtils.prepareMessages(basePrompt, chatHistory);

    const handler = LLMHandlerGuardrails(
      buildLLMHandler(
        llmConfig.activeProvider,
        llmConfig.providerConfigs[llmConfig.activeProvider].config
      )
    );

    const traceName = traceBuilder(requirementAbbr, OPERATIONS.CHAT)
    const response = await handler.invoke(messages, null, traceName);
    console.log('[chat-update-requirement] LLM Response:', response);

    let result;
    try {
      const cleanedResponse = repairJSON(response);
      const parsed = JSON.parse(cleanedResponse);
      if (!parsed.response) {
        throw new Error(appText("响应结构无效"));
      }
      result = parsed;
    } catch (error) {
      console.error('[chat-update-requirement] Error parsing LLM response:', error);
      throw new Error(appText("无法将大语言模型的响应解析为 JSON"));
    }

    return {
      response: result.response
    };
  } catch (error) {
    console.error('Error in chatUpdateRequirement:', error);
    if (error instanceof GuardrailsShouldBlock) {
      console.log("[chat-update-requirement] Injection or Leaking detected");
      return {
        response: appText("请求未能处理"),
        blocked: true,
        blockedReason:
          appText("提示词包含违反安全策略的恶意内容。"),
      };
    }
    throw error;
  }
}
