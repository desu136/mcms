import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Require one or more permission slugs for a route.
 * Used in conjunction with PermissionsGuard.
 *
 * @example
 * @RequirePermissions('users:create', 'users:read')
 * @Post()
 * create() {}
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
