import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NotificationResponseDto } from '../dto/notification-response.dto';

export class NotificationMapper {
  static toResponseDto(
    notification: Notification,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.type = notification.type;
    dto.customerId = notification.customerId;
    dto.customerName = lookupName(lookups.customers, notification.customerId);
    dto.procedureId = notification.procedureId;
    dto.message = this.toPublicMessage(notification);
    dto.isRead = notification.isRead;
    dto.createdAt = notification.createdAt;
    return dto;
  }

  private static toPublicMessage(notification: Notification): string {
    if (notification.type !== NotificationType.FRAUD) {
      return notification.message;
    }

    return notification.message
      .replace(/\s*\(prosedur:\s*[0-9a-f-]{36}\)$/i, '')
      .trim();
  }

  static toResponseDtoList(
    notifications: Notification[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): NotificationResponseDto[] {
    return notifications.map((notification) =>
      this.toResponseDto(notification, lookups),
    );
  }
}
