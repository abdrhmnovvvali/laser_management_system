import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import { BaseSupabaseBirthdayReader } from './base-supabase-birthday-reader';

@Injectable()
export class SupabaseBirthdayReader extends BaseSupabaseBirthdayReader {
  constructor(
    @Inject(SUPABASE_CLIENT) protected readonly supabase: SupabaseClient,
  ) {
    super();
  }
}
