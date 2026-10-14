import { t as appText } from "../services/language";
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
  get [REQUIREMENT_TYPE.US]() { return appText("用户故事"); },
  get [REQUIREMENT_TYPE.BP]() { return appText("业务流程"); },
  get [REQUIREMENT_TYPE.BRD]() { return appText("业务需求"); },
  get [REQUIREMENT_TYPE.NFR]() { return appText("非功能需求"); },
  get [REQUIREMENT_TYPE.PRD]() { return appText("产品需求"); },
  get [REQUIREMENT_TYPE.UIR]() { return appText("用户界面需求"); },
  get [REQUIREMENT_TYPE.TASK]() { return appText("任务"); },
  get [REQUIREMENT_TYPE.SI]() { return appText("战略举措"); },
};

export const REQUIREMENT_DISPLAY_NAME_PLURAL_MAP = {
  get [REQUIREMENT_TYPE.US]() { return appText("用户故事"); },
  get [REQUIREMENT_TYPE.BP]() { return appText("业务流程"); },
  get [REQUIREMENT_TYPE.BRD]() { return appText("业务需求"); },
  get [REQUIREMENT_TYPE.NFR]() { return appText("非功能需求"); },
  get [REQUIREMENT_TYPE.PRD]() { return appText("产品需求"); },
  get [REQUIREMENT_TYPE.UIR]() { return appText("用户界面需求"); },
  get [REQUIREMENT_TYPE.TASK]() { return appText("任务"); },
  get [REQUIREMENT_TYPE.SI]() { return appText("战略举措"); },
};
