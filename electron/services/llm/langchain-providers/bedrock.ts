import { t as appText } from "../../language";
import { ChatBedrockConverse } from "@langchain/aws";
import { LLMConfig, LLMError, ModelInfoV1 } from "../llm-types";
import { LangChainModelProvider } from "./base";
import { LangChainChatGuardrails } from "@presidio-dev/hai-guardrails"
import { guardrailsEngine, langChainGuardrailsHandler } from "../../../guardrails";

export enum BedrockModelId {
  AMAZON_NOVA_PRO_V1 = "amazon.nova-pro-v1:0",
  AMAZON_NOVA_LITE_V1 = "amazon.nova-lite-v1:0",
  AMAZON_NOVA_MICRO_V1 = "amazon.nova-micro-v1:0",
  ANTHROPIC_CLAUDE_3_7_SONNET_20250219 = "anthropic.claude-3-7-sonnet-20250219-v1:0",
  ANTHROPIC_CLAUDE_3_5_SONNET_20241022 = "anthropic.claude-3-5-sonnet-20241022-v2:0",
  ANTHROPIC_CLAUDE_3_5_HAIKU_20241022 = "anthropic.claude-3-5-haiku-20241022-v1:0",
  ANTHROPIC_CLAUDE_3_5_SONNET_20240620 = "anthropic.claude-3-5-sonnet-20240620-v1:0",
  ANTHROPIC_CLAUDE_3_OPUS_20240229 = "anthropic.claude-3-opus-20240229-v1:0",
  ANTHROPIC_CLAUDE_3_SONNET_20240229 = "anthropic.claude-3-sonnet-20240229-v1:0",
  ANTHROPIC_CLAUDE_3_HAIKU_20240307 = "anthropic.claude-3-haiku-20240307-v1:0",
  DEEPSEEK_R1_V1 = "deepseek.r1-v1:0",
  ANTHROPIC_CLAUDE_OPUS_4_20250514 = "anthropic.claude-opus-4-20250514-v1:0",
  ANTHROPIC_CLAUDE_SONNET_4_20250514 = "anthropic.claude-sonnet-4-20250514-v1:0",
}

const BedrockModels: Record<BedrockModelId, ModelInfoV1> = {
  [BedrockModelId.AMAZON_NOVA_PRO_V1]: {
    maxTokens: 5000,
    contextWindow: 300_000,
  },
  [BedrockModelId.AMAZON_NOVA_LITE_V1]: {
    maxTokens: 5000,
    contextWindow: 300_000,
  },
  [BedrockModelId.AMAZON_NOVA_MICRO_V1]: {
    maxTokens: 5000,
    contextWindow: 128_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_3_7_SONNET_20250219]: {
    maxTokens: 8192,
    contextWindow: 200_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_3_5_SONNET_20241022]: {
    maxTokens: 8192,
    contextWindow: 200_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_3_5_HAIKU_20241022]: {
    maxTokens: 8192,
    contextWindow: 200_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_3_5_SONNET_20240620]: {
    maxTokens: 8192,
    contextWindow: 200_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_3_OPUS_20240229]: {
    maxTokens: 4096,
    contextWindow: 200_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_3_SONNET_20240229]: {
    maxTokens: 4096,
    contextWindow: 200_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_3_HAIKU_20240307]: {
    maxTokens: 4096,
    contextWindow: 200_000,
  },
  [BedrockModelId.DEEPSEEK_R1_V1]: {
    maxTokens: 8_000,
    contextWindow: 64_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_OPUS_4_20250514]: {
    maxTokens: 4096,
    contextWindow: 200_000,
  },
  [BedrockModelId.ANTHROPIC_CLAUDE_SONNET_4_20250514]: {
    maxTokens: 4096,
    contextWindow: 200_000,
  },
};

interface BedrockConfig extends LLMConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  model: BedrockModelId;
  useCrossRegionInference?: boolean;
}

export class BedrockLangChainProvider implements LangChainModelProvider {
  protected configData: BedrockConfig;
  private model: ChatBedrockConverse;

  constructor(config: Partial<BedrockConfig>) {
    this.configData = this.getConfig(config);
    const modelInfo = BedrockModels[this.configData.model];

    this.model = LangChainChatGuardrails(
      new ChatBedrockConverse({
        model: this.transformModelId(),
        region: this.configData.region,
        credentials: {
          accessKeyId: this.configData.accessKeyId,
          secretAccessKey: this.configData.secretAccessKey,
          sessionToken: this.configData.sessionToken,
        },
        maxTokens: modelInfo.maxTokens ?? 8192,
      }),
      guardrailsEngine,
      langChainGuardrailsHandler
    );
  }

  private transformModelId(): string {
    if (this.configData.useCrossRegionInference) {
      const regionPrefix = this.configData.region.slice(0, 3);

      switch (regionPrefix) {
        case "us-":
          return `us.${this.getModel().id}`;
        case "eu-":
          return `eu.${this.getModel().id}`;
        case "ap-":
          return `apac.${this.getModel().id}`;
        default:
          // cross region inference is not supported in this region, falling back to default model
          return this.getModel().id;
      }
    }

    return this.getModel().id;
  }

  getConfig(config: Partial<BedrockConfig>): BedrockConfig {
    if (!config.region) {
      throw new LLMError(appText("AWS 区域不能为空"), "bedrock");
    }
    if (!config.accessKeyId) {
      throw new LLMError(appText("AWS 访问密钥 ID 不能为空"), "bedrock");
    }
    if (!config.secretAccessKey) {
      throw new LLMError(appText("AWS 秘密访问密钥不能为空"), "bedrock");
    }
    if (!config.model) {
      throw new LLMError(appText("模型 ID 不能为空"), "bedrock");
    }

    return {
      region: config.region,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      sessionToken: config.sessionToken,
      model: config.model,
      useCrossRegionInference: config.useCrossRegionInference || false,
    };
  }

  getChatModel(): ChatBedrockConverse {
    return this.model;
  }

  getModel() {
    const modelInfo = BedrockModels[this.configData.model];

    return {
      id: this.configData.model,
      provider: "bedrock",
      info: modelInfo,
    };
  }

  isValid(): boolean {
    try {
      return Boolean(
        this.configData.region &&
          this.configData.accessKeyId &&
          this.configData.secretAccessKey &&
          this.configData.model
      );
    } catch (error) {
      return false;
    }
  }
}
