import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { PortfolioTranslationLoader } from '../data-access/portfolio-translation.loader';
import { DEFAULT_LOCALE } from '../domain/locale';

export function providePortfolioI18n() {
  return provideTranslateService({
    lang: DEFAULT_LOCALE,
    fallbackLang: DEFAULT_LOCALE,
    loader: provideTranslateLoader(PortfolioTranslationLoader),
  });
}
