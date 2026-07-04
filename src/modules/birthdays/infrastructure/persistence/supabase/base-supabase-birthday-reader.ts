import { SupabaseClient } from '@supabase/supabase-js';
import { unwrap } from '../../../../../shared/supabase/supabase-response.util';
import { BirthdayCustomer } from '../../../domain/entities/birthday-customer.entity';
import { IBirthdayReader } from '../../../domain/repositories/birthday-reader.interface';
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

  async findTodaysBirthdays(): Promise<BirthdayCustomer[]> {
    const response = await this.supabase.from(VIEW).select('*');
    const rows = unwrap<BirthdayRow[]>(response) ?? [];
    return rows.map((row) => BirthdayPersistenceMapper.toDomain(row));
  }
}
