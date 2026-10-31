import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { TenantContext } from './tenant-context.interface';

export const TenantCtx = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.tenantContext;
  },
);

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.tenantContext?.tenantId ?? null;
  },
);

export const CurrentBranch = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.tenantContext?.branchId ?? null;
  },
);
