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
  ado: {
    title: '从 Azure DevOps 拉取',
    serviceName: 'Azure DevOps',
    itemLabels: {
      topLevel: '产品需求',
      midLevel: '用户故事',
      bottomLevel: '任务',
    },
  },
  jira: {
    title: '从 Jira 拉取',
    serviceName: 'Jira',
    itemLabels: {
      topLevel: '产品需求',
      midLevel: '用户故事',
      bottomLevel: '任务',
    },
  },
};
