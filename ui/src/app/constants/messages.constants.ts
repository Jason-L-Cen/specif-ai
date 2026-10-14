import { t as uiText } from "../i18n/translate";
export const APP_INFO_COMPONENT_SUCCESS_MESSAGES = {
  BRD_UPDATED_SUCCESSFULLY: uiText("业务需求已更新。"),
  PRD_UPDATED_SUCCESSFULLY:
    uiText("产品需求已更新，请根据需要重新生成用户故事。"),
  NFR_UPDATED_SUCCESSFULLY: uiText("非功能需求已更新。"),
  UIR_UPDATED_SUCCESSFULLY: uiText("用户界面需求已更新。"),
  BP_UPDATED_SUCCESSFULLY: uiText("业务流程已更新。"),
};

export const APP_INFO_COMPONENT_ERROR_MESSAGES = {
  BRD_UPDATE_ERROR: uiText("更新业务需求失败。"),
  PRD_UPDATE_ERROR: uiText("更新产品需求失败。"),
  NFR_UPDATE_ERROR: uiText("更新非功能需求失败。"),
  UIR_UPDATE_ERROR: uiText("更新用户界面需求失败。"),
  BP_UPDATE_ERROR: uiText("更新业务流程失败。"),
  REQUIRES_PRD_OR_BRD: uiText("创建业务流程前，请至少添加一条未归档的产品需求（PRD）或业务需求（BRD）。"),
};

export const FEATURE_BREAKDOWN_COMPONENT_SUCCESS_MESSAGES = {
  ADDED_USER_STORY_SUCCESSFULLY:
    uiText("用户故事已添加，请根据需要将其拆解为任务。"),
  UPDATED_USER_STORY_SUCCESSFULLY:
    uiText("用户故事已更新，请根据需要将其拆解为任务。"),
  ADDED_TASK_SUCCESSFULLY:
    uiText("任务已添加，可使用 AI 功能辅助实现。"),
  UPDATED_TASK_SUCCESSFULLY:
    uiText("任务已更新，可使用 AI 功能辅助实现。"),
};

export const FEATURE_BREAKDOWN_COMPONENT_ERROR_MESSAGES = {
  ADD_USER_STORY_ERROR: uiText("添加用户故事失败。"),
  UPDATE_USER_STORY_ERROR: uiText("更新用户故事失败。"),
  ADD_TASK_ERROR: uiText("添加任务失败。"),
  UPDATE_TASK_ERROR: uiText("更新任务失败。"),
};

export const LOGIN_ERROR_MESSAGES = {
  ON_INCORRECT_PASSCODE: uiText("访问码不正确，请输入正确的访问码。"),
  ON_GENERIC_ERROR: uiText("发生错误，请稍后重试。"),
  ON_EMPTY_PASSCODE: uiText("请输入访问码"),
};

export const FORM_ERROR_MESSAGES: { [key in string]: string } = {
  required: uiText("此项为必填项"),
};

export const PROJECT_ERROR_MESSAGES = {
  PROJECT_CREATION_ABORTED: uiText("已取消生成解决方案需求"),
};
