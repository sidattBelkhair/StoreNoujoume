import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({ name: 'translate', pure: false, standalone: true })
export class TranslatePipe implements PipeTransform {
  private readonly ts = inject(TranslationService);

  transform(key: string): string {
    return this.ts.t(key);
  }
}
