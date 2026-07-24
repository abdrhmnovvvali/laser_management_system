import { Locale } from '../../../shared/i18n/locale.enum';
import { SUPPORTED_LOCALES } from '../../../shared/i18n/locale.constants';

export interface NotificationMessageTranslation {
  locale: Locale;
  message: string;
}

function toTranslations(
  messages: Record<Locale, string>,
): NotificationMessageTranslation[] {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    message: messages[locale],
  }));
}

export class NotificationMessages {
  static birthday(fullName: string): NotificationMessageTranslation[] {
    return toTranslations({
      [Locale.AZ]: `Bu gün ${fullName} adlı müştərinin ad günüdür`,
      [Locale.EN]: `Today is ${fullName}'s birthday`,
      [Locale.RU]: `Сегодня день рождения клиента ${fullName}`,
    });
  }

  static followUp(plannedDate: string): NotificationMessageTranslation[] {
    return toTranslations({
      [Locale.AZ]: `Planlaşdırılan vizit tarixi bu gündür (${plannedDate})`,
      [Locale.EN]: `A planned visit is due today (${plannedDate})`,
      [Locale.RU]: `Запланированный визит назначен на сегодня (${plannedDate})`,
    });
  }

  static fraud(shotDifference: number): NotificationMessageTranslation[] {
    const abs = Math.abs(shotDifference);

    if (shotDifference > 0) {
      return toTranslations({
        [Locale.AZ]: `Faktiki atış sayı bəyan edilən sayı ${abs} vahid üstələyir`,
        [Locale.EN]: `Actual shot count exceeds declared count by ${abs}`,
        [Locale.RU]: `Фактическое число выстрелов превышает заявленное на ${abs}`,
      });
    }

    return toTranslations({
      [Locale.AZ]: `Faktiki atış sayı bəyan edilən sayıdan ${abs} vahid azdır`,
      [Locale.EN]: `Actual shot count is ${abs} below declared count`,
      [Locale.RU]: `Фактическое число выстрелов меньше заявленного на ${abs}`,
    });
  }

  static toRpcPayload(
    translations: NotificationMessageTranslation[],
  ): Record<string, string> {
    return Object.fromEntries(
      translations.map((item) => [item.locale, item.message]),
    );
  }
}
