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
const JUNCTION_TABLE = 'follow_up_zones';
const SELECT_WITH_ZONES = '*, follow_up_zones(zone_id)';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class SupabaseFollowUpRepository implements IFollowUpRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(
    options: FollowUpListOptions,
  ): Promise<PaginatedResult<FollowUp>> {
    let query = this.supabase
      .from(TABLE)
      .select(SELECT_WITH_ZONES, { count: 'exact' })
      .order('planned_date', { ascending: true });

    if (options.customerId) {
      query = query.eq('customer_id', options.customerId);
    }
    if (options.status) {
      query = query.eq('status', options.status);
    }

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
      .select(SELECT_WITH_ZONES)
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
      .select(SELECT_WITH_ZONES, { count: 'exact' })
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
      .select(SELECT_WITH_ZONES)
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
      })
      .select('id')
      .single();

    const created = unwrapOrThrow<{ id: string }>(response);
    await this.replaceZoneLinks(created.id, data.zoneIds ?? []);

    const followUp = await this.findById(created.id);
    if (!followUp) {
      throw new Error('Follow-up create sonrası tapılmadı');
    }
    return followUp;
  }

  async update(id: string, data: UpdateFollowUpData): Promise<FollowUp> {
    const payload: Record<string, unknown> = {};
    if (data.plannedDate !== undefined) {
      payload.planned_date = toDateOnly(data.plannedDate);
    }
    if (data.status !== undefined) payload.status = data.status;

    if (Object.keys(payload).length > 0) {
      const response = await this.supabase
        .from(TABLE)
        .update(payload)
        .eq('id', id)
        .select('id')
        .single();
      unwrapOrThrow(response);
    }

    if (data.zoneIds !== undefined) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    const followUp = await this.findById(id);
    if (!followUp) {
      throw new Error('Follow-up update sonrası tapılmadı');
    }
    return followUp;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private async replaceZoneLinks(
    followUpId: string,
    zoneIds: string[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(JUNCTION_TABLE)
      .delete()
      .eq('follow_up_id', followUpId);
    unwrap(deleteResponse);

    if (zoneIds.length === 0) {
      return;
    }

    const insertResponse = await this.supabase.from(JUNCTION_TABLE).insert(
      zoneIds.map((zoneId) => ({
        follow_up_id: followUpId,
        zone_id: zoneId,
      })),
    );
    unwrap(insertResponse);
  }
}
