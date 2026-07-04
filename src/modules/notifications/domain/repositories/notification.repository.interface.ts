import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../entities/notification-type.enum';

export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
}

/**
 * RLS-aware port used within HTTP request context (list/read/mark-as-read).
 */
export interface INotificationRepository {
  findAll(filters: NotificationFilters): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  markAsRead(id: string): Promise<Notification>;
}
