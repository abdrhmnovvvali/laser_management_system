import { Role } from './roles.enum';

/**
 * Shape attached to `request.user` after SupabaseAuthGuard runs.
 */
export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  role: Role;
  branchId: string | null;
}
