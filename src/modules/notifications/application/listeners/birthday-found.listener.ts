import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BirthdayFoundEvent } from '../../../birthdays/domain/events/birthday-found.event';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NOTIFICATION_WRITER } from '../../domain/repositories/notification-writer.interface';
import type { INotificationWriter } from '../../domain/repositories/notification-writer.interface';
import { NotificationMessages } from '../notification-messages';

@Injectable()
export class BirthdayFoundListener {
  constructor(
    @Inject(NOTIFICATION_WRITER)
    private readonly notificationWriter: INotificationWriter,
  ) {}

  @OnEvent(BirthdayFoundEvent.EVENT_NAME)
  async handle(event: BirthdayFoundEvent): Promise<void> {
    await this.notificationWriter.create({
      type: NotificationType.BIRTHDAY,
      customerId: event.customerId,
      translations: NotificationMessages.birthday(event.customerFullName),
    });
  }
}
