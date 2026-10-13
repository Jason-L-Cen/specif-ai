import { processPRDContentForView } from './prd.utils';
import { processTaskContentForView } from './task.utils';
import { processUserStoryContentForView } from './user-story.utils';
import { UtilityService } from '../services/utility.service';

describe('中英文生成文档的分节显示', () => {
  for (const colon of [':', '：']) {
    for (const [screens, personas] of [['Screens', 'Personas'], ['界面', '用户画像']]) {
      it(`分别保留 ${screens}${colon} 与 ${personas}${colon} 的内容`, () => {
        const content = `主需求${'很长'.repeat(30)}\n\n#### ${screens}${colon}\nSCREEN_MARK\n\n#### ${personas}${colon}\nPERSONA_MARK`;
        const rendered = processPRDContentForView(content, 16);
        expect(rendered).toContain('SCREEN_MARK');
        expect(rendered).toContain('PERSONA_MARK');

        const html = new UtilityService().getProductRequirements(
          `主需求 ${screens}${colon} SCREEN_MARK ${personas}${colon} PERSONA_MARK`,
          true,
        );
        expect(html).toContain('界面</h3>SCREEN_MARK');
        expect(html).toContain('用户画像</h3>PERSONA_MARK');
      });
    }

    for (const title of ['Acceptance Criteria', '验收标准']) {
      it(`在截断正文时保留 ${title}${colon} 中的验收标准`, () => {
        const content = `故事描述${'很长'.repeat(30)}\n\n#### ${title}${colon}\nCRITERIA_MARK`;
        expect(processTaskContentForView(content, 16)).toContain('CRITERIA_MARK');
        expect(processUserStoryContentForView(content, 16)).toContain('CRITERIA_MARK');
      });
    }
  }
});
