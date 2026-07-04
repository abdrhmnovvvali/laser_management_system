import { Provider, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { SUPABASE_CLIENT } from './supabase.constants';

/**
 * Request-scoped client. Forwards the caller's JWT so that PostgreSQL
 * Row Level Security policies are evaluated as the authenticated user
 * (branch employee vs admin), instead of bypassing them.
 */
export const supabaseRequestProvider: Provider = {
  provide: SUPABASE_CLIENT,
  scope: Scope.REQUEST,
  inject: [ConfigService, REQUEST],
  useFactory: (
    configService: ConfigService,
    request: Request,
  ): SupabaseClient => {
    const url = configService.get<string>('supabase.url')!;
    const anonKey = configService.get<string>('supabase.anonKey')!;
    const authHeader = request.headers['authorization'];

    return createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }) as SupabaseClient;
  },
};
