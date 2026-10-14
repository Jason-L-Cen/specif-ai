import { t as uiText } from "../i18n/translate";
export const JIRA_TOAST = {
  SUCCESS: uiText("Jira 同步成功"),
  ERROR: uiText("Jira 同步失败"),
  INFO: uiText("已开始同步到 Jira"),
};

export const ADO_TOAST = {
  PULL_INITIATED: uiText("已开始从 Azure DevOps 拉取"),
  PUSH_INITIATED: uiText("已开始推送到 Azure DevOps"),
};

export const APP_INTEGRATIONS = {
  JIRA: {
    SUCCESS: uiText("Jira 身份验证成功"),
    DISCONNECT: uiText("已断开与 Jira 的连接"),
    ERROR: uiText("Jira 身份验证失败"),
  },
  ADO: {
    SUCCESS: uiText("已连接到 Azure DevOps"),
    DISCONNECT: uiText("已断开与 Azure DevOps 的连接"),
    ERROR: uiText("连接 Azure DevOps 失败"),
    VALIDATION_ERROR:
      uiText("Azure DevOps 凭据无效，请检查后重试"),
  },
  BEDROCK: {
    SUCCESS: uiText("AWS Bedrock 知识库配置已更新"),
    DISCONNECT: uiText("已断开与 AWS Bedrock 知识库的连接"),
    INVALID: uiText("AWS 知识库 ID 无效，请检查后重试"),
    ERROR: uiText("更新 AWS Bedrock 知识库配置失败"),
  },
};

export const DEFAULT_TOAST_DURATION = 5000;
