import { t as uiText } from "../i18n/translate";
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
  GENERATE_SUGGESTIONS_FAILED: uiText("生成建议失败"),
  DELETE_ASSOCIATED_ERROR: (reqId: string, bpIds: string[]) =>
    uiText("无法删除 {0}，因为它已关联以下业务流程：{1}。", [reqId, bpIds.join('、')]),
  DELETE_ASSOCIATED_PRDs_ERROR: (reqId: string, prdIds: string[]) =>
    uiText("无法删除 {0}，因为它已关联以下产品需求：{1}。", [reqId, prdIds.join('、')]),
};

export const SOLUTION_CREATION_TOGGLE_MESSAGES = {
  BROWNFIELD_SOLUTION:
    uiText("开启后，将不会为此解决方案生成业务需求或解决方案需求。"),
  GREENFIELD_SOLUTION:
    uiText("可根据解决方案的上下文创建需求"),
};

export const CONFIRMATION_DIALOG = {
  DELETION: {
    TITLE: uiText("确认删除"),
    DESCRIPTION: (entityName: string) =>
      uiText("确定要删除 <span class=\"font-semibold\">{0}</span> 吗？", [entityName]),
    CANCEL_BUTTON_TEXT: uiText("取消"),
    PROCEED_BUTTON_TEXT: uiText("删除"),
  },
  UNSAVED_CHANGES: {
    TITLE: uiText("确认离开"),
    DESCRIPTION:
      uiText("此页面有尚未保存的更改。确定要放弃保存并前往其他页面吗？"),
    PROCEED_BUTTON_TEXT: uiText("留在此页"),
    CANCEL_BUTTON_TEXT: uiText("离开"),
  },
  LOGOUT: {
    TITLE: uiText("确认退出登录"),
    DESCRIPTION: uiText("确定要退出登录吗？"),
    CANCEL_BUTTON_TEXT: uiText("取消"),
    PROCEED_BUTTON_TEXT: uiText("退出登录"),
  },
  JIRA_REAUTHENTICATION: {
    TITLE: uiText("重新进行 Jira 身份验证"),
    DESCRIPTION:
      uiText("Jira 会话已过期，请重新进行身份验证后继续。"),
    CANCEL_BUTTON_TEXT: uiText("取消"),
    PROCEED_BUTTON_TEXT: uiText("重新验证"),
  },
  JIRA_DETAILS_MISSING: {
    TITLE: uiText("Jira 集成尚未配置完成"),
    DESCRIPTION:
      uiText("缺少 Jira 配置信息。请前往集成设置，补全并保存配置后继续。"),
    CANCEL_BUTTON_TEXT: uiText("取消"),
    PROCEED_BUTTON_TEXT: uiText("打开集成设置"),
  },
  CONFIRM_BRD_UPDATE: {
    TITLE: uiText("确认更新业务需求（BRD）"),
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
          uiText("关联的产品需求文档（PRD）不会自动更新。");
      }

      if (hasRemovedLinks) {
        description +=
          (description ? uiText("\n此外，") : '') +
          uiText("取消此业务需求（BRD）的关联后，之前添加到关联产品需求文档（PRD）中的内容仍会保留。");
      }
      description +=
        uiText(" 这些产品需求文档（PRD）如需更新，请手动检查并修改。\n\n确定要继续吗？");
      return description;
    },
    CANCEL_BUTTON_TEXT: uiText("取消"),
    PROCEED_BUTTON_TEXT: uiText("确认"),
  },
  CONFIRM_PRD_UPDATE: {
    TITLE: uiText("确认更新产品需求文档（PRD）"),
    DESCRIPTION:
      uiText("从之前关联的业务需求（BRD）添加到此产品需求文档（PRD）中的内容仍会保留。如需更新，请手动检查并修改。\n\n确定要继续吗？"),
    CANCEL_BUTTON_TEXT: uiText("取消"),
    PROCEED_BUTTON_TEXT: uiText("确认"),
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
  [REQUIREMENT_TYPE.US]: uiText("用户故事"),
  [REQUIREMENT_TYPE.BP]: uiText("业务流程"),
  [REQUIREMENT_TYPE.BRD]: uiText("业务需求"),
  [REQUIREMENT_TYPE.NFR]: uiText("非功能需求"),
  [REQUIREMENT_TYPE.PRD]: uiText("产品需求"),
  [REQUIREMENT_TYPE.UIR]: uiText("用户界面需求"),
  [REQUIREMENT_TYPE.TASK]: uiText("任务"),
  [REQUIREMENT_TYPE.TC]: uiText("测试用例"),
  [REQUIREMENT_TYPE.SI]: uiText("战略举措"),
};

export const SPECIFAI_BASE_URL = 'https://github.com/Jason-L-Cen/specif-ai/blob/dev-JasonCen/README.zh-CN.md';
export const SPECIFAI_FALLBACK_URL = `${SPECIFAI_BASE_URL}#需求类型与演示操作`;

export const SPECIFAI_REQ_DOCS = {
  [REQUIREMENT_TYPE.BRD]: `${SPECIFAI_BASE_URL}#需求类型与演示操作`,
  [REQUIREMENT_TYPE.PRD]: `${SPECIFAI_BASE_URL}#需求类型与演示操作`,
  [REQUIREMENT_TYPE.US]: `${SPECIFAI_BASE_URL}#需求与测试用例关联`,
  [REQUIREMENT_TYPE.TASK]: `${SPECIFAI_BASE_URL}#需求与测试用例关联`,
  [REQUIREMENT_TYPE.NFR]: `${SPECIFAI_BASE_URL}#需求类型与演示操作`,
  [REQUIREMENT_TYPE.UIR]: `${SPECIFAI_BASE_URL}#需求类型与演示操作`,
  [REQUIREMENT_TYPE.TC]: `${SPECIFAI_BASE_URL}#需求与测试用例关联`,
  [REQUIREMENT_TYPE.SI]: `${SPECIFAI_BASE_URL}#需求类型与演示操作`,
  [REQUIREMENT_TYPE.BP]: `${SPECIFAI_BASE_URL}#需求类型与演示操作`,
} as const;

const getEntityDisplayName = (folderId: string): string => {
  return (
    REQUIREMENT_DISPLAY_NAME_MAP[
      folderId as keyof typeof REQUIREMENT_DISPLAY_NAME_MAP
    ] || uiText("未知需求")
  );
};

const TOASTER_MESSAGES_DEFAULT_TEMPLATE = {
  SUCCESS: (entityKey: string, action: string, entityId?: string) => {
    return entityId
      ? uiText("{0} <span class=\"font-semibold\">{1}</span> 已{2}。", [getEntityDisplayName(entityKey), entityId, action])
      : uiText("{0}已{1}。", [getEntityDisplayName(entityKey), action]);
  },
  FAILURE: (entityKey: string, action: string, entityId?: string) => {
    return entityId
      ? uiText("{0}{1} <span class=\"highlight\">{2}</span> 失败，请重试。", [action, getEntityDisplayName(entityKey), entityId])
      : uiText("{0}{1}失败，请重试。", [action, getEntityDisplayName(entityKey)]);
  },
};

export const TOASTER_MESSAGES = {
  ENTITY: {
    ADD: {
      SUCCESS: (entityType: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(entityType, uiText("添加")),
      FAILURE: (entityType: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(entityType, uiText("添加")),
    },
    UPDATE: {
      SUCCESS: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          uiText("更新"),
          entityId,
        ),
      FAILURE: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(
          entityType,
          uiText("更新"),
          entityId,
        ),
    },
    DELETE: {
      SUCCESS: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          uiText("删除"),
          entityId,
        ),
      FAILURE: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(
          entityType,
          uiText("删除"),
          entityId,
        ),
    },
    COPY: {
      SUCCESS: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          uiText("复制"),
          entityId,
        ),
      FAILURE: (entityType: string, entityId: string) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(entityType, uiText("复制"), entityId),
    },
    GENERATE: {
      SUCCESS: (entityType: string, isRegenerate = false) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.SUCCESS(
          entityType,
          isRegenerate ? uiText("重新生成") : uiText("生成"),
        ),
      FAILURE: (entityType: string, isRegenerate = false) =>
        TOASTER_MESSAGES_DEFAULT_TEMPLATE.FAILURE(
          entityType,
          isRegenerate ? uiText("重新生成") : uiText("生成"),
        ),
    },
  },
};

export const APP_MESSAGES = {
  AWS_BEDROCK_TOOLTIP_MESSAGE: uiText("启用 AWS Bedrock 知识库后，{0} 可利用企业专属上下文，生成更准确、更符合业务需求及整体解决方案的回答。", [environment.ThemeConfiguration.appName]),
  JIRA_ACCORDION:
    uiText("配置 Jira 账户并完成身份验证后，可将生成的用户故事发布为 Jira 事项。连接成功后，选择“同步到 Jira”，即可在配置的项目键所对应的 Jira 项目中创建事项。"),
  AWS_BEDROCK_ACCORDION_MESSAGE: uiText("使用 AWS Bedrock 知识库后，{0} 可利用企业专属上下文，生成更准确、更符合业务需求及整体解决方案的回答。", [environment.ThemeConfiguration.appName]),
  ADO_ACCORDION:
    uiText("配置 Azure DevOps 组织、项目和个人访问令牌并连接成功后，可将生成的用户故事直接同步为 Azure DevOps 工作项。"),
  ADO_DETAILS_MISSING: uiText("缺少 Azure DevOps 配置信息。请前往集成设置，补全并保存配置后继续。"),
  ADO_INVALID_CREDENTIALS: uiText("Azure DevOps 凭据无效。请在集成页面更新凭据后重试。")
};

export const TOOLTIP_CONTENT = {
  IMPORT_FROM_CODE_BUTTON: uiText("从代码导入"),
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
