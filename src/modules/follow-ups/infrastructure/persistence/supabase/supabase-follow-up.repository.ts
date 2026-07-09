import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { FollowUp } from '../../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../../domain/entities/follow-up-status.enum';
import {
  CreateFollowUpData,
  IFollowUpRepository,
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

  async findAllByCustomer(customerId: string): Promise<FollowUp[]> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('customer_id', customerId)
      .order('planned_date', { ascending: true });

    const rows = unwrap<FollowUpRow[]>(response) ?? [];
    return rows.map((row) => FollowUpPersistenceMapper.toDomain(row));
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

  async findUpcoming(days: number): Promise<FollowUp[]> {
    const today = new Date();
    const until = new Date();
    until.setDate(until.getDate() + days);

    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('status', FollowUpStatus.PENDING)
      .gte('planned_date', toDateOnly(today))
      .lte('planned_date', toDateOnly(until))
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
