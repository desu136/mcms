import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUserEntity } from '../types/authenticated-user.type';

/**
 * Extract the authenticated user from the request.
 *
 * @example
 * async myRoute(@CurrentUser() user: AuthenticatedUserEntity) {}
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUserEntity => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUserEntity }>();
    return request.user;
  },
);
