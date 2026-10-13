import { processRequirementContentForView } from './requirement.utils';

const SECTION_NAMES = ['Screens:', 'Screens：', '界面:', '界面：', 'Personas:', 'Personas：', '用户画像:', '用户画像：'];

export const processPRDContentForView = (
  content: string,
  maxChars?: number,
): string => {
  return processRequirementContentForView(content, {
    maxChars: maxChars,
    sectionNames: SECTION_NAMES,
  });
};
