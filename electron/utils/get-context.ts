import { BP_CONTEXT } from "../prompts/context/bp";
import { BRD_CONTEXT } from "../prompts/context/brd";
import { NFR_CONTEXT } from "../prompts/context/nfr";
import { PRD_CONTEXT } from "../prompts/context/prd";
import { UIR_CONTEXT } from "../prompts/context/uir";

export function getContextAndType(type: 'BRD' | 'PRD' | 'UIR' | 'NFR' | 'BP'): { context: string; requirementType: string; format: string } {
  switch (type) {
    case 'BRD':
      return {
        context: BRD_CONTEXT,
        requirementType: '业务需求',
        format: '{"title": <title>, "requirement": <requirement>}'
      };
    case 'PRD':
      return {
        context: PRD_CONTEXT,
        requirementType: '产品需求',
        format: '{"title": <title>, "requirement": "<requirement>  \\n#### 界面：  \\n<Screen Description>  \\n#### 用户画像：  \\n<Persona Description>"}'
      };
    case 'NFR':
      return {
        context: NFR_CONTEXT,
        requirementType: '非功能需求',
        format: '{"title": <title>, "requirement": <requirement>}'
      };
    case 'UIR':
      return {
        context: UIR_CONTEXT,
        requirementType: '用户界面需求',
        format: '{"title": <title>, "requirement": <requirement>}'
      };
    case 'BP':
      return {
        context: BP_CONTEXT,
        requirementType: '业务流程',
        format: '{"title": <title>, "requirement": <requirement>}'
      };
  }
}
