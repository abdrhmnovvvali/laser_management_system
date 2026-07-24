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
import { FollowUp } from '../../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../../domain/entities/follow-up-status.enum';
import {
  CreateFollowUpData,
  FollowUpListOptions,
  IFollowUpRepository,
  UpcomingFollowUpListOptions,
  UpdateFollowUpData,
} from '../../../domain/repositories/follow-up.repository.interface';
import {
  FollowUpPersistenceMapper,
  FollowUpRow,
} from '../../mappers/follow-up-persistence.mapper';

const TABLE = 'follow_ups';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class SupabaseFollowUpRepository implements IFollowUpRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAllByCustomer(
    options: FollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>> {
    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('customer_id', options.customerId)
      .order('planned_date', { ascending: true });

    if (options.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<FollowUpRow>(response);
    return createPaginatedResult(
      rows.map((row) => FollowUpPersistenceMapper.toDomain(row)),
      total,
      options.pagination,
    );
  }

  async findById(id: string): Promise<FollowUp | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<FollowUpRow>(response);
    return row ? FollowUpPersistenceMapper.toDomain(row) : null;
  }

  async findUpcoming(
    options: UpcomingFollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>> {
    const today = new Date();
    const until = new Date();
    until.setDate(until.getDate() + options.days);

    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('status', FollowUpStatus.PENDING)
      .gte('planned_date', toDateOnly(today))
      .lte('planned_date', toDateOnly(until))
      .order('planned_date', { ascending: true });

    if (options.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<FollowUpRow>(response);
    return createPaginatedResult(
      rows.map((row) => FollowUpPersistenceMapper.toDomain(row)),
      total,
      options.pagination,
    );
  }

  async findByStatus(status: FollowUpStatus): Promise<FollowUp[]> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('status', status)
      .order('planned_date', { ascending: true });

    const rows = unwrap<FollowUpRow[]>(response) ?? [];
    return rows.map((row) => FollowUpPersistenceMapper.toDomain(row));
  }

  async create(data: CreateFollowUpData): Promise<FollowUp> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        customer_id: data.customerId,
        planned_date: toDateOnly(data.plannedDate),
        status: data.status ?? FollowUpStatus.PENDING,
        zone_id: data.zoneId ?? null,
      })
      .select('*')
      .single();

    return FollowUpPersistenceMapper.toDomain(
      unwrapOrThrow<FollowUpRow>(response),
    );
  }

  async update(id: string, data: UpdateFollowUpData): Promise<FollowUp> {
    const payload: Record<string, unknown> = {};
    if (data.plannedDate !== undefined) {
      payload.planned_date = toDateOnly(data.plannedDate);
    }
    if (data.status !== undefined) payload.status = data.status;
    if (data.zoneId !== undefined) payload.zone_id = data.zoneId;

    const response = await this.supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    return FollowUpPersistenceMapper.toDomain(
      unwrapOrThrow<FollowUpRow>(response),
    );
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }
}
