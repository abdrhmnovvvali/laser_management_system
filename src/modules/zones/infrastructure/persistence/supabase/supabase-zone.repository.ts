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
import { Zone } from '../../../domain/entities/zone.entity';
import {
  CreateZoneData,
  IZoneRepository,
  UpdateZoneData,
  ZoneListOptions,
} from '../../../domain/repositories/zone.repository.interface';
import {
  ZonePersistenceMapper,
  ZoneRow,
} from '../../mappers/zone-persistence.mapper';

const TABLE = 'zones';

@Injectable()
export class SupabaseZoneRepository implements IZoneRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(options?: ZoneListOptions): Promise<PaginatedResult<Zone>> {
    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.deviceId) {
      query = query.eq('device_id', options.deviceId);
    }
    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<ZoneRow>(response);
    return createPaginatedResult(
      rows.map((row) => ZonePersistenceMapper.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Zone | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<ZoneRow>(response);
    return row ? ZonePersistenceMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Zone[]> {
    if (ids.length === 0) {
      return [];
    }
    const response = await this.supabase.from(TABLE).select('*').in('id', ids);
    const rows = unwrap<ZoneRow[]>(response) ?? [];
    return rows.map((row) => ZonePersistenceMapper.toDomain(row));
  }

  async findByNames(names: string[]): Promise<Zone[]> {
    const normalized = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
    if (normalized.length === 0) {
      return [];
    }

    const orConditions = normalized
      .map((name) => `name.ilike.%${name}%`)
      .join(',');

    const response = await this.supabase.from(TABLE).select('*').or(orConditions);
    const rows = unwrap<ZoneRow[]>(response) ?? [];
    return rows.map((row) => ZonePersistenceMapper.toDomain(row));
  }

  async create(data: CreateZoneData): Promise<Zone> {
    const response = await this.supabase
      .from(TABLE)
      .insert({ name: data.name, device_id: data.deviceId, price: data.price })
      .select('*')
      .single();

    return ZonePersistenceMapper.toDomain(unwrapOrThrow<ZoneRow>(response));
  }

  async update(id: string, data: UpdateZoneData): Promise<Zone> {
    const response = await this.supabase
      .from(TABLE)
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    return ZonePersistenceMapper.toDomain(unwrapOrThrow<ZoneRow>(response));
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }
}
