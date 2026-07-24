import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FollowUpDueEvent } from '../../../follow-ups/domain/events/follow-up-due.event';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NOTIFICATION_WRITER } from '../../domain/repositories/notification-writer.interface';
import type { INotificationWriter } from '../../domain/repositories/notification-writer.interface';
import { NotificationMessages } from '../notification-messages';

@Injectable()
export class FollowUpDueListener {
  constructor(
    @Inject(NOTIFICATION_WRITER)
    private readonly notificationWriter: INotificationWriter,
  ) {}

  @OnEvent(FollowUpDueEvent.EVENT_NAME)
  async handle(event: FollowUpDueEvent): Promise<void> {
    const plannedDate = event.plannedDate.toISOString().slice(0, 10);
    await this.notificationWriter.create({
      type: NotificationType.FOLLOW_UP,
      customerId: event.customerId,
      translations: NotificationMessages.followUp(plannedDate),
    });
  }
}
