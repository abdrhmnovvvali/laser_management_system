import { Inject, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { SupabaseClient } from '@supabase/supabase-js';
import { Socket } from 'socket.io';
import { AuthenticatedUser } from '../../../../shared/guards/authenticated-user.interface';
import { Role } from '../../../../shared/guards/roles.enum';
import { SUPABASE_ADMIN_CLIENT } from '../../../../shared/supabase/supabase.constants';

interface ProfileRow {
  role: Role;
  branch_id: string | null;
}

@Injectable()
export class NotificationWsAuthService {
  private readonly logger = new Logger(NotificationWsAuthService.name);

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
  ) {}

  async authenticate(client: Socket): Promise<AuthenticatedUser> {
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Bearer token tapılmadı');
    }

    const {
      data: { user },
      error,
    } = await this.supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new WsException('Token yanlış və ya vaxtı bitib');
    }

    const profile = await this.fetchProfile(user.id);

    return {
      id: user.id,
      email: user.email,
      role: profile.role,
      branchId: profile.branch_id,
    };
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.startsWith('Bearer ')
        ? authToken.slice('Bearer '.length)
        : authToken.trim();
    }

    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length);
    }

    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string' && queryToken.trim()) {
      return queryToken.trim();
    }

    return undefined;
  }

  private async fetchProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await this.supabaseAdmin
      .from('profiles')
      .select('role, branch_id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      this.logger.warn(`WS profil tapılmadı: ${userId}`);
      throw new WsException('İstifadəçi profili tapılmadı');
    }

    return data;
  }
}
