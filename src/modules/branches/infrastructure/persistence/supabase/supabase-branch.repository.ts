import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import {
  unwrap,
  unwrapOrThrow,
} from '../../../../../shared/supabase/supabase-response.util';
import { Branch } from '../../../domain/entities/branch.entity';
import {
  CreateBranchData,
  IBranchRepository,
  UpdateBranchData,
} from '../../../domain/repositories/branch.repository.interface';
import {
  BranchPersistenceMapper,
  BranchRow,
} from '../../mappers/branch-persistence.mapper';

const TABLE = 'branches';

@Injectable()
export class SupabaseBranchRepository implements IBranchRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<Branch[]> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    const rows = unwrap<BranchRow[]>(response) ?? [];
    return rows.map((row) => BranchPersistenceMapper.toDomain(row));
  }

  async findById(id: string): Promise<Branch | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<BranchRow>(response);
    return row ? BranchPersistenceMapper.toDomain(row) : null;
  }

  async create(data: CreateBranchData): Promise<Branch> {
    const response = await this.supabase
      .from(TABLE)
      .insert({ name: data.name, address: data.address ?? null })
      .select('*')
      .single();

    return BranchPersistenceMapper.toDomain(unwrapOrThrow<BranchRow>(response));
  }

  async update(id: string, data: UpdateBranchData): Promise<Branch> {
    const response = await this.supabase
      .from(TABLE)
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    return BranchPersistenceMapper.toDomain(unwrapOrThrow<BranchRow>(response));
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }
}
