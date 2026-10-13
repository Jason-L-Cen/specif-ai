import {
  processRequirementContentForView
} from './requirement.utils';

const SECTION_NAMES = ['Acceptance Criteria:', 'Acceptance Criteria：', '验收标准:', '验收标准：'];

export const processUserStoryContentForView = (
  content: string,
  maxChars?: number,
): string => {
  return processRequirementContentForView(content, {
    maxChars: maxChars,
    sectionNames: SECTION_NAMES,
  });
};
