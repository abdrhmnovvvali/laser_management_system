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
<<<<<<< HEAD
  DeviceListOptions,
=======
  DeviceTranslationInput,
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
  IDeviceRepository,
  UpdateDeviceData,
} from '../../../domain/repositories/device.repository.interface';
import {
  DevicePersistenceMapper,
  DeviceRow,
} from '../../mappers/device-persistence.mapper';

const TABLE = 'devices';
const TRANSLATIONS_TABLE = 'device_translations';
const SELECT_WITH_TRANSLATIONS = '*, device_translations(locale, type)';

@Injectable()
export class SupabaseDeviceRepository implements IDeviceRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(options?: DeviceListOptions): Promise<PaginatedResult<Device>> {
    let query = this.supabase
      .from(TABLE)
<<<<<<< HEAD
      .select('*', { count: 'exact' })
=======
      .select(SELECT_WITH_TRANSLATIONS)
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
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
      .select(SELECT_WITH_TRANSLATIONS)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<DeviceRow>(response);
    return row ? DevicePersistenceMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Device[]> {
    if (ids.length === 0) {
      return [];
    }

    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS)
      .in('id', ids);
    const rows = unwrap<DeviceRow[]>(response) ?? [];
    return rows.map((row) => DevicePersistenceMapper.toDomain(row));
  }

  async create(data: CreateDeviceData): Promise<Device> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        branch_id: data.branchId,
        shot_counter: data.shotCounter ?? 0,
      })
      .select('id')
      .single();

    const created = unwrapOrThrow<{ id: string }>(response);
    await this.replaceTranslations(created.id, data.translations);
    const device = await this.findById(created.id);
    if (!device) {
      throw new Error('Device create sonrası tapılmadı');
    }
    return device;
  }

  async update(id: string, data: UpdateDeviceData): Promise<Device> {
    if (data.shotCounter !== undefined) {
      const response = await this.supabase
        .from(TABLE)
        .update({ shot_counter: data.shotCounter })
        .eq('id', id)
        .select('id')
        .single();
      unwrapOrThrow(response);
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    const device = await this.findById(id);
    if (!device) {
      throw new Error('Device update sonrası tapılmadı');
    }
    return device;
  }

  async incrementShotCounter(id: string, byAmount: number): Promise<Device> {
    const response = await this.supabase.rpc('increment_device_shot_counter', {
      p_device_id: id,
      p_amount: byAmount,
    });
    unwrapOrThrow(response);

    const device = await this.findById(id);
    if (!device) {
      throw new Error('Device shot counter yeniləmə sonrası tapılmadı');
    }
    return device;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private async replaceTranslations(
    deviceId: string,
    translations: DeviceTranslationInput[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(TRANSLATIONS_TABLE)
      .delete()
      .eq('device_id', deviceId);
    unwrap(deleteResponse);

    const insertResponse = await this.supabase.from(TRANSLATIONS_TABLE).insert(
      translations.map((item) => ({
        device_id: deviceId,
        locale: item.locale,
        type: item.type,
      })),
    );
    unwrap(insertResponse);
  }
}
