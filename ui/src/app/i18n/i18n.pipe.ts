import { Pipe, PipeTransform } from '@angular/core';
import { t } from './translate';

@Pipe({ name: 'i18n', standalone: true })
export class I18nPipe implements PipeTransform {
  transform(source: string, values: unknown[] = []): string { return t(source, values.map(value => value ?? '')); }
}
