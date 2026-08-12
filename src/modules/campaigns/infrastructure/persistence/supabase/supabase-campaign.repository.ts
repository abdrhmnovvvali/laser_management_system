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
import { Campaign } from '../../../domain/entities/campaign.entity';
import {
  CampaignListOptions,
  CampaignTranslationInput,
  CreateCampaignData,
  ICampaignRepository,
  UpdateCampaignData,
} from '../../../domain/repositories/campaign.repository.interface';
import {
  CampaignPersistenceMapper,
  CampaignRow,
} from '../../mappers/campaign-persistence.mapper';

const TABLE = 'campaigns';
const TRANSLATIONS_TABLE = 'campaign_translations';
const JUNCTION_TABLE = 'campaign_zones';
const SELECT_WITH_RELATIONS =
  '*, campaign_translations(locale, name, description), campaign_zones(zone_id)';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class SupabaseCampaignRepository implements ICampaignRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(
    options?: CampaignListOptions,
  ): Promise<PaginatedResult<Campaign>> {
    let query = this.supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS, { count: 'exact' })
      .order('start_date', { ascending: false });

    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<CampaignRow>(response);
    return createPaginatedResult(
      rows.map((row) => CampaignPersistenceMapper.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findActive(
    onDate: Date,
    options?: CampaignListOptions,
  ): Promise<PaginatedResult<Campaign>> {
    const dateOnly = toDateOnly(onDate);
    let query = this.supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS, { count: 'exact' })
      .lte('start_date', dateOnly)
      .gte('end_date', dateOnly)
      .order('start_date', { ascending: false });

    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<CampaignRow>(response);
    return createPaginatedResult(
      rows.map((row) => CampaignPersistenceMapper.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Campaign | null> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<CampaignRow>(response);
    return row ? CampaignPersistenceMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Campaign[]> {
    if (ids.length === 0) {
      return [];
    }

    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS)
      .in('id', ids);
    const rows = unwrap<CampaignRow[]>(response) ?? [];
    return rows.map((row) => CampaignPersistenceMapper.toDomain(row));
  }

  async create(data: CreateCampaignData): Promise<Campaign> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        discount_type: data.discountType,
        discount_value: data.discountValue,
        start_date: toDateOnly(data.startDate),
        end_date: toDateOnly(data.endDate),
      })
      .select('id')
      .single();

    const created = unwrapOrThrow<{ id: string }>(response);
    await this.replaceTranslations(created.id, data.translations);
    await this.replaceZoneLinks(created.id, data.zoneIds);

    const campaign = await this.findById(created.id);
    if (!campaign) {
      throw new Error('Campaign create sonrası tapılmadı');
    }
    return campaign;
  }

  async update(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const payload: Record<string, unknown> = {};
    if (data.discountType !== undefined)
      payload.discount_type = data.discountType;
    if (data.discountValue !== undefined)
      payload.discount_value = data.discountValue;
    if (data.startDate !== undefined)
      payload.start_date = toDateOnly(data.startDate);
    if (data.endDate !== undefined) payload.end_date = toDateOnly(data.endDate);

    if (Object.keys(payload).length > 0) {
      const response = await this.supabase
        .from(TABLE)
        .update(payload)
        .eq('id', id)
        .select('id')
        .single();
      unwrapOrThrow(response);
    }

    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    if (data.zoneIds) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    const campaign = await this.findById(id);
    if (!campaign) {
      throw new Error('Campaign update sonrası tapılmadı');
    }
    return campaign;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private async replaceTranslations(
    campaignId: string,
    translations: CampaignTranslationInput[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(TRANSLATIONS_TABLE)
      .delete()
      .eq('campaign_id', campaignId);
    unwrap(deleteResponse);

    const insertResponse = await this.supabase.from(TRANSLATIONS_TABLE).insert(
      translations.map((item) => ({
        campaign_id: campaignId,
        locale: item.locale,
        name: item.name,
        description: item.description ?? null,
      })),
    );
    unwrap(insertResponse);
  }

  private async replaceZoneLinks(
    campaignId: string,
    zoneIds: string[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(JUNCTION_TABLE)
      .delete()
      .eq('campaign_id', campaignId);
    unwrap(deleteResponse);

    if (zoneIds.length === 0) {
      return;
    }

    const insertResponse = await this.supabase.from(JUNCTION_TABLE).insert(
      zoneIds.map((zoneId) => ({
        campaign_id: campaignId,
        zone_id: zoneId,
      })),
    );
    unwrap(insertResponse);
  }
}
