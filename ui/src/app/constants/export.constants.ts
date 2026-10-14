import { t as uiText } from "../i18n/translate";
import { REQUIREMENT_TYPE } from "./app.constants";

export const EXPORT_FILE_FORMATS = {
  JSON: 'json',
  EXCEL: 'xlsx',
} as const;

export const SPREADSHEET_HEADER_ROW = {
  [REQUIREMENT_TYPE.BRD]: ['ID', uiText("标题"), uiText("描述")],
  [REQUIREMENT_TYPE.PRD]: ['ID', uiText("标题"), uiText("描述")],
  [REQUIREMENT_TYPE.NFR]: ['ID', uiText("标题"), uiText("描述")],
  [REQUIREMENT_TYPE.UIR]: ['ID', uiText("标题"), uiText("描述")],
  [REQUIREMENT_TYPE.BP]: ['ID', uiText("标题"), uiText("描述")],
  [REQUIREMENT_TYPE.TC]: ['ID', uiText("用户故事 ID"), 'PRD ID', uiText("标题"), uiText("描述"), uiText("前置条件"), uiText("后置条件"), uiText("优先级"), uiText("类型"), uiText("步骤")],
  [REQUIREMENT_TYPE.SI]: ['ID', uiText("标题"), uiText("描述")], // FIXME: Update with actual fields
  [REQUIREMENT_TYPE.US]: ['ID', uiText("父级 ID"), uiText("名称"), uiText("描述")],
  [REQUIREMENT_TYPE.TASK]: ['ID', uiText("父级 ID"), uiText("标题"), uiText("验收标准")],
}

export type ExportFileFormat =
  (typeof EXPORT_FILE_FORMATS)[keyof typeof EXPORT_FILE_FORMATS];
