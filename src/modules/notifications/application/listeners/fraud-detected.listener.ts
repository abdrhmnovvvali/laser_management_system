import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FraudDetectedEvent } from '../../../fraud-detection/domain/events/fraud-detected.event';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NOTIFICATION_WRITER } from '../../domain/repositories/notification-writer.interface';
import type { INotificationWriter } from '../../domain/repositories/notification-writer.interface';

@Injectable()
export class FraudDetectedListener {
  constructor(
    @Inject(NOTIFICATION_WRITER)
    private readonly notificationWriter: INotificationWriter,
  ) {}

  @OnEvent(FraudDetectedEvent.EVENT_NAME)
  async handle(event: FraudDetectedEvent): Promise<void> {
    await this.notificationWriter.create({
      type: NotificationType.FRAUD,
      customerId: event.customerId,
      message: event.message,
    });
  }
}
