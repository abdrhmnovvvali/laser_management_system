import { SetMetadata } from '@nestjs/common';
import { Role } from '../guards/roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Marks a controller/handler as restricted to the given roles.
 * Enforced by RolesGuard.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
