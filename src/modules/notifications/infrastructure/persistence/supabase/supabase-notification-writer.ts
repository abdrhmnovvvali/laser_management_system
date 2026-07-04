import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import { unwrapOrThrow } from '../../../../../shared/supabase/supabase-response.util';
import { Notification } from '../../../domain/entities/notification.entity';
import {
  CreateNotificationData,
  INotificationWriter,
} from '../../../domain/repositories/notification-writer.interface';
import {
  NotificationPersistenceMapper,
  NotificationRow,
} from '../../mappers/notification-persistence.mapper';

const TABLE = 'notifications';

@Injectable()
export class SupabaseNotificationWriter implements INotificationWriter {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        type: data.type,
        customer_id: data.customerId,
        message: data.message,
        is_read: false,
      })
      .select('*')
      .single();

    return NotificationPersistenceMapper.toDomain(
      unwrapOrThrow<NotificationRow>(response),
    );
  }
}
