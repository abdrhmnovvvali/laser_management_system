import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { NotificationType } from './notification-type.enum';

export class Notification extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly type: NotificationType,
    public readonly customerId: string | null,
    public readonly message: string,
    public readonly isRead: boolean,
  ) {
    super(id, createdAt);
  }
}
