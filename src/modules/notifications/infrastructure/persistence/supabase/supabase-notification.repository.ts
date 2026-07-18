import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { readPaginatedRows } from '../../../../../shared/supabase/supabase-pagination.util';
import {
  createPaginatedResult,
  toOffset,
} from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
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

@Injectable()
export class SupabaseNotificationRepository implements INotificationRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(
    filters: NotificationFilters,
  ): Promise<PaginatedResult<Notification>> {
    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.pagination) {
      const { from, to } = toOffset(filters.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<NotificationRow>(response);
    return createPaginatedResult(
      rows.map((row) => NotificationPersistenceMapper.toDomain(row)),
      total,
      filters.pagination,
    );
  }

  async findById(id: string): Promise<Notification | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
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
      .select('*')
      .single();

    return NotificationPersistenceMapper.toDomain(
      unwrapOrThrow<NotificationRow>(response),
    );
  }
}
