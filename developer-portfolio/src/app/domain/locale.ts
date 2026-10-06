export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
