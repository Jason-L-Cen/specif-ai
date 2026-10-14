import { t as appText } from "../../language";
import { AzureChatOpenAI } from "@langchain/openai";
import { LLMConfig, LLMError } from "../llm-types";
import { LangChainModelProvider } from "./base";
import { LangChainChatGuardrails } from "@presidio-dev/hai-guardrails"
import { guardrailsEngine, langChainGuardrailsHandler } from "../../../guardrails";
interface AzureOpenAIConfig extends LLMConfig {
  apiKey: string;
  endpoint: string;
  deployment: string;
  apiVersion?: string;
}

export class AzureOpenAILangChainProvider implements LangChainModelProvider {
  protected configData: AzureOpenAIConfig;
  private model: AzureChatOpenAI;

  constructor(config: Partial<AzureOpenAIConfig>) {
    this.configData = this.getConfig(config);
    this.model = LangChainChatGuardrails(
      new AzureChatOpenAI({
        azureOpenAIApiKey: this.configData.apiKey,
        azureOpenAIEndpoint: this.configData.endpoint,
        azureOpenAIApiDeploymentName: this.configData.deployment,
        azureOpenAIApiVersion:
          this.configData.apiVersion || "2024-09-01-preview",
      }),
      guardrailsEngine,
      langChainGuardrailsHandler
    );
  }

  getConfig(config: Partial<AzureOpenAIConfig>): AzureOpenAIConfig {
    if (!config.apiKey) {
      throw new LLMError(appText("Azure OpenAI API 密钥不能为空"), "openai");
    }
    if (!config.endpoint) {
      throw new LLMError(appText("Azure OpenAI 服务端点不能为空"), "openai");
    }
    if (!config.deployment) {
      throw new LLMError(appText("Azure OpenAI 部署 ID 不能为空"), "openai");
    }

    return {
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      deployment: config.deployment,
      apiVersion: config.apiVersion || "2024-09-01-preview",
    };
  }

  getChatModel(): AzureChatOpenAI {
    return this.model;
  }

  getModel() {
    return {
      id: this.configData.deployment,
      provider: "azure-openai",
      info: {},
    };
  }

  isValid(): boolean {
    try {
      return Boolean(
        this.configData.apiKey &&
          this.configData.endpoint &&
          this.configData.deployment
      );
    } catch (error) {
      return false;
    }
  }
}

export default AzureOpenAILangChainProvider;
