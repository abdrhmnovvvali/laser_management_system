import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import { BaseSupabaseBirthdayReader } from './base-supabase-birthday-reader';

@Injectable()
export class SupabaseBirthdayAdminReader extends BaseSupabaseBirthdayReader {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT) protected readonly supabase: SupabaseClient,
  ) {
    super();
  }
}
