import english from './en.json';

export type ApplicationLanguage = 'zh-CN' | 'en';

export function isApplicationLanguage(value: unknown): value is ApplicationLanguage {
  return value === 'zh-CN' || value === 'en';
}

// Only application-owned text is passed here; document contents stay in their saved language.
export function translate(source: string, language: ApplicationLanguage, values: unknown[] = []): string {
  const key = source.trim();
  const catalog: Record<string, string> = english;
  const text = language === 'en' && Object.prototype.hasOwnProperty.call(catalog, key)
    ? source.slice(0, source.indexOf(key)) + catalog[key] + source.slice(source.indexOf(key) + key.length)
    : source;
  return text.replace(/\{(\d+)\}/g, (placeholder, index) =>
    Number(index) < values.length ? String(values[Number(index)]) : placeholder);
}
