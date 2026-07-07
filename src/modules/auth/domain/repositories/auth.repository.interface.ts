import { Role } from '../../../../shared/guards/roles.enum';
import { AuthSession } from '../entities/auth-session.entity';
import { StaffUser } from '../entities/staff-user.entity';

export const AUTH_REPOSITORY = Symbol('IAuthRepository');

export interface CreateStaffUserInput {
  email: string;
  password: string;
  fullName?: string;
  role: Role;
  branchId: string | null;
}

/**
 * Domain-facing contract for authentication operations. Implemented by
 * infrastructure/persistence/supabase — the application layer never talks
 * to Supabase directly.
 */
export interface IAuthRepository {
  signIn(email: string, password: string): Promise<AuthSession>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
  createStaffUser(input: CreateStaffUserInput): Promise<StaffUser>;
  findStaffUserById(id: string): Promise<StaffUser | null>;
  countStaffByRole(role: Role): Promise<number>;
  deleteStaffUser(id: string): Promise<void>;
}
