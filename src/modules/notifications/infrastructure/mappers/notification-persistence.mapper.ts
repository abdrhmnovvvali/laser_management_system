import { LocaleContext } from '../../../../shared/i18n/locale.context';
import { Locale } from '../../../../shared/i18n/locale.enum';
import { pickLocalizedField } from '../../../../shared/i18n/translation.util';
import {
  Notification,
  NotificationTranslation,
} from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/entities/notification-type.enum';

export interface NotificationTranslationRow {
  locale: Locale;
  message: string;
}

export interface NotificationRow {
  id: string;
  type: NotificationType;
  customer_id: string | null;
  procedure_id: string | null;
  is_read: boolean;
  created_at: string;
  notification_translations?: NotificationTranslationRow[] | null;
}

export class NotificationPersistenceMapper {
  static toDomain(row: NotificationRow): Notification {
    const translations: NotificationTranslation[] = (
      row.notification_translations ?? []
    ).map((item) => ({
      locale: item.locale,
      message: item.message,
    }));

    return new Notification(
      row.id,
      new Date(row.created_at),
      row.type,
      row.customer_id,
      row.procedure_id,
      pickLocalizedField(
        translations,
        LocaleContext.getLocale(),
        (item) => item.message,
        '',
      ) ?? '',
      row.is_read,
      translations,
    );
  }
}
