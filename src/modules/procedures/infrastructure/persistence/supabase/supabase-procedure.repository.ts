import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { Procedure } from '../../../domain/entities/procedure.entity';
import {
  CreateProcedureData,
  IProcedureRepository,
  ProcedureFilters,
  UpdateProcedureData,
} from '../../../domain/repositories/procedure.repository.interface';
import {
  ProcedurePersistenceMapper,
  ProcedureRow,
} from '../../mappers/procedure-persistence.mapper';

const TABLE = 'procedures';
const JUNCTION_TABLE = 'procedure_zones';
const SELECT_WITH_ZONES = '*, procedure_zones(zone_id)';

@Injectable()
export class SupabaseProcedureRepository implements IProcedureRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(filters: ProcedureFilters): Promise<Procedure[]> {
    const selectClause = filters.branchId
      ? `${SELECT_WITH_ZONES}, customers!inner(branch_id)`
      : SELECT_WITH_ZONES;

    let query = this.supabase
      .from(TABLE)
      .select(selectClause)
      .order('date', { ascending: false });

    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters.deviceId) {
      query = query.eq('device_id', filters.deviceId);
    }
    if (filters.branchId) {
      query = query.eq('customers.branch_id', filters.branchId);
    }
    if (filters.dateFrom) {
      query = query.gte('date', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      query = query.lte('date', filters.dateTo.toISOString());
    }

    const response = await query;
    const rows = unwrap<ProcedureRow[]>(response) ?? [];
    return rows.map((row) => ProcedurePersistenceMapper.toDomain(row));
  }

  async findById(id: string): Promise<Procedure | null> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_ZONES)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<ProcedureRow>(response);
    return row ? ProcedurePersistenceMapper.toDomain(row) : null;
  }

  async create(data: CreateProcedureData): Promise<Procedure> {
    const insertResponse = await this.supabase
      .from(TABLE)
      .insert({
        customer_id: data.customerId,
        device_id: data.deviceId,
        package_id: data.packageId,
        date: data.date.toISOString(),
        declared_shot_count: data.declaredShotCount,
        actual_shot_count: data.actualShotCount,
        price: data.price,
      })
      .select('*')
      .single();

    const created = unwrapOrThrow<{ id: string }>(insertResponse);

    if (data.zoneIds.length > 0) {
      const linkResponse = await this.supabase.from(JUNCTION_TABLE).insert(
        data.zoneIds.map((zoneId) => ({
          procedure_id: created.id,
          zone_id: zoneId,
        })),
      );
      unwrap(linkResponse);
    }

    return this.findById(created.id) as Promise<Procedure>;
  }

  async update(id: string, data: UpdateProcedureData): Promise<Procedure> {
    const payload: Record<string, unknown> = {};
    if (data.date !== undefined) payload.date = data.date.toISOString();
    if (data.declaredShotCount !== undefined) {
      payload.declared_shot_count = data.declaredShotCount;
    }
    if (data.actualShotCount !== undefined) {
      payload.actual_shot_count = data.actualShotCount;
    }

    const response = await this.supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id);
    unwrap(response);

    return this.findById(id) as Promise<Procedure>;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }
}
