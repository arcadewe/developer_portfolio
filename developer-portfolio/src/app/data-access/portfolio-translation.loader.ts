import { Injectable, inject } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { isLocale } from '../domain/locale';
import { PortfolioRepository } from '../domain/portfolio.repository';

@Injectable()
export class PortfolioTranslationLoader implements TranslateLoader {
  private readonly repository = inject(PortfolioRepository);

  getTranslation(lang: string): Observable<TranslationObject> {
    if (!isLocale(lang)) {
      return throwError(() => new Error(`Unsupported translation locale: ${lang}`));
    }

    return of(this.repository.getCopy(lang) as unknown as TranslationObject);
  }
}
