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

interface ProcedureZoneLinkRow {
  procedure_id: string;
  zone_id: string;
}

@Injectable()
export class SupabaseProcedureRepository implements IProcedureRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(filters: ProcedureFilters): Promise<PaginatedResult<Procedure>> {
    let procedureIds: string[] | undefined;
    if (filters.zoneIds?.length) {
      procedureIds = await this.findProcedureIdsByZoneIds(filters.zoneIds);
      if (procedureIds.length === 0) {
        return createPaginatedResult([], 0, filters.pagination);
      }
    }

    const selectClause = filters.branchId
      ? '*, customers!inner(branch_id)'
      : '*';

    let query = this.supabase
      .from(TABLE)
      .select(selectClause, { count: 'exact' })
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
    if (procedureIds?.length) {
      query = query.in('id', procedureIds);
    }

    if (filters.pagination) {
      const { from, to } = toOffset(filters.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<ProcedureRow>(response);
    return createPaginatedResult(
      await this.mapRowsWithZones(rows),
      total,
      filters.pagination,
    );
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

  async countByCustomerId(customerId: string): Promise<number> {
    const response = await this.supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId);

    unwrap<null>(response);
    return (response as { count: number | null }).count ?? 0;
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
        free_zone_id: data.freeZoneId ?? null,
        discount_amount: data.discountAmount ?? 0,
        visit_number: data.visitNumber ?? null,
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

  private async mapRowsWithZones(rows: ProcedureRow[]): Promise<Procedure[]> {
    const zoneIdsByProcedure = await this.fetchZoneIdsByProcedureIds(
      rows.map((row) => row.id),
    );

    return rows.map((row) =>
      ProcedurePersistenceMapper.toDomain({
        ...row,
        procedure_zones: (zoneIdsByProcedure.get(row.id) ?? []).map(
          (zoneId) => ({ zone_id: zoneId }),
        ),
      }),
    );
  }

  private async fetchZoneIdsByProcedureIds(
    procedureIds: string[],
  ): Promise<Map<string, string[]>> {
    const zoneIdsByProcedure = new Map<string, string[]>();
    if (procedureIds.length === 0) {
      return zoneIdsByProcedure;
    }

    const response = await this.supabase
      .from(JUNCTION_TABLE)
      .select('procedure_id, zone_id')
      .in('procedure_id', procedureIds);

    const links = unwrap<ProcedureZoneLinkRow[]>(response) ?? [];
    for (const link of links) {
      const existing = zoneIdsByProcedure.get(link.procedure_id) ?? [];
      existing.push(link.zone_id);
      zoneIdsByProcedure.set(link.procedure_id, existing);
    }

    return zoneIdsByProcedure;
  }

  private async findProcedureIdsByZoneIds(zoneIds: string[]): Promise<string[]> {
    const [junctionResponse, freeZoneResponse] = await Promise.all([
      this.supabase
        .from(JUNCTION_TABLE)
        .select('procedure_id')
        .in('zone_id', zoneIds),
      this.supabase.from(TABLE).select('id').in('free_zone_id', zoneIds),
    ]);

    const junctionRows = unwrap<{ procedure_id: string }[]>(junctionResponse) ?? [];
    const freeZoneRows = unwrap<{ id: string }[]>(freeZoneResponse) ?? [];

    return [
      ...new Set([
        ...junctionRows.map((row) => row.procedure_id),
        ...freeZoneRows.map((row) => row.id),
      ]),
    ];
  }
}
