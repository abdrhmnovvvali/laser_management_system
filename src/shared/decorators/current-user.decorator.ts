import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../guards/authenticated-user.interface';

/**
 * Injects the authenticated user (populated by SupabaseAuthGuard) into a
 * controller method parameter, e.g. `findAll(@CurrentUser() user: AuthenticatedUser)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthenticatedUser;
  },
);
