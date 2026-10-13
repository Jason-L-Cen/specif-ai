import { REQUIREMENT_TYPE } from "./app.constants";

export const EXPORT_FILE_FORMATS = {
  JSON: 'json',
  EXCEL: 'xlsx',
} as const;

export const SPREADSHEET_HEADER_ROW = {
  [REQUIREMENT_TYPE.BRD]: ['ID', '标题', '描述'],
  [REQUIREMENT_TYPE.PRD]: ['ID', '标题', '描述'],
  [REQUIREMENT_TYPE.NFR]: ['ID', '标题', '描述'],
  [REQUIREMENT_TYPE.UIR]: ['ID', '标题', '描述'],
  [REQUIREMENT_TYPE.BP]: ['ID', '标题', '描述'],
  [REQUIREMENT_TYPE.TC]: ['ID', '用户故事 ID', 'PRD ID', '标题', '描述', '前置条件', '后置条件', '优先级', '类型', '步骤'],
  [REQUIREMENT_TYPE.SI]: ['ID', '标题', '描述'], // FIXME: Update with actual fields
  [REQUIREMENT_TYPE.US]: ['ID', '父级 ID', '名称', '描述'],
  [REQUIREMENT_TYPE.TASK]: ['ID', '父级 ID', '标题', '验收标准'],
}

export type ExportFileFormat =
  (typeof EXPORT_FILE_FORMATS)[keyof typeof EXPORT_FILE_FORMATS];
