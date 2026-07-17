import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { Zone } from '../../../domain/entities/zone.entity';
import {
  CreateZoneData,
  IZoneRepository,
  UpdateZoneData,
  ZoneTranslationInput,
} from '../../../domain/repositories/zone.repository.interface';
import {
  ZonePersistenceMapper,
  ZoneRow,
} from '../../mappers/zone-persistence.mapper';

const TABLE = 'zones';
const TRANSLATIONS_TABLE = 'zone_translations';
const SELECT_WITH_TRANSLATIONS = '*, zone_translations(locale, name)';

@Injectable()
export class SupabaseZoneRepository implements IZoneRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(deviceId?: string): Promise<Zone[]> {
    let query = this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS)
      .order('created_at', { ascending: false });

    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const response = await query;
    const rows = unwrap<ZoneRow[]>(response) ?? [];
    return rows.map((row) => ZonePersistenceMapper.toDomain(row));
  }

  async findById(id: string): Promise<Zone | null> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<ZoneRow>(response);
    return row ? ZonePersistenceMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Zone[]> {
    if (ids.length === 0) {
      return [];
    }
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS)
      .in('id', ids);
    const rows = unwrap<ZoneRow[]>(response) ?? [];
    return rows.map((row) => ZonePersistenceMapper.toDomain(row));
  }

  async findByNames(names: string[]): Promise<Zone[]> {
    const normalized = [
      ...new Set(names.map((name) => name.trim()).filter(Boolean)),
    ];
    if (normalized.length === 0) {
      return [];
    }

    const orConditions = normalized
      .map((name) => `name.ilike.%${name}%`)
      .join(',');

    const translationResponse = await this.supabase
      .from(TRANSLATIONS_TABLE)
      .select('zone_id')
      .or(orConditions);

    const translationRows =
      unwrap<Array<{ zone_id: string }>>(translationResponse) ?? [];
    const zoneIds = [...new Set(translationRows.map((row) => row.zone_id))];
    if (zoneIds.length === 0) {
      return [];
    }

    return this.findByIds(zoneIds);
  }

  async create(data: CreateZoneData): Promise<Zone> {
    const response = await this.supabase
      .from(TABLE)
      .insert({ device_id: data.deviceId, price: data.price })
      .select('id')
      .single();

    const created = unwrapOrThrow<{ id: string }>(response);
    await this.replaceTranslations(created.id, data.translations);
    const zone = await this.findById(created.id);
    if (!zone) {
      throw new Error('Zone create sonrası tapılmadı');
    }
    return zone;
  }

  async update(id: string, data: UpdateZoneData): Promise<Zone> {
    if (data.price !== undefined) {
      const response = await this.supabase
        .from(TABLE)
        .update({ price: data.price })
        .eq('id', id)
        .select('id')
        .single();
      unwrapOrThrow(response);
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    const zone = await this.findById(id);
    if (!zone) {
      throw new Error('Zone update sonrası tapılmadı');
    }
    return zone;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private async replaceTranslations(
    zoneId: string,
    translations: ZoneTranslationInput[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(TRANSLATIONS_TABLE)
      .delete()
      .eq('zone_id', zoneId);
    unwrap(deleteResponse);

    const insertResponse = await this.supabase.from(TRANSLATIONS_TABLE).insert(
      translations.map((item) => ({
        zone_id: zoneId,
        locale: item.locale,
        name: item.name,
      })),
    );
    unwrap(insertResponse);
  }
}
