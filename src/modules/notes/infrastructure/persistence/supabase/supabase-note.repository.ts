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
import { Note } from '../../../domain/entities/note.entity';
import {
  CreateNoteData,
  INoteRepository,
  NoteListOptions,
  UpdateNoteData,
} from '../../../domain/repositories/note.repository.interface';
import {
  NotePersistenceMapper,
  NoteRow,
} from '../../mappers/note-persistence.mapper';

const TABLE = 'notes';

@Injectable()
export class SupabaseNoteRepository implements INoteRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAllByCustomer(
    options: NoteListOptions,
  ): Promise<PaginatedResult<Note>> {
    let query = this.supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('customer_id', options.customerId)
      .order('created_at', { ascending: false });

    if (options.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<NoteRow>(response);
    return createPaginatedResult(
      rows.map((row) => NotePersistenceMapper.toDomain(row)),
      total,
      options.pagination,
    );
  }

  async findById(id: string): Promise<Note | null> {
    const response = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const row = unwrap<NoteRow>(response);
    return row ? NotePersistenceMapper.toDomain(row) : null;
  }

  async create(data: CreateNoteData): Promise<Note> {
    const response = await this.supabase
      .from(TABLE)
      .insert({
        customer_id: data.customerId,
        type: data.type,
        content: data.content,
        outcome: data.outcome ?? null,
      })
      .select('*')
      .single();

    return NotePersistenceMapper.toDomain(unwrapOrThrow<NoteRow>(response));
  }

  async update(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await this.supabase
      .from(TABLE)
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    return NotePersistenceMapper.toDomain(unwrapOrThrow<NoteRow>(response));
  }

  async delete(id: string): Promise<void> {
    const response = await this.supabase.from(TABLE).delete().eq('id', id);
    unwrap(response);
  }
}
