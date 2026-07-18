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
import { Device } from '../../../domain/entities/device.entity';
import {
  CreateDeviceData,
  DeviceListOptions,
  IDeviceRepository,
  UpdateDeviceData,
} from '../../../domain/repositories/device.repository.interface';
import {
  DevicePersistenceMapper,
  DeviceRow,
} from '../../mappers/device-persistence.mapper';

const TABLE = 'devices';

@Injectable()
export class SupabaseDeviceRepository implements IDeviceRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(options?: DeviceListOptions): Promise<PaginatedResult<Device>> {
    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.branchId) {
      query = query.eq('branch_id', options.branchId);
    }
    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<DeviceRow>(response);
    return createPaginatedResult(
      rows.map((row) => DevicePersistenceMapper.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Device | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<DeviceRow>(response);
    return row ? DevicePersistenceMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Device[]> {
    if (ids.length === 0) {
      return [];
    }

    const response = await this.supabase.from(TABLE).select('*').in('id', ids);
    const rows = unwrap<DeviceRow[]>(response) ?? [];
    return rows.map((row) => DevicePersistenceMapper.toDomain(row));
  }

  async create(data: CreateDeviceData): Promise<Device> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        branch_id: data.branchId,
        type: data.type,
        shot_counter: data.shotCounter ?? 0,
      })
      .select('*')
      .single();

    return DevicePersistenceMapper.toDomain(unwrapOrThrow<DeviceRow>(response));
  }

  async update(id: string, data: UpdateDeviceData): Promise<Device> {
    const payload: Record<string, unknown> = {};
    if (data.type !== undefined) payload.type = data.type;
    if (data.shotCounter !== undefined) payload.shot_counter = data.shotCounter;

    const response = await this.supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    return DevicePersistenceMapper.toDomain(unwrapOrThrow<DeviceRow>(response));
  }

  async incrementShotCounter(id: string, byAmount: number): Promise<Device> {
    const response = await this.supabase.rpc('increment_device_shot_counter', {
      p_device_id: id,
      p_amount: byAmount,
    });

    return DevicePersistenceMapper.toDomain(unwrapOrThrow<DeviceRow>(response));
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }
}
