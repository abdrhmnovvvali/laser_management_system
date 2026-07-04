import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase.constants';
import { AuthenticatedUser } from './authenticated-user.interface';
import { Role } from './roles.enum';

interface ProfileRow {
  role: Role;
  branch_id: string | null;
}

/**
 * Validates the Supabase JWT sent in the Authorization header and attaches
 * the resolved user (id, email, role, branchId) to the request.
 * Routes annotated with @Public() skip this check.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Bearer token tapılmadı');
    }

    const {
      data: { user },
      error,
    } = await this.supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token yanlış və ya vaxtı bitib');
    }

    const profile = await this.fetchProfile(user.id);

    request.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      branchId: profile.branch_id,
    } satisfies AuthenticatedUser;

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      return undefined;
    }
    return header.slice('Bearer '.length);
  }

  private async fetchProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await this.supabaseAdmin
      .from('profiles')
      .select('role, branch_id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new UnauthorizedException('İstifadəçi profili tapılmadı');
    }

    return data;
  }
}
