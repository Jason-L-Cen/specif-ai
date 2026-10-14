import { ApplicationLanguage, isApplicationLanguage, translate } from '../../../../electron/i18n/translate';
import type { ElectronAPI } from '../electron-bridge/electron.interface';

let language: ApplicationLanguage = 'zh-CN';

export function getUILanguage(): ApplicationLanguage { return language; }

export function t(source: string, values: unknown[] = []): string {
  return translate(source, language, values);
}

export async function initializeUILanguage(): Promise<void> {
  const bridge: ElectronAPI | undefined = window.electronAPI;
  const saved = bridge ? await bridge.getStoreValue('language') : localStorage.getItem('acePda.language');
  language = isApplicationLanguage(saved) ? saved : 'zh-CN';
  document.documentElement.lang = language;
}
