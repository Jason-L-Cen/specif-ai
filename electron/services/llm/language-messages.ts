import { BaseMessage, HumanMessage, isSystemMessage, SystemMessage } from '@langchain/core/messages';
import { getOutputLanguageInstructions, getOutputLanguageReminder } from '../../prompts/context/markdown-rules';

export function withOutputLanguage(input: BaseMessage[] | string): BaseMessage[] {
  const messages = typeof input === 'string' ? [new HumanMessage(input)] : input;
  const first = messages[0];
  const instruction = getOutputLanguageInstructions();
  const reminder = new HumanMessage(getOutputLanguageReminder());
  if (first && isSystemMessage(first) && typeof first.content === 'string') {
    return [new SystemMessage({ ...first, content: `${first.content}\n\n${instruction}` }), ...messages.slice(1), reminder];
  }
  return [new SystemMessage(instruction), ...messages, reminder];
}
