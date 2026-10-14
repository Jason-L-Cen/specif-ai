import { t as appText } from "../language";
import AzureOpenAIHandler from './providers/azure-openai';
import LLMHandler from './llm-handler';
import { DEEPSEEK_BASE_URL, LLMError, LLMProvider } from './llm-types';
import AnthropicHandler from './providers/anthropic';
import BedrockHandler from './providers/bedrock';
import GeminiHandler from './providers/gemini';
import OllamaHandler from './providers/ollama';
import OpenAIHandler from './providers/openai';
import OpenRouterHandler from './providers/openrouter';

// Export base types and interfaces
export {
  LLMProvider,
  Message,
  ModelInfo,
  LLMConfig,
  LLMError
} from './llm-types';

// Export base handler
export { default as LLMHandler } from './llm-handler';

// Export provider implementations
export { default as AzureOpenAIHandler } from './providers/azure-openai';
export { default as OpenAIHandler } from './providers/openai';
export { default as AnthropicHandler } from './providers/anthropic';
export { default as BedrockHandler } from './providers/bedrock';
export { default as OllamaHandler } from './providers/ollama';
export { default as GeminiHandler } from './providers/gemini';
export { default as OpenRouterHandler } from './providers/openrouter';

/**
 * Creates an instance of the appropriate LLM handler based on the specified provider.
 * @param provider - The LLM provider to use (e.g., "openai", "anthropic")
 * @param config - Configuration options for the LLM provider
 * @returns An instance of the corresponding LLM handler
 */
export function buildLLMHandler(provider: LLMProvider | string, config: Record<string, any>): LLMHandler {
  const providerName = typeof provider === 'string' ? provider : String(provider);

  switch (providerName.toLowerCase()) {
    case LLMProvider.OPENAI_NATIVE:
      return new OpenAIHandler(config);
    case LLMProvider.DEEPSEEK:
      return new OpenAIHandler({ ...config, baseUrl: DEEPSEEK_BASE_URL }, 'deepseek');
    case LLMProvider.ANTHROPIC:
      return new AnthropicHandler(config);
    case LLMProvider.BEDROCK:
      return new BedrockHandler(config);
    case LLMProvider.OLLAMA:
      return new OllamaHandler(config);
    case LLMProvider.GEMINI:
      return new GeminiHandler(config);
    case LLMProvider.OPENAI:
      return new AzureOpenAIHandler(config);
    case LLMProvider.OPENROUTER:
      return new OpenRouterHandler(config);
    default:
      throw new LLMError(
        appText("无效的模型服务商：{0}。可用服务商： {1}", [provider, Object.values(LLMProvider).join(', ')]),
        'builder'
      );
  }
}
