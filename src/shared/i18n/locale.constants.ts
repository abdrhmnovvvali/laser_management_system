import { Locale } from './locale.enum';

export const DEFAULT_LOCALE = Locale.AZ;

export const SUPPORTED_LOCALES: readonly Locale[] = [
  Locale.AZ,
  Locale.EN,
  Locale.RU,
] as const;

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
