import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { Campaign } from '../../../domain/entities/campaign.entity';
import {
  CreateCampaignData,
  ICampaignRepository,
  UpdateCampaignData,
} from '../../../domain/repositories/campaign.repository.interface';
import {
  CampaignPersistenceMapper,
  CampaignRow,
} from '../../mappers/campaign-persistence.mapper';

const TABLE = 'campaigns';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class SupabaseCampaignRepository implements ICampaignRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<Campaign[]> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .order('start_date', { ascending: false });

    const rows = unwrap<CampaignRow[]>(response) ?? [];
    return rows.map((row) => CampaignPersistenceMapper.toDomain(row));
  }

  async findActive(onDate: Date): Promise<Campaign[]> {
    const dateOnly = toDateOnly(onDate);
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .lte('start_date', dateOnly)
      .gte('end_date', dateOnly)
      .order('start_date', { ascending: false });

    const rows = unwrap<CampaignRow[]>(response) ?? [];
    return rows.map((row) => CampaignPersistenceMapper.toDomain(row));
  }

  async findById(id: string): Promise<Campaign | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<CampaignRow>(response);
    return row ? CampaignPersistenceMapper.toDomain(row) : null;
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

    return CampaignPersistenceMapper.toDomain(
      unwrapOrThrow<CampaignRow>(response),
    );
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

    const response = await this.supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    return CampaignPersistenceMapper.toDomain(
      unwrapOrThrow<CampaignRow>(response),
    );
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }
}
