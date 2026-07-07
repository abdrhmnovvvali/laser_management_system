import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../../../../../shared/supabase/supabase.constants';
import { Role } from '../../../../../shared/guards/roles.enum';
import { BusinessRuleViolationException } from '../../../../../shared/kernel/domain.exception';
import { AuthSession } from '../../../domain/entities/auth-session.entity';
import { StaffUser } from '../../../domain/entities/staff-user.entity';
import {
  CreateStaffUserInput,
  IAuthRepository,
} from '../../../domain/repositories/auth.repository.interface';

interface ProfileRow {
  role: Role;
  branch_id: string | null;
  full_name: string | null;
}

@Injectable()
export class SupabaseAuthRepository implements IAuthRepository {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Email və ya şifrə yanlışdır');
    }

    const profile = await this.fetchProfile(data.user.id);
    if (!profile) {
      throw new UnauthorizedException('İstifadəçi profili tapılmadı');
    }

    return new AuthSession(
      data.user.id,
      data.user.email,
      profile.role,
      profile.branch_id,
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_in,
    );
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Refresh token yanlış və ya vaxtı bitib');
    }

    const profile = await this.fetchProfile(data.user.id);
    if (!profile) {
      throw new UnauthorizedException('İstifadəçi profili tapılmadı');
    }

    return new AuthSession(
      data.user.id,
      data.user.email,
      profile.role,
      profile.branch_id,
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_in,
    );
  }

  async createStaffUser(input: CreateStaffUserInput): Promise<StaffUser> {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new BusinessRuleViolationException(
        error?.message ?? 'İstifadəçi yaradıla bilmədi',
      );
    }

    const { error: profileError } = await this.supabase.rpc('upsert_profile', {
      p_id: data.user.id,
      p_role: input.role,
      p_branch_id: input.branchId,
      p_full_name: input.fullName ?? null,
    });

    if (profileError) {
      await this.supabase.auth.admin.deleteUser(data.user.id);
      throw new BusinessRuleViolationException(profileError.message);
    }

    return new StaffUser(
      data.user.id,
      input.email,
      input.fullName,
      input.role,
      input.branchId,
    );
  }

  async findStaffUserById(id: string): Promise<StaffUser | null> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.admin.getUserById(id);

    if (userError || !user?.email) {
      return null;
    }

    const profile = await this.fetchProfile(id, false);
    if (!profile) {
      return null;
    }

    return new StaffUser(
      id,
      user.email,
      profile.full_name ?? undefined,
      profile.role,
      profile.branch_id,
    );
  }

  async countStaffByRole(role: Role): Promise<number> {
    const response = await this.supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', role);

    return (response as { count: number | null }).count ?? 0;
  }

  async deleteStaffUser(id: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) {
      throw new BusinessRuleViolationException(
        error.message ?? 'İstifadəçi silinə bilmədi',
      );
    }
  }

  private async fetchProfile(
    userId: string,
    throwOnMissing = true,
  ): Promise<ProfileRow | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role, branch_id, full_name')
      .eq('id', userId)
      .single();

    if (error || !data) {
      if (throwOnMissing) {
        throw new UnauthorizedException('İstifadəçi profili tapılmadı');
      }
      return null;
    }

    return data;
  }
}
