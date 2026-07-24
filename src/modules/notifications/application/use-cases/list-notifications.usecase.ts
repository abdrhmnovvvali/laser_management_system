import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository.interface';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    query: ListNotificationsQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.notificationRepository.findAll({
      isRead: query.isRead,
      type: query.type,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
