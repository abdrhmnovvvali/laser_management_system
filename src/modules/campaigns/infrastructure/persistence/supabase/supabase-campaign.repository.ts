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
  CreateCampaignData,
  ICampaignRepository,
  UpdateCampaignData,
} from '../../../domain/repositories/campaign.repository.interface';
import {
  CampaignPersistenceMapper,
  CampaignRow,
} from '../../mappers/campaign-persistence.mapper';

const TABLE = 'campaigns';
const JUNCTION_TABLE = 'campaign_zones';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface CampaignZoneLinkRow {
  campaign_id: string;
  zone_id: string;
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
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: false });

    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<CampaignRow>(response);
    return createPaginatedResult(
      await this.mapRowsWithZones(rows),
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
      .select('*', { count: 'exact' })
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
      await this.mapRowsWithZones(rows),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Campaign | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<CampaignRow>(response);
    if (!row) {
      return null;
    }

    const zoneIdsByCampaign = await this.fetchZoneIdsByCampaignIds([row.id]);
    return CampaignPersistenceMapper.toDomain(
      row,
      zoneIdsByCampaign.get(row.id) ?? [],
    );
  }

  async create(data: CreateCampaignData): Promise<Campaign> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        name: data.name,
        description: data.description ?? null,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        start_date: toDateOnly(data.startDate),
        end_date: toDateOnly(data.endDate),
      })
      .select('*')
      .single();

    const created = unwrapOrThrow<CampaignRow>(response);
    await this.replaceZoneLinks(created.id, data.zoneIds);

    return CampaignPersistenceMapper.toDomain(created, data.zoneIds);
  }

  async update(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
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
        .eq('id', id);
      unwrap(response);
    }

    if (data.zoneIds) {
      await this.replaceZoneLinks(id, data.zoneIds);
    }

    return this.findById(id) as Promise<Campaign>;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private async mapRowsWithZones(rows: CampaignRow[]): Promise<Campaign[]> {
    const zoneIdsByCampaign = await this.fetchZoneIdsByCampaignIds(
      rows.map((row) => row.id),
    );

    return rows.map((row) =>
      CampaignPersistenceMapper.toDomain(
        row,
        zoneIdsByCampaign.get(row.id) ?? [],
      ),
    );
  }

  private async fetchZoneIdsByCampaignIds(
    campaignIds: string[],
  ): Promise<Map<string, string[]>> {
    const zoneIdsByCampaign = new Map<string, string[]>();
    if (campaignIds.length === 0) {
      return zoneIdsByCampaign;
    }

    const response = await this.supabase
      .from(JUNCTION_TABLE)
      .select('campaign_id, zone_id')
      .in('campaign_id', campaignIds);

    const links = unwrap<CampaignZoneLinkRow[]>(response) ?? [];
    for (const link of links) {
      const existing = zoneIdsByCampaign.get(link.campaign_id) ?? [];
      existing.push(link.zone_id);
      zoneIdsByCampaign.set(link.campaign_id, existing);
    }

    return zoneIdsByCampaign;
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
