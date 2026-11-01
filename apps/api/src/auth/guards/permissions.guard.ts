import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import type { AuthenticatedUserEntity } from '../types/authenticated-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUserEntity }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user');
    }

    // SUPER_ADMIN (Platform Administrator) has full unrestricted access across all endpoints
    const isSuperAdmin = user.userRoles?.some((ur) => ur.role?.name === 'SUPER_ADMIN') ?? false;
    if (isSuperAdmin) {
      return true;
    }

    // Collect all permission slugs from the user's roles
    const userPermissions = new Set<string>();
    for (const userRole of user.userRoles ?? []) {
      for (const rp of userRole.role?.rolePermissions ?? []) {
        userPermissions.add(rp.permission?.slug);
      }
    }

    const hasPermission = (required: string): boolean => {
      if (userPermissions.has(required)) return true;
      // Handle standard write <-> manage permission aliases
      if (required === 'tenants:write' && userPermissions.has('tenants:manage')) return true;
      if (required === 'tenants:manage' && userPermissions.has('tenants:write')) return true;
      if (required === 'branches:write' && userPermissions.has('branches:manage')) return true;
      if (required === 'branches:manage' && userPermissions.has('branches:write')) return true;
      // Handle user account status modification aliases
      if (
        (required === 'users:activate' || required === 'users:deactivate') &&
        (userPermissions.has('users:update') || userPermissions.has('users:delete'))
      ) {
        return true;
      }
      return false;
    };

    const hasAll = requiredPermissions.every(hasPermission);
    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
