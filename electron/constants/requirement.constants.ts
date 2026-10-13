export const REQUIREMENT_TYPE = {
  BRD: "BRD",
  PRD: "PRD",
  UIR: "UIR",
  NFR: "NFR",
  BP: "BP",
  US: "US",
  TASK: "TASK",
  SI: "SI",
} as const;

export const REQUIREMENT_DISPLAY_NAME_MAP = {
  [REQUIREMENT_TYPE.US]: "用户故事",
  [REQUIREMENT_TYPE.BP]: "业务流程",
  [REQUIREMENT_TYPE.BRD]: "业务需求",
  [REQUIREMENT_TYPE.NFR]: "非功能需求",
  [REQUIREMENT_TYPE.PRD]: "产品需求",
  [REQUIREMENT_TYPE.UIR]: "用户界面需求",
  [REQUIREMENT_TYPE.TASK]: "任务",
  [REQUIREMENT_TYPE.SI]: "战略举措",
};

export const REQUIREMENT_DISPLAY_NAME_PLURAL_MAP = {
  [REQUIREMENT_TYPE.US]: "用户故事",
  [REQUIREMENT_TYPE.BP]: "业务流程",
  [REQUIREMENT_TYPE.BRD]: "业务需求",
  [REQUIREMENT_TYPE.NFR]: "非功能需求",
  [REQUIREMENT_TYPE.PRD]: "产品需求",
  [REQUIREMENT_TYPE.UIR]: "用户界面需求",
  [REQUIREMENT_TYPE.TASK]: "任务",
  [REQUIREMENT_TYPE.SI]: "战略举措",
};
