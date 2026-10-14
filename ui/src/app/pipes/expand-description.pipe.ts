import { Pipe, PipeTransform } from '@angular/core';
import { getDescriptionFromInput } from '../utils/common.utils';

@Pipe({
  name: 'expandDescription',
  standalone: true,
})
export class ExpandDescriptionPipe implements PipeTransform {
  constructor() {}

  transform(input: string | undefined): string | null {
    return getDescriptionFromInput(input);
  }
}
