import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository.interface';
import type {
  INotificationRepository,
  NotificationFilters,
} from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(filters: NotificationFilters): Promise<Notification[]> {
    return this.notificationRepository.findAll(filters);
  }
}
