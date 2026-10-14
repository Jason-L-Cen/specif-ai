import { EventEmitter } from 'node:events';
import { store } from './store';
import { contentGenerationManager } from './content-generation/content-generation.service';
import { ApplicationLanguage, isApplicationLanguage, translate } from '../i18n/translate';

let activeTasks = 0;
export const languageEvents = new EventEmitter();

export function getApplicationLanguage(): ApplicationLanguage {
  // Tests and startup can construct prompts before the store is initialized.
  try { return store.get('language') === 'en' ? 'en' : 'zh-CN'; }
  catch { return 'zh-CN'; }
}

export function t(source: string, values: unknown[] = []): string {
  return translate(source, getApplicationLanguage(), values);
}

export function getLanguageStatus() {
  return {
    language: getApplicationLanguage(),
    busy: activeTasks > 0 || contentGenerationManager.isAnyContentGenerationInProgress(),
  };
}

export function setApplicationLanguage(value: unknown): void {
  if (!isApplicationLanguage(value)) throw new Error(t('不支持的语言，请选择简体中文或 English。'));
  if (getLanguageStatus().busy) throw new Error(t('任务正在运行，请等待完成后再切换语言。'));
  store.set('language', value);
  languageEvents.emit('changed');
}

export async function runLanguageTask<T>(operation: () => T | Promise<T>): Promise<T> {
  activeTasks++;
  try { return await operation(); }
  finally { activeTasks--; }
}
