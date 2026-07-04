import { Role } from '../../../../shared/guards/roles.enum';

/**
 * Pure domain representation of a successful authentication. No Supabase or
 * HTTP types leak into this class.
 */
export class AuthSession {
  constructor(
    public readonly userId: string,
    public readonly email: string | undefined,
    public readonly role: Role,
    public readonly branchId: string | null,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresIn: number,
  ) {}
}
