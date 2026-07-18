import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../entities/notification-type.enum';

export const NOTIFICATION_WRITER = Symbol('INotificationWriter');

export interface CreateNotificationData {
  type: NotificationType;
  customerId: string | null;
  procedureId?: string | null;
  message: string;
}

/**
 * Admin (RLS-bypassing) port used by event listeners, which run outside any
 * HTTP request context (no user JWT available to build an RLS-aware client).
 */
export interface INotificationWriter {
  create(data: CreateNotificationData): Promise<Notification>;
}
