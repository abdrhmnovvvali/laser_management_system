import { BadRequestException } from '@nestjs/common';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale.constants';
import { Locale } from './locale.enum';

export interface NamedTranslation {
  locale: Locale;
  name: string;
}

export function requireAllLocales<T extends { locale: Locale }>(
  translations: T[],
  label = 'translations',
): T[] {
  if (!translations?.length) {
    throw new BadRequestException(`${label} mütləqdir`);
  }

  const locales = translations.map((item) => item.locale);
  const unique = new Set(locales);

  if (unique.size !== locales.length) {
    throw new BadRequestException(`${label} içində təkrarlanan locale var`);
  }

  for (const required of SUPPORTED_LOCALES) {
    if (!unique.has(required)) {
      throw new BadRequestException(
        `${label} bütün dilləri əhatə etməlidir: ${SUPPORTED_LOCALES.join(', ')}`,
      );
    }
  }

  return translations;
}

export function pickLocalizedName(
  translations: NamedTranslation[],
  locale: Locale = DEFAULT_LOCALE,
  fallback = '',
): string {
  const exact = translations.find((item) => item.locale === locale)?.name;
  if (exact) {
    return exact;
  }

  const defaultName = translations.find(
    (item) => item.locale === DEFAULT_LOCALE,
  )?.name;
  if (defaultName) {
    return defaultName;
  }

  return translations[0]?.name ?? fallback;
}

export function pickLocalizedField<T extends { locale: Locale }>(
  translations: T[],
  locale: Locale,
  picker: (item: T) => string | null | undefined,
  fallback: string | null = null,
): string | null {
  const exact = translations.find((item) => item.locale === locale);
  if (exact) {
    const value = picker(exact);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  const defaultItem = translations.find(
    (item) => item.locale === DEFAULT_LOCALE,
  );
  if (defaultItem) {
    const value = picker(defaultItem);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  const first = translations[0];
  if (!first) {
    return fallback;
  }

  const value = picker(first);
  return value !== undefined && value !== null && value !== ''
    ? value
    : fallback;
}
