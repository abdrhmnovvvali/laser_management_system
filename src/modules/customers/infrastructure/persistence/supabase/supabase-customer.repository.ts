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
import { Customer } from '../../../domain/entities/customer.entity';
import {
  CreateCustomerData,
  CustomerFilters,
  ICustomerRepository,
  UpdateCustomerData,
} from '../../../domain/repositories/customer.repository.interface';
import {
  CustomerPersistenceMapper,
  CustomerRow,
} from '../../mappers/customer-persistence.mapper';

const TABLE = 'customers';

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

function toIlikePattern(value: string): string {
  return `%${escapeIlikePattern(value)}%`;
}

interface ProcedureZoneRow {
  procedures: { customer_id: string } | null;
}

@Injectable()
export class SupabaseCustomerRepository implements ICustomerRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(filters: CustomerFilters): Promise<PaginatedResult<Customer>> {
    let zoneCustomerIds: string[] | undefined;
    if (filters.zoneId) {
      zoneCustomerIds = await this.findCustomerIdsByZone(filters.zoneId);
      if (zoneCustomerIds.length === 0) {
        return createPaginatedResult([], 0, filters.pagination);
      }
    }

    let query = this.buildListQuery(filters, zoneCustomerIds);
    if (filters.pagination) {
      const { from, to } = toOffset(filters.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<CustomerRow>(response);
    return createPaginatedResult(
      rows.map((row) => CustomerPersistenceMapper.toDomain(row)),
      total,
      filters.pagination,
    );
  }

  async count(filters: Omit<CustomerFilters, 'pagination'>): Promise<number> {
    let zoneCustomerIds: string[] | undefined;
    if (filters.zoneId) {
      zoneCustomerIds = await this.findCustomerIdsByZone(filters.zoneId);
      if (zoneCustomerIds.length === 0) {
        return 0;
      }
    }

    const response = await this.buildCountQuery(filters, zoneCustomerIds);
    unwrap<null>(response);
    return (response as { count: number | null }).count ?? 0;
  }

  private buildListQuery(
    filters: Omit<CustomerFilters, 'pagination'>,
    zoneCustomerIds?: string[],
  ) {
    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('registered_at', { ascending: false });

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId);
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }
    if (filters.search) {
      query = this.applySearchFilter(query, filters.search);
    }
    if (zoneCustomerIds?.length) {
      query = query.in('id', zoneCustomerIds);
    }

    return query;
  }

  private buildCountQuery(
    filters: Omit<CustomerFilters, 'pagination'>,
    zoneCustomerIds?: string[],
  ) {
    let query = this.supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true });

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId);
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }
    if (filters.search) {
      query = this.applySearchFilter(query, filters.search);
    }
    if (zoneCustomerIds?.length) {
      query = query.in('id', zoneCustomerIds);
    }

    return query;
  }

  async findById(id: string): Promise<Customer | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<CustomerRow>(response);
    return row ? CustomerPersistenceMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Customer[]> {
    if (ids.length === 0) {
      return [];
    }

    const response = await this.supabase.from(TABLE).select('*').in('id', ids);
    const rows = unwrap<CustomerRow[]>(response) ?? [];
    return rows.map((row) => CustomerPersistenceMapper.toDomain(row));
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone ?? null,
        birth_date: data.birthDate
          ? data.birthDate.toISOString().slice(0, 10)
          : null,
        gender: data.gender ?? null,
        branch_id: data.branchId,
      })
      .select('*')
      .single();

    return CustomerPersistenceMapper.toDomain(
      unwrapOrThrow<CustomerRow>(response),
    );
  }

  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    const payload: Record<string, unknown> = {};
    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined) payload.last_name = data.lastName;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.birthDate !== undefined) {
      payload.birth_date = data.birthDate
        ? data.birthDate.toISOString().slice(0, 10)
        : null;
    }
    if (data.gender !== undefined) payload.gender = data.gender;
    if (data.branchId !== undefined) payload.branch_id = data.branchId;

    const response = await this.supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    return CustomerPersistenceMapper.toDomain(
      unwrapOrThrow<CustomerRow>(response),
    );
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private applySearchFilter<T extends { or: (filters: string) => T }>(
    query: T,
    search: string,
  ): T {
    const term = search.trim();
    if (!term) {
      return query;
    }

    const parts = term.split(/\s+/).filter(Boolean).map(escapeIlikePattern);
    const fullPattern = toIlikePattern(term);

    if (parts.length <= 1) {
      const pattern = toIlikePattern(parts[0] ?? term);
      return query.or(
        `first_name.ilike.${pattern},last_name.ilike.${pattern},phone.ilike.${pattern}`,
      );
    }

    const firstNamePart = toIlikePattern(parts[0]);
    const lastNamePart = toIlikePattern(parts.slice(1).join(' '));

    return query.or(
      [
        `and(first_name.ilike.${firstNamePart},last_name.ilike.${lastNamePart})`,
        `and(first_name.ilike.${lastNamePart},last_name.ilike.${firstNamePart})`,
        `first_name.ilike.${fullPattern}`,
        `last_name.ilike.${fullPattern}`,
        `phone.ilike.${fullPattern}`,
      ].join(','),
    );
  }

  private async findCustomerIdsByZone(zoneId: string): Promise<string[]> {
    const response = await this.supabase
      .from('procedure_zones')
      .select('procedures!inner(customer_id)')
      .eq('zone_id', zoneId);

    const rows = unwrap<ProcedureZoneRow[]>(response) ?? [];
    const ids = rows
      .map((row) => row.procedures?.customer_id)
      .filter((id): id is string => Boolean(id));

    return Array.from(new Set(ids));
  }
}
