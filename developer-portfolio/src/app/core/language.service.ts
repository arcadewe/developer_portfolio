import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LOCALE, LOCALES, Locale, isLocale } from '../domain/locale';
import { readStorage, writeStorage } from './browser-storage';

export const LOCALE_STORAGE_KEY = 'developer-portfolio-lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly currentLocale = signal<Locale>(DEFAULT_LOCALE);

  readonly locales = LOCALES;
  readonly locale = this.currentLocale.asReadonly();

  constructor() {
    const saved = readStorage(LOCALE_STORAGE_KEY);
    this.apply(isLocale(saved) ? saved : DEFAULT_LOCALE);
  }

  use(locale: Locale): void {
    this.apply(locale);
    writeStorage(LOCALE_STORAGE_KEY, locale);
  }

  private apply(locale: Locale): void {
    this.currentLocale.set(locale);
    this.document.documentElement.lang = locale;
    this.translate.use(locale).subscribe();
  }
}
