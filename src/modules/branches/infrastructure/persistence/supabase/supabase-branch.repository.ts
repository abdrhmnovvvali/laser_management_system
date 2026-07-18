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
import { Branch } from '../../../domain/entities/branch.entity';
import {
  BranchListOptions,
  BranchTranslationInput,
  CreateBranchData,
  IBranchRepository,
  UpdateBranchData,
} from '../../../domain/repositories/branch.repository.interface';
import {
  BranchPersistenceMapper,
  BranchRow,
} from '../../mappers/branch-persistence.mapper';

const TABLE = 'branches';
const TRANSLATIONS_TABLE = 'branch_translations';
const SELECT_WITH_TRANSLATIONS =
  '*, branch_translations(locale, name, address)';

@Injectable()
export class SupabaseBranchRepository implements IBranchRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(options?: BranchListOptions): Promise<PaginatedResult<Branch>> {
    let query = this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<BranchRow>(response);
    return createPaginatedResult(
      rows.map((row) => BranchPersistenceMapper.toDomain(row)),
      total,
      options?.pagination,
    );
  }

  async findById(id: string): Promise<Branch | null> {
    const response = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_TRANSLATIONS)
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<BranchRow>(response);
    return row ? BranchPersistenceMapper.toDomain(row) : null;
  }

  async create(data: CreateBranchData): Promise<Branch> {
    const response = await this.supabase
      .from(TABLE)
      .insert({})
      .select('id')
      .single();

    const created = unwrapOrThrow<{ id: string }>(response);
    await this.replaceTranslations(created.id, data.translations);
    const branch = await this.findById(created.id);
    if (!branch) {
      throw new Error('Branch create sonrası tapılmadı');
    }
    return branch;
  }

  async update(id: string, data: UpdateBranchData): Promise<Branch> {
    if (data.translations) {
      await this.replaceTranslations(id, data.translations);
    }

    const branch = await this.findById(id);
    if (!branch) {
      throw new Error('Branch update sonrası tapılmadı');
    }
    return branch;
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }

  private async replaceTranslations(
    branchId: string,
    translations: BranchTranslationInput[],
  ): Promise<void> {
    const deleteResponse = await this.supabase
      .from(TRANSLATIONS_TABLE)
      .delete()
      .eq('branch_id', branchId);
    unwrap(deleteResponse);

    const insertResponse = await this.supabase.from(TRANSLATIONS_TABLE).insert(
      translations.map((item) => ({
        branch_id: branchId,
        locale: item.locale,
        name: item.name,
        address: item.address ?? null,
      })),
    );
    unwrap(insertResponse);
  }
}
