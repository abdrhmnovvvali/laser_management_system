import { Injectable } from '@nestjs/common';
import { Notification } from '../domain/entities/notification.entity';
import type { NotificationFilters } from '../domain/repositories/notification.repository.interface';
import { ListNotificationsUseCase } from './use-cases/list-notifications.usecase';

@Injectable()
export class NotificationFacade {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
  ) {}

  async list(filters: NotificationFilters = {}): Promise<Notification[]> {
    return this.listNotificationsUseCase.execute(filters);
  }
}
