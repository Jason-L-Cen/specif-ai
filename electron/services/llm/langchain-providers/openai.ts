import { ChatOpenAI } from '@langchain/openai';
import { LLMConfig, LLMError, ModelInfoV1 } from '../llm-types';
import { LangChainModelProvider } from './base';
import { LangChainChatGuardrails } from '@presidio-dev/hai-guardrails';
import { guardrailsEngine, langChainGuardrailsHandler } from '../../../guardrails';

export enum OpenAiModelId {
  O3 = 'o3',
  O4_MINI = 'o4-mini',
  GPT_4_1 = 'gpt-4.1',
  GPT_4_1_MINI = 'gpt-4.1-mini',
  GPT_4_1_NANO = 'gpt-4.1-nano',
  O3_MINI = 'o3-mini',
  O1 = 'o1',
  O1_PREVIEW = 'o1-preview',
  O1_MINI = 'o1-mini',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  CHATGPT_4O_LATEST = 'chatgpt-4o-latest',
  GPT_4_5_PREVIEW = 'gpt-4.5-preview',
}

const OpenAiModels: Record<OpenAiModelId, ModelInfoV1> = {
  [OpenAiModelId.O3]: {
    maxTokens: 100_000,
    contextWindow: 200_000,
  },
  [OpenAiModelId.O4_MINI]: {
    maxTokens: 100_000,
    contextWindow: 200_000,
  },
  [OpenAiModelId.GPT_4_1]: {
    maxTokens: 32_768,
    contextWindow: 1_047_576,
  },
  [OpenAiModelId.GPT_4_1_MINI]: {
    maxTokens: 32_768,
    contextWindow: 1_047_576,
  },
  [OpenAiModelId.GPT_4_1_NANO]: {
    maxTokens: 32_768,
    contextWindow: 1_047_576,
  },
  [OpenAiModelId.O3_MINI]: {
    maxTokens: 100_000,
    contextWindow: 200_000,
  },
  [OpenAiModelId.O1]: {
    maxTokens: 100_000,
    contextWindow: 200_000,
  },
  [OpenAiModelId.O1_PREVIEW]: {
    maxTokens: 32_768,
    contextWindow: 128_000,
  },
  [OpenAiModelId.O1_MINI]: {
    maxTokens: 65_536,
    contextWindow: 128_000,
  },
  [OpenAiModelId.GPT_4O]: {
    maxTokens: 4_096,
    contextWindow: 128_000,
  },
  [OpenAiModelId.GPT_4O_MINI]: {
    maxTokens: 16_384,
    contextWindow: 128_000,
  },
  [OpenAiModelId.CHATGPT_4O_LATEST]: {
    maxTokens: 16_384,
    contextWindow: 128_000,
  },
  [OpenAiModelId.GPT_4_5_PREVIEW]: {
    maxTokens: 16_384,
    contextWindow: 128_000,
  },
};

interface OpenAIConfig extends LLMConfig {
  baseUrl?: string;
  apiKey: string;
  model: string;
  maxRetries?: number;
}

export class OpenAILangChainProvider implements LangChainModelProvider {
  protected configData: OpenAIConfig;
  private model: ChatOpenAI;

  constructor(config: Partial<OpenAIConfig>, private readonly provider: 'openai' | 'deepseek' = 'openai') {
    this.configData = this.getConfig(config);
    const modelInfo = OpenAiModels[this.configData.model as OpenAiModelId];

    this.model = LangChainChatGuardrails(
      new ChatOpenAI({
        openAIApiKey: this.configData.apiKey,
        modelName: this.configData.model,
        maxRetries: this.configData.maxRetries,
        configuration: {
          baseURL: this.configData.baseUrl,
        },
        maxTokens: modelInfo?.maxTokens,
        // shortcut: Use non-thinking mode until LangChain can replay DeepSeek reasoning_content during tool calls.
        modelKwargs: this.provider === 'deepseek' ? { thinking: { type: 'disabled' } } : undefined,
      }),
      guardrailsEngine,
      langChainGuardrailsHandler
    );
  }

  getConfig(config: Partial<OpenAIConfig>): OpenAIConfig {
    if (!config.apiKey?.trim()) {
      throw new LLMError(`${this.provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API 密钥不能为空`, this.provider);
    }
    if (!config.model?.trim()) {
      throw new LLMError('模型 ID 不能为空', this.provider);
    }

    return {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey.trim(),
      model: config.model.trim(),
      maxRetries: config.maxRetries ?? 3,
    };
  }

  getChatModel(): ChatOpenAI {
    return this.model;
  }

  getModel() {
    const modelInfo = OpenAiModels[this.configData.model as OpenAiModelId];

    return {
      id: this.configData.model,
      provider: this.provider,
      info: modelInfo || {},
    };
  }

  isValid(): boolean {
    try {
      return Boolean(this.configData.apiKey && this.configData.model);
    } catch (error) {
      return false;
    }
  }
}

export default OpenAILangChainProvider;
