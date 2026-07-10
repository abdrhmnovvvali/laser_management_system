import { Module } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../domain/repositories/notification.repository.interface';
import { NOTIFICATION_WRITER } from '../domain/repositories/notification-writer.interface';
import { SupabaseNotificationRepository } from '../infrastructure/persistence/supabase/supabase-notification.repository';
import { SupabaseNotificationWriter } from '../infrastructure/persistence/supabase/supabase-notification-writer';
import { BirthdayFoundListener } from '../application/listeners/birthday-found.listener';
import { FollowUpDueListener } from '../application/listeners/follow-up-due.listener';
import { FraudDetectedListener } from '../application/listeners/fraud-detected.listener';
import { NotificationFacade } from '../application/notification.facade';
import { ListNotificationsUseCase } from '../application/use-cases/list-notifications.usecase';
import { MarkNotificationAsReadUseCase } from '../application/use-cases/mark-notification-as-read.usecase';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationFacade,
    ListNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    FraudDetectedListener,
    FollowUpDueListener,
    BirthdayFoundListener,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: SupabaseNotificationRepository,
    },
    { provide: NOTIFICATION_WRITER, useClass: SupabaseNotificationWriter },
  ],
  exports: [NotificationFacade],
})
export class NotificationsModule {}
