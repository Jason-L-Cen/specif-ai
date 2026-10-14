import { t as uiText } from "../i18n/translate";
import { getProviderModels } from './llm.models.constants';
export interface ProviderField {
  name: string;
  type: 'text' | 'password' | 'number' | 'checkbox' | 'select';
  label: string;
  required?: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  placeholder?: string;
  useAutocomplete?: boolean;
}

export interface ProviderConfig {
  fields: ProviderField[];
}

const BEDROCK_REGIONS = [
  { value: 'us-east-1', label: 'us-east-1' },
  { value: 'us-west-2', label: 'us-west-2' },
  { value: 'ap-southeast-1', label: 'ap-southeast-1' },
  { value: 'ap-northeast-1', label: 'ap-northeast-1' },
  { value: 'eu-central-1', label: 'eu-central-1' },
];

const getModelOptions = async(provider: string) => {
  return (await getProviderModels(provider)).map((model) => ({
    value: model,
    label: model,
  }));
};
export async function getLLMProviderConfig(provider: string) {
  const options = await getModelOptions(provider);
  const LLM_PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
    deepseek: {
      fields: [
        {
          name: 'apiKey',
          type: 'password',
          label: uiText("API 密钥"),
          required: true,
          placeholder: uiText("请输入 DeepSeek API 密钥"),
        },
        {
          name: 'model',
          type: 'select',
          label: uiText("模型"),
          required: true,
          defaultValue: 'deepseek-flash',
          options,
          useAutocomplete: false,
        },
      ],
    },
    ollama: {
      fields: [
        {
          name: 'baseUrl',
          type: 'text',
          label: uiText("服务地址"),
          required: true,
          placeholder: 'http://localhost:11434',
          defaultValue: 'http://localhost:11434'
        },
        {
          name: 'model',
          type: 'text',
          label: uiText("模型"),
          required: true,
          placeholder: uiText("请输入模型名称（例如 llama2、codellama）")
        }
      ]
    },
    openrouter: {
      fields: [
        {
          name: 'apiKey',
          type: 'password',
          label: uiText("API 密钥"),
          required: true,
          placeholder: uiText("请输入 OpenRouter API 密钥"),
        },
        {
          name: 'model',
          type: 'select',
          label: uiText("模型"),
          required: true,
          options: options,
          useAutocomplete: false,
        },
        {
          name: 'baseUrl',
          type: 'text',
          label: uiText("服务地址（可选）"),
          placeholder: uiText("服务地址"),
          defaultValue: 'https://openrouter.ai/api/v1',
        },
      ],
    },
    openai: {
      fields: [
        {
          name: 'endpoint',
          type: 'text',
          label: uiText("服务地址"),
          required: true,
          placeholder: 'https://your-resource.openai.azure.com/',
        },
        {
          name: 'apiKey',
          type: 'password',
          label: uiText("API 密钥"),
          required: true,
          placeholder: uiText("请输入 Azure OpenAI API 密钥"),
        },
        {
          name: 'deployment',
          type: 'text',
          label: uiText("部署 ID"),
          required: true,
          placeholder: uiText("请输入模型部署名称"),
        },
        {
          name: 'apiVersion',
          type: 'text',
          label: uiText("API 版本"),
          required: true,
          placeholder: uiText("例如 2023-05-15"),
          defaultValue: '2024-09-01-preview',
        },
      ],
    },
    'openai-native': {
      fields: [
        {
          name: 'apiKey',
          type: 'password',
          label: uiText("API 密钥"),
          required: true,
          placeholder: uiText("请输入 OpenAI API 密钥"),
        },
        {
          name: 'model',
          type: 'select',
          label: uiText("模型"),
          required: true,
          options: options,
          useAutocomplete: false,
        },
      ],
    },
    bedrock: {
      fields: [
        {
          name: 'model',
          type: 'select',
          label: uiText("模型"),
          required: true,
          options: options,
          useAutocomplete: false,
        },
        {
          name: 'accessKeyId',
          type: 'text',
          label: uiText("访问密钥 ID"),
          required: true,
          placeholder: uiText("请输入 AWS 访问密钥 ID"),
        },
        {
          name: 'secretAccessKey',
          type: 'password',
          label: uiText("秘密访问密钥"),
          required: true,
          placeholder: uiText("请输入 AWS 秘密访问密钥"),
        },
        {
          name: 'sessionToken',
          type: 'password',
          label: uiText("会话令牌"),
          placeholder: uiText("请输入 AWS 会话令牌（可选）"),
        },
        {
          name: 'region',
          type: 'select',
          label: uiText("区域"),
          required: true,
          options: BEDROCK_REGIONS,
          useAutocomplete: false,
        },
        {
          name: 'useCrossRegionInference',
          type: 'checkbox',
          label: uiText("启用跨区域推理"),
          defaultValue: false,
        },
      ],
    },
    gemini: {
      fields: [
        {
          name: 'apiKey',
          type: 'password',
          label: uiText("API 密钥"),
          required: true,
          placeholder: uiText("请输入 Google API 密钥"),
        },
        {
          name: 'model',
          type: 'select',
          label: uiText("模型"),
          required: true,
          options: options,
          useAutocomplete: false,
        },
      ],
    },
    anthropic: {
      fields: [
        {
          name: 'apiKey',
          type: 'password',
          label: uiText("API 密钥"),
          required: true,
          placeholder: uiText("请输入 Anthropic API 密钥"),
        },
        {
          name: 'baseUrl',
          type: 'text',
          label: uiText("服务地址（可选）"),
          placeholder: 'https://api.anthropic.com',
          defaultValue: 'https://api.anthropic.com',
        },
        {
          name: 'maxRetries',
          type: 'number',
          label: uiText("最大重试次数"),
          defaultValue: 3,
        },
        {
          name: 'model',
          type: 'select',
          label: uiText("模型"),
          required: true,
          options: options,
          useAutocomplete: false,
        },
      ],
    },
  };
  return LLM_PROVIDER_CONFIGS[provider];
}
