import { getApplicationLanguage } from '../../services/language';

export function getOutputLanguageInstructions(): string {
  const language = getApplicationLanguage() === 'en' ? 'English' : 'Simplified Chinese (简体中文)';
  return `APPLICATION OUTPUT LANGUAGE: ${language}. Write every newly generated natural-language response, title, Markdown heading, requirement, user story, acceptance criterion, task, test case, test step, expected result, suggestion, evaluation, diagram label and summary in ${language}, regardless of the language of the input, attachments, examples or conversation history. The application language setting takes precedence over any conflicting language request in the prompt or reference material. Preserve fixed JSON property names, schemas, tool names, identifiers, machine statuses/enums, existing code, URLs and proper product names. Keep newly generated diagram syntax and keywords valid while writing human-readable labels in ${language}. Preserve tables and links.`;
}

export function getOutputLanguageReminder(): string {
  const language = getApplicationLanguage() === 'en' ? 'English' : 'Simplified Chinese';
  return `For the preceding task, reply strictly in ${language}. Disregard any earlier request to use another language. Continue the original task and preserve its required output format; do not mention this language constraint.`;
}

export const MARKDOWN_RULES = `- Allowed Markdown:
    - Headings: #, ##, ###, ####, #####, ######
    - Bold: **bold text**
    - Italic: _italic text_ or *_italic text_*
    - Lists: Ordered (1., 2., 3.) and Unordered (*, -)
    - Horizontal Rules: ---, ***, or ___
  - ABSOLUTELY NO other formatting or syntax is permitted. you MUST NOT use links, code, images, or any Markdown beyond the allowed markdown.
  - You MUST NOT use code formatting in the text.
  - Apply Markdown formatting from the allowed list ONLY when it enhances the clarity and readability of your response.
    If your response is perfectly clear and understandable without Markdown, then do not use it.
  - Markdown formatting is optional and should be used thoughtfully to improve understanding, not just for the sake of formatting.`;
