export const JIRA_TOAST = {
  SUCCESS: 'Jira 同步成功',
  ERROR: 'Jira 同步失败',
  INFO: '已开始同步到 Jira',
};

export const ADO_TOAST = {
  PULL_INITIATED: '已开始从 Azure DevOps 拉取',
  PUSH_INITIATED: '已开始推送到 Azure DevOps',
};

export const APP_INTEGRATIONS = {
  JIRA: {
    SUCCESS: 'Jira 身份验证成功',
    DISCONNECT: '已断开与 Jira 的连接',
    ERROR: 'Jira 身份验证失败',
  },
  ADO: {
    SUCCESS: '已连接到 Azure DevOps',
    DISCONNECT: '已断开与 Azure DevOps 的连接',
    ERROR: '连接 Azure DevOps 失败',
    VALIDATION_ERROR:
      'Azure DevOps 凭据无效，请检查后重试',
  },
  BEDROCK: {
    SUCCESS: 'AWS Bedrock 知识库配置已更新',
    DISCONNECT: '已断开与 AWS Bedrock 知识库的连接',
    INVALID: 'AWS 知识库 ID 无效，请检查后重试',
    ERROR: '更新 AWS Bedrock 知识库配置失败',
  },
};

export const DEFAULT_TOAST_DURATION = 5000;
