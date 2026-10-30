import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { REQUIRE_TENANT_KEY } from './require-tenant.decorator';
import { REQUIRE_BRANCH_KEY } from './require-branch.decorator';
import type { AuthenticatedUserEntity } from '../../auth/types/authenticated-user.type';
import type { TenantContext } from './tenant-context.interface';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as unknown as { user?: AuthenticatedUserEntity }).user;

    if (isPublic && !user) {
      request.tenantContext = {
        tenantId: null,
        branchId: null,
        isSuperAdmin: false,
      };
      return true;
    }

    if (!user) {
      // If not public and no user, let JwtAuthGuard handle it
      return true;
    }

    const isSuperAdmin =
      user.userRoles?.some((ur) => ur.role.name === 'SUPER_ADMIN') ?? false;

    // 1. Resolve Tenant Context
    const headerTenantId = (
      (request.headers['x-tenant-id'] as string | undefined) || ''
    ).trim();

    let tenantId: string | null = null;
    if (headerTenantId) {
      if (isSuperAdmin) {
        tenantId = headerTenantId;
      } else {
        if (user.tenantId && user.tenantId !== headerTenantId) {
          throw new ForbiddenException('Cross-tenant access is not authorized');
        }
        tenantId = user.tenantId ?? null;
      }
    } else {
      tenantId = user.tenantId ?? null;
    }

    // 2. Resolve Branch Context
    const headerBranchId = (
      (request.headers['x-branch-id'] as string | undefined) || ''
    ).trim();

    let branchId: string | null = null;
    if (headerBranchId) {
      if (isSuperAdmin) {
        branchId = headerBranchId;
      } else {
        const hasAccess = user.userBranches?.some(
          (ub) => ub.branchId === headerBranchId,
        );
        if (!hasAccess) {
          throw new ForbiddenException(
            'Branch access not authorized for this user account',
          );
        }
        branchId = headerBranchId;
      }
    } else {
      const primaryBranch =
        user.userBranches?.find((ub) => ub.isPrimary) ?? user.userBranches?.[0];
      branchId = primaryBranch?.branchId ?? null;
    }

    // 3. Check requirements
    const requiresTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiresTenant && !tenantId) {
      throw new BadRequestException(
        'Tenant context is required for this operation (provide X-Tenant-Id header)',
      );
    }

    const requiresBranch = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_BRANCH_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiresBranch && !branchId) {
      throw new BadRequestException(
        'Branch context is required for this operation (provide X-Branch-Id header)',
      );
    }

    const tenantContext: TenantContext = {
      tenantId,
      branchId,
      isSuperAdmin,
    };

    request.tenantContext = tenantContext;
    return true;
  }
}
