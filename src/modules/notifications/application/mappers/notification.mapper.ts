import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { Notification } from '../../domain/entities/notification.entity';
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
    dto.message = notification.message;
    dto.isRead = notification.isRead;
    dto.createdAt = notification.createdAt;
    return dto;
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
