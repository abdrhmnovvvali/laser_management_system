import { Global, Module } from '@nestjs/common';
import { supabaseAdminProvider } from './supabase-admin.provider';
import { supabaseRequestProvider } from './supabase-request.provider';
import { SUPABASE_ADMIN_CLIENT, SUPABASE_CLIENT } from './supabase.constants';

/**
 * Global module exposing two Supabase clients via DI:
 * - SUPABASE_CLIENT: request-scoped, RLS-aware (use in repositories for normal CRUD)
 * - SUPABASE_ADMIN_CLIENT: singleton, bypasses RLS (use only for system/cron/auth-admin flows)
 */
@Global()
@Module({
  providers: [supabaseAdminProvider, supabaseRequestProvider],
  exports: [SUPABASE_ADMIN_CLIENT, SUPABASE_CLIENT],
})
export class SupabaseModule {}
