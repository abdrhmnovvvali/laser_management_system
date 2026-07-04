import { Notification } from '../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

export class NotificationMapper {
  static toResponseDto(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.type = notification.type;
    dto.customerId = notification.customerId;
    dto.message = notification.message;
    dto.isRead = notification.isRead;
    dto.createdAt = notification.createdAt;
    return dto;
  }

  static toResponseDtoList(
    notifications: Notification[],
  ): NotificationResponseDto[] {
    return notifications.map((notification) =>
      this.toResponseDto(notification),
    );
  }
}
