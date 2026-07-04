import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository.interface';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(id: string): Promise<Notification> {
    const existing = await this.notificationRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Notification', id);
    }
    return this.notificationRepository.markAsRead(id);
  }
}
