import { SupabaseClient } from '@supabase/supabase-js';
import { readPaginatedRows } from '../../../../../shared/supabase/supabase-pagination.util';
import {
  createPaginatedResult,
  toOffset,
} from '../../../../../shared/pagination/pagination.util';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import { BirthdayCustomer } from '../../../domain/entities/birthday-customer.entity';
import {
  BirthdayListOptions,
  IBirthdayReader,
} from '../../../domain/repositories/birthday-reader.interface';
import {
  BirthdayPersistenceMapper,
  BirthdayRow,
} from '../../mappers/birthday-persistence.mapper';

const VIEW = 'todays_birthdays_view';

/**
 * Shared query logic for both the RLS-aware and admin birthday readers —
 * only the injected Supabase client differs between the two.
 */
export abstract class BaseSupabaseBirthdayReader implements IBirthdayReader {
  protected abstract readonly supabase: SupabaseClient;

  async findTodaysBirthdays(
    options?: BirthdayListOptions,
  ): Promise<PaginatedResult<BirthdayCustomer>> {
    let query = this.supabase.from(VIEW).select('*', { count: 'exact' });

    if (options?.pagination) {
      const { from, to } = toOffset(options.pagination);
      query = query.range(from, to);
    }

    const response = await query;
    const { rows, total } = readPaginatedRows<BirthdayRow>(response);
    return createPaginatedResult(
      rows.map((row) => BirthdayPersistenceMapper.toDomain(row)),
      total,
      options?.pagination,
    );
  }
}
