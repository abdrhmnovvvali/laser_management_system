import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import { unwrapOrThrow } from '../../../../../shared/supabase/supabase-response.util';
import { Notification } from '../../../domain/entities/notification.entity';
import {
  CreateNotificationData,
  INotificationWriter,
} from '../../../domain/repositories/notification-writer.interface';
import { NotificationRealtimeService } from '../../../application/notification-realtime.service';
import {
  NotificationPersistenceMapper,
  NotificationRow,
} from '../../mappers/notification-persistence.mapper';

@Injectable()
export class SupabaseNotificationWriter implements INotificationWriter {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT) private readonly supabase: SupabaseClient,
    private readonly notificationRealtimeService: NotificationRealtimeService,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const response = await this.supabase.rpc('create_notification', {
      p_type: data.type,
      p_customer_id: data.customerId,
      p_procedure_id: data.procedureId ?? null,
      p_message: data.message,
    });

    const notification = NotificationPersistenceMapper.toDomain(
      unwrapOrThrow<NotificationRow>(response),
    );

    await this.notificationRealtimeService.broadcastCreated(notification);

    return notification;
  }
}
