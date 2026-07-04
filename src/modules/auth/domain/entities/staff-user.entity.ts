import { Role } from '../../../../shared/guards/roles.enum';

export class StaffUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string | undefined,
    public readonly role: Role,
    public readonly branchId: string | null,
  ) {}
}
