import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';
import { Notification } from '../../../domain/entities/notification.entity';
import {
  CreateNotificationData,
  INotificationWriter,
} from '../../../domain/repositories/notification-writer.interface';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../../domain/repositories/notification.repository.interface';
import { NotificationRealtimeService } from '../../../application/notification-realtime.service';
import { NotificationMessages } from '../../../application/notification-messages';

@Injectable()
export class PrismaNotificationWriter implements INotificationWriter {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationRealtimeService: NotificationRealtimeService,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const messages = NotificationMessages.toRpcPayload(data.translations);
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM create_notification(
        ${data.type}::text,
        ${data.customerId}::uuid,
        ${data.procedureId ?? null}::uuid,
        ${JSON.stringify(messages)}::jsonb
      )
    `;

    const createdId = rows[0]?.id;
    if (!createdId) {
      throw new Error('Notification create sonrası tapılmadı');
    }

    const notification = await this.notificationRepository.findById(createdId);
    if (!notification) {
      throw new Error('Notification create sonrası tapılmadı');
    }

    await this.notificationRealtimeService.broadcastCreated(notification);
    return notification;
  }
}
