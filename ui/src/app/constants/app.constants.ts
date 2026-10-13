import { environment } from '../../environments/environment';

export const APP_CONSTANTS = {
  WORKING_DIR: 'WORKING_DIR',
  VERSION: 'APP_VERSION',
  USER_NAME: 'USER_NAME',
  USER_ID: 'USER_ID',
  NEW_MODULE_FLAG: 'NEW_MODULE_FLAG',
};
export const FILTER_STRINGS = {
  BASE: 'base',
  FEATURE: 'feature',
  ARCHIVED: 'archived',
};
export const CHAT_TYPES = {
  REQUIREMENT: 'requirement',
  USERSTORY: 'userstory',
  TASK: 'task',
};

export const BP_FILE_KEYS = {
  BRD_KEY: 'selectedBRDs',
  PRD_KEY: 'selectedPRDs',
};

export const ERROR_MESSAGES = {
  GENERATE_SUGGESTIONS_FAILED: '生成建议失败',
  DELETE_ASSOCIATED_ERROR: (reqId: string, bpIds: string[]) =>
    `无法删除 ${reqId}，因为它已关联以下业务流程：${bpIds.join('、')}。`,
  DELETE_ASSOCIATED_PRDs_ERROR: (reqId: string, prdIds: string[]) =>
    `无法删除 ${reqId}，因为它已关联以下产品需求：${prdIds.join('、')}。`,
};

export const SOLUTION_CREATION_TOGGLE_MESSAGES = {
  BROWNFIELD_SOLUTION:
    '开启后，将不会为此解决方案生成业务需求或解决方案需求。',
  GREENFIELD_SOLUTION:
    '可根据解决方案的上下文创建需求',
};

export const CONFIRMATION_DIALOG = {
  DELETION: {
    TITLE: '确认删除',
    DESCRIPTION: (entityName: string) =>
      `确定要删除 <span class="font-semibold">${entityName}</span> 吗？`,
    CANCEL_BUTTON_TEXT: '取消',
    PROCEED_BUTTON_TEXT: '删除',
  },
  UNSAVED_CHANGES: {
    TITLE: '确认离开',
    DESCRIPTION:
      '此页面有尚未保存的更改。确定要放弃保存并前往其他页面吗？',
    PROCEED_BUTTON_TEXT: '留在此页',
    CANCEL_BUTTON_TEXT: '离开',
  },
  LOGOUT: {
    TITLE: '确认退出登录',
    DESCRIPTION: '确定要退出登录吗？',
    CANCEL_BUTTON_TEXT: '取消',
    PROCEED_BUTTON_TEXT: '退出登录',
  },
  JIRA_REAUTHENTICATION: {
    TITLE: '重新进行 Jira 身份验证',
    DESCRIPTION:
      'Jira 会话已过期，请重新进行身份验证后继续。',
    CANCEL_BUTTON_TEXT: '取消',
    PROCEED_BUTTON_TEXT: '重新验证',
  },
  JIRA_DETAILS_MISSING: {
    TITLE: 'Jira 集成尚未配置完成',
    DESCRIPTION:
      '缺少 Jira 配置信息。请前往集成设置，补全并保存配置后继续。',
    CANCEL_BUTTON_TEXT: '取消',
    PROCEED_BUTTON_TEXT: '打开集成设置',
  },
  CONFIRM_BRD_UPDATE: {
    TITLE: '确认更新业务需求（BRD）',
    DESCRIPTION: ({
      hasRemovedLinks,
      hasLinkedPRDs,
    }: {
      hasRemovedLinks: boolean;
      hasLinkedPRDs: boolean;
    }) => {
      let description = '';

      if (hasLinkedPRDs) {
        description =
          '关联的产品需求文档（PRD）不会自动更新。';
      }

      if (hasRemovedLinks) {
        description +=
          (description ? '\n此外，' : '') +
          '取消此业务需求（BRD）的关联后，之前添加到关联产品需求文档（PRD）中的内容仍会保留。';
      }
      description +=
        ' 这些产品需求文档（PRD）如需更新，请手动检查并修改。\n\n确定要继续吗？';
      return description;
    },
    CANCEL_BUTTON_TEXT: '取消',
    PROCEED_BUTTON_TEXT: '确认',
  },
  CONFIRM_PRD_UPDATE: {
    TITLE: '确认更新产品需求文档（PRD）',
    DESCRIPTION:
      '从之前关联的业务需求（BRD）添加到此产品需求文档（PRD）中的内容仍会保留。如需更新，请手动检查并修改。\n\n确定要继续吗？',
    CANCEL_BUTTON_TEXT: '取消',
    PROCEED_BUTTON_TEXT: '确认',
  },
};

export const REQUIREMENT_COUNT = {
  DEFAULT: 15,
  MAX: 30,
} as const;

export const REQUIREMENT_TYPE = {
  BRD: 'BRD',
  PRD: 'PRD',
  UIR: 'UIR',
  NFR: 'NFR',
  BP: 'BP',
  US: 'US',
  TASK: 'TASK',
  TC: 'TC',
  SI: 'SI',
} as const;

export const REQUIREMENT_DISPLAY_NAME_MAP = {
  [REQUIREMENT_TYPE.US]: '用户故事',
  [REQUIREMENT_TYPE.BP]: '业务流程',
  [REQUIREMENT_TYPE.BRD]: '业务需求',
  [REQUIREMENT_TYPE.NFR]: '非功能需求',
  [REQUIREMENT_TYPE.PRD]: '产品需求',
  [REQUIREMENT_TYPE.UIR]: '用户界面需求',
  [REQUIREMENT_TYPE.TASK]: '任务',
  [REQUIREMENT_TYPE.TC]: '测试用例',
  [REQUIREMENT_TYPE.SI]: '战略举措',
};

export const SPECIFAI_BASE_URL = 'https://specifai.io/current/requirement-types';
export const SPECIFAI_FALLBACK_URL = 'https://specifai.io/current/core-features';

export const SPECIFAI_REQ_DOCS = {
  [REQUIREMENT_TYPE.BRD]: `${SPECIFAI_BASE_URL}#1-business-requirements-brd`,
  [REQUIREMENT_TYPE.PRD]: `${SPECIFAI_BASE_URL}#2-product-requirements-prd`,
  [REQUIREMENT_TYPE.US]: `${SPECIFAI_BASE_URL}#3-user-stories-us`,
  [REQUIREMENT_TYPE.TASK]: `${SPECIFAI_BASE_URL}#4-tasks`,
  [REQUIREMENT_TYPE.NFR]: `${SPECIFAI_BASE_URL}#5-non-functional-requirements-nfr`,
  [REQUIREMENT_TYPE.UIR]: `${SPECIFAI_BASE_URL}#6-user-interface-requirements-uir`,
  [REQUIREMENT_TYPE.TC]: `${SPECIFAI_BASE_URL}#7-test-cases-tc`,
  [REQUIREMENT_TYPE.SI]: `${SPECIFAI_BASE_URL}#8-strategic-initiatives-si`,
  [REQUIREMENT_TYPE.BP]: `https://specifai.io/current/business-workflows`,
} as const;

const getEntityDisplayName = (folderId: string): string => {
  return (
    REQUIREMENT_DISPLAY_NAME_MAP[
      folderId as keyof typeof REQUIREMENT_DISPLAY_NAME_MAP
    ] || '未知需求'
  );
};

const TOASTER_MESSAGES_DEFAULT_TEMPLATE = {
  SUCCESS: (entityKey: string, action: string, entityId?: string) => {
    return entityId
      ? `${getEntityDisplayName(entityKey)} <span class="font-semibold">${entityId}</span> 已${action}。`
      : `${getEntityDisplayName(entityKey)}已${action}。`;
  },
  FAILURE: (entityKey: string, action: string, entityId?: string) => {
    return entityId
      ? `${action}${getEntityDisplayName(entityKey)} <span class="highlight">${entityId}</span> 失败，请重试。`
      : `${action}${getEntityDisplayName(entityKey)}失败，请重试。`;
  },
};

export const TOASTER_MESSAGES = {
  ENTITY: {
    ADD: {
      SUCCESS: (entityType: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(entityType, '添加'),
      FAILURE: (entityType: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(entityType, '添加'),
    },
    UPDATE: {
      SUCCESS: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          '更新',
          entityId,
        ),
      FAILURE: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(
          entityType,
          '更新',
          entityId,
        ),
    },
    DELETE: {
      SUCCESS: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          '删除',
          entityId,
        ),
      FAILURE: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(
          entityType,
          '删除',
          entityId,
        ),
    },
    COPY: {
      SUCCESS: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          '复制',
          entityId,
        ),
      FAILURE: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(entityType, '复制', entityId),
    },
    GENERATE: {
      SUCCESS: (entityType: string, isRegenerate = false) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          isRegenerate ? '重新生成' : '生成',
        ),
      FAILURE: (entityType: string, isRegenerate = false) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(
          entityType,
          isRegenerate ? '重新生成' : '生成',
        ),
    },
  },
};

export const APP_MESSAGES = {
  AWS_BEDROCK_TOOLTIP_MESSAGE: `启用 AWS Bedrock 知识库后，${environment.ThemeConfiguration.appName} 可利用企业专属上下文，生成更准确、更符合业务需求及整体解决方案的回答。`,
  JIRA_ACCORDION:
    '配置 Jira 账户并完成身份验证后，可将生成的用户故事发布为 Jira 事项。连接成功后，选择“同步到 Jira”，即可在配置的项目键所对应的 Jira 项目中创建事项。',
  AWS_BEDROCK_ACCORDION_MESSAGE: `使用 AWS Bedrock 知识库后，${environment.ThemeConfiguration.appName} 可利用企业专属上下文，生成更准确、更符合业务需求及整体解决方案的回答。`,
  ADO_ACCORDION:
    '配置 Azure DevOps 组织、项目和个人访问令牌并连接成功后，可将生成的用户故事直接同步为 Azure DevOps 工作项。',
  ADO_DETAILS_MISSING: '缺少 Azure DevOps 配置信息。请前往集成设置，补全并保存配置后继续。',
  ADO_INVALID_CREDENTIALS: 'Azure DevOps 凭据无效。请在集成页面更新凭据后重试。'
};

export const TOOLTIP_CONTENT = {
  IMPORT_FROM_CODE_BUTTON: '从代码导入',
};

export const FOLDER = {
  BRD: 'BRD',
  PRD: 'PRD',
  NFR: 'NFR',
  UIR: 'UIR',
  BP: 'BP',
  TC: 'TC',
  SI: 'SI',
};

export const REQUIREMENT_TYPE_FOLDER_MAP = {
  [REQUIREMENT_TYPE.BRD]: FOLDER.BRD,
  [REQUIREMENT_TYPE.PRD]: FOLDER.PRD,
  [REQUIREMENT_TYPE.NFR]: FOLDER.NFR,
  [REQUIREMENT_TYPE.UIR]: FOLDER.UIR,
  [REQUIREMENT_TYPE.BP]: FOLDER.BP,
  [REQUIREMENT_TYPE.TC]: FOLDER.TC,
  [REQUIREMENT_TYPE.SI]: FOLDER.SI,
} as const;

export const FOLDER_REQUIREMENT_TYPE_MAP = {
  [FOLDER.BRD]: REQUIREMENT_TYPE.BRD,
  [FOLDER.PRD]: REQUIREMENT_TYPE.PRD,
  [FOLDER.NFR]: REQUIREMENT_TYPE.NFR,
  [FOLDER.UIR]: REQUIREMENT_TYPE.UIR,
  [FOLDER.BP]: REQUIREMENT_TYPE.BP,
  [FOLDER.TC]: REQUIREMENT_TYPE.TC,
  [FOLDER.SI]: REQUIREMENT_TYPE.SI,
} as const;

// types

export type RequirementType =
  (typeof REQUIREMENT_TYPE)[keyof typeof REQUIREMENT_TYPE];

export type RootRequirementType = Exclude<
  RequirementType,
  | typeof REQUIREMENT_TYPE.BP
  | typeof REQUIREMENT_TYPE.TASK
  | typeof REQUIREMENT_TYPE.US
  | typeof REQUIREMENT_TYPE.TC
  | typeof REQUIREMENT_TYPE.SI
>;
