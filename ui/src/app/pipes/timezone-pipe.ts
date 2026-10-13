import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timezone',
  standalone: true,
})
export class TimeZonePipe implements PipeTransform {
  constructor() {}

  transform(dateString: string | undefined): string {
    if (!dateString) {
      return '';
    }
    return this.formatDateTime(dateString);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '时间无效';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZoneName: 'shortOffset',
    }).format(date);
  }
}
