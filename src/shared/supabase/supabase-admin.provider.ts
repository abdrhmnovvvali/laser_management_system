import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from './supabase.constants';

/**
 * Service-role client. Bypasses Row Level Security.
 * Only used for system-level operations (cron jobs, auth admin, cross-branch aggregation).
 */
export const supabaseAdminProvider: Provider = {
  provide: SUPABASE_ADMIN_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): SupabaseClient => {
    const url = configService.get<string>('supabase.url')!;
    const serviceRoleKey = configService.get<string>(
      'supabase.serviceRoleKey',
    )!;

    return createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as SupabaseClient;
  },
};
