import { t as uiText } from "../i18n/translate";
export interface PmoModalConfig {
  title: string;
  serviceName: string;
  itemLabels: {
    topLevel: string;
    midLevel: string;
    bottomLevel: string;
  };
}

export const PMO_MODAL_CONFIGS: { [key: string]: PmoModalConfig } = {
  zentao: {
    title: uiText("从禅道拉取"), serviceName: uiText("禅道"),
    itemLabels: { topLevel: uiText("产品需求（父软件需求）"), midLevel: uiText("用户故事（子软件需求）"), bottomLevel: uiText("任务") },
  },
  ado: {
    title: uiText("从 Azure DevOps 拉取"),
    serviceName: 'Azure DevOps',
    itemLabels: {
      topLevel: uiText("产品需求"),
      midLevel: uiText("用户故事"),
      bottomLevel: uiText("任务"),
    },
  },
  jira: {
    title: uiText("从 Jira 拉取"),
    serviceName: 'Jira',
    itemLabels: {
      topLevel: uiText("产品需求"),
      midLevel: uiText("用户故事"),
      bottomLevel: uiText("任务"),
    },
  },
};
