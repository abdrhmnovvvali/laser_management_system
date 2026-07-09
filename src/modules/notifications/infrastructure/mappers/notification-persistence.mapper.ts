import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/entities/notification-type.enum';

export interface NotificationRow {
  id: string;
  type: NotificationType;
  customer_id: string | null;
  procedure_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export class NotificationPersistenceMapper {
  static toDomain(row: NotificationRow): Notification {
    return new Notification(
      row.id,
      new Date(row.created_at),
      row.type,
      row.customer_id,
      row.procedure_id,
      row.message,
      row.is_read,
    );
  }
}
