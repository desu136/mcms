export interface TenantContext {
  tenantId: string | null;
  branchId: string | null;
  isSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}
