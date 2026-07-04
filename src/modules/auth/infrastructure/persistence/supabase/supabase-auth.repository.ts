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

    const { error: profileError } = await this.supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        role: input.role,
        branch_id: input.branchId,
        full_name: input.fullName,
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

  private async fetchProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await this.supabase
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
