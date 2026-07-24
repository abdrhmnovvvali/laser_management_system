import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { Notification } from '../../../domain/entities/notification.entity';
import {
  INotificationRepository,
  NotificationFilters,
} from '../../../domain/repositories/notification.repository.interface';
import {
  NotificationPersistenceMapper,
  NotificationRow,
} from '../../mappers/notification-persistence.mapper';

const TABLE = 'notifications';
const SELECT_WITH_TRANSLATIONS =
  '*, notification_translations(locale, message)';

@Injectable()
export class SupabaseNotificationRepository implements INotificationRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(filters: NotificationFilters): Promise<Notification[]> {
    let query = this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS)
      .order('created_at', { ascending: false });

    if (filters.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    const response = await query;
    const rows = unwrap<NotificationRow[]>(response) ?? [];
    return rows.map((row) => NotificationPersistenceMapper.toDomain(row));
  }

  async findById(id: string): Promise<Notification | null> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<NotificationRow>(response);
    return row ? NotificationPersistenceMapper.toDomain(row) : null;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await this.supabase
      .from(TABLE)
      .update({ is_read: true })
      .eq('id', id)
      .select(SELECT_WITH_TRANSLATIONS)
      .single();

    return NotificationPersistenceMapper.toDomain(
      unwrapOrThrow<NotificationRow>(response),
    );
  }
}
