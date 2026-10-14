import { t as uiText } from "../../i18n/translate";
import {
  PredefinedMCPIntegration,
  FormField,
  MCPServerOptions,
} from '../../types/mcp.types';
import { McpServerOptionsSchema } from '../../shared/mcp-schemas';

const awsBedrockKbFormFields: FormField[] = [
  {
    type: 'text',
    label: uiText("AWS 配置名称"),
    name: 'awsProfile',
    id: 'aws-profile',
    helpText: uiText("AWS 凭据文件中的配置名称。"),
    required: true,
  },
  {
    type: 'text',
    label: uiText("AWS 区域"),
    name: 'awsRegion',
    id: 'aws-region',
    helpText:
      uiText("Bedrock 知识库所在的 AWS 区域，例如 us-east-1。"),
    required: true,
    default: 'us-east-1',
  },
  {
    type: 'text',
    label: uiText("知识库筛选标签键"),
    name: 'kbInclusionTagKey',
    id: 'kb-inclusion-tag-key',
    helpText:
      uiText("指定标签键，用于筛选允许访问的知识库。"),
    required: true,
    default: 'specif-mcp-rag-kb',
  },
];

export const AWS_BEDROCK_KB_INTEGRATION: PredefinedMCPIntegration<
  typeof awsBedrockKbFormFields
> = {
  id: 'specif_awslabs.bedrock-kb-retrieval-mcp-server',
  title: uiText("AWS Bedrock 知识库"),
  description: uiText("连接到 AWS Bedrock 知识库检索服务器。"),
  iconPath: './assets/img/logo/aws_dark_bg_transparent_logo.svg',
  readmeUrl: 'https://github.com/awslabs/mcp/tree/main/src/bedrock-kb-retrieval-mcp-server',
  formFields: awsBedrockKbFormFields,

  // Function to build the MCPServerOptions object from the form data (env vars)
  buildConfig: (formData: any): MCPServerOptions => {
    const envVars: Record<string, string> = {};

    envVars['AWS_PROFILE'] = formData.awsProfile;
    envVars['AWS_REGION'] = formData.awsRegion;
    envVars['KB_INCLUSION_TAG_KEY'] = formData.kbInclusionTagKey;

    const config: MCPServerOptions = {
      transportType: 'stdio',
      command: 'uvx',
      args: ['awslabs.bedrock-kb-retrieval-mcp-server@latest'],
      env: envVars,
      disabled: false,
      metadata: {},
      name: uiText("AWS Bedrock 知识库")
    };

    // Validate the constructed config against the schema
    const validation = McpServerOptionsSchema.safeParse(config);

    if (!validation.success) {
      console.error(
        'Failed to build valid AWS Bedrock KB MCP config:',
        validation.error,
      );

      throw new Error(
        uiText("生成的 AWS Bedrock 知识库 MCP 配置无效。"),
      );
    }

    return validation.data;
  },

  // Function to populate form fields from existing MCPServerOptions (for editing)
  buildFormDataFromConfig: (options: MCPServerOptions) => {
    if (options.transportType !== 'stdio') {
      console.warn(
        'AWS Bedrock KB integration expected stdio transport, received:',
        options.transportType,
      );
      return {};
    }

    const fields = {
      awsProfile: options.env?.['AWS_PROFILE'] || '',
      awsRegion: options.env?.['AWS_REGION'] || '',
      kbInclusionTagKey: options.env?.['KB_INCLUSION_TAG_KEY'] || '',
    };

    return fields;
  },
};
