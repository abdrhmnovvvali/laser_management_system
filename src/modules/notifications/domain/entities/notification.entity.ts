import { Locale } from '../../../../shared/i18n/locale.enum';
import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { NotificationType } from './notification-type.enum';

export interface NotificationTranslation {
  locale: Locale;
  message: string;
}

export class Notification extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly type: NotificationType,
    public readonly customerId: string | null,
    public readonly procedureId: string | null,
    public readonly message: string,
    public readonly isRead: boolean,
    public readonly translations: NotificationTranslation[] = [],
  ) {
    super(id, createdAt);
  }
}
