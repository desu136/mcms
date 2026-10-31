export interface JwtPayload {
  /** Subject — user ID */
  sub: string;
  /** Email */
  email: string;
  /** Tenant ID if user belongs to a tenant */
  tenantId?: string | null | undefined;
  /** Active Branch ID if assigned to a branch */
  activeBranchId?: string | null | undefined;
  /** Primary role */
  role?: string | undefined;
  /** JWT ID — used for access token blocklisting */
  jti: string;
  /** Token type */
  type: 'access';
  /** Issued at (Unix seconds) */
  iat?: number | undefined;
  /** Expiry (Unix seconds) */
  exp?: number | undefined;
}
