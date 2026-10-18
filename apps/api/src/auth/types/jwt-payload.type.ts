export interface JwtPayload {
  /** Subject — user ID */
  sub: string;
  /** Email */
  email: string;
  /** JWT ID — used for access token blocklisting */
  jti: string;
  /** Token type */
  type: 'access';
  /** Issued at (Unix seconds) */
  iat?: number;
  /** Expiry (Unix seconds) */
  exp?: number;
}
