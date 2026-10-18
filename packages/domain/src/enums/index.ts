/**
 * @mcms/domain — User-facing role enum
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  PATIENT = 'PATIENT',
}

/**
 * Appointment status lifecycle
 */
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

/**
 * Gender enum — intentionally minimal for clinical use
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

/**
 * Synchronization status for offline-capable clients
 */
export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING_PUSH = 'PENDING_PUSH',
  PENDING_PULL = 'PENDING_PULL',
  CONFLICT = 'CONFLICT',
  ERROR = 'ERROR',
}

/**
 * Granular application permissions for RBAC enforcement
 */
export enum PermissionSlug {
  // Auth
  AUTH_LOGIN = 'auth:login',
  AUTH_LOGOUT = 'auth:logout',
  AUTH_REFRESH = 'auth:refresh',
  AUTH_PASSWORD_RESET = 'auth:password_reset',

  // Users & Staff
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  USERS_ACTIVATE = 'users:activate',
  USERS_DEACTIVATE = 'users:deactivate',

  // Roles & Permissions
  ROLES_READ = 'roles:read',
  ROLES_MANAGE = 'roles:manage',
  PERMISSIONS_READ = 'permissions:read',

  // Audit
  AUDIT_READ = 'audit:read',

  // Sync
  SYNC_PUSH = 'sync:push',
  SYNC_PULL = 'sync:pull',
}

/**
 * Audit event actions
 */
export enum AuditEventType {
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_TOKEN_REFRESH = 'AUTH_TOKEN_REFRESH',
  AUTH_TOKEN_REUSE_DETECTED = 'AUTH_TOKEN_REUSE_DETECTED',
  AUTH_PASSWORD_RESET_REQUESTED = 'AUTH_PASSWORD_RESET_REQUESTED',
  AUTH_PASSWORD_RESET_CONFIRMED = 'AUTH_PASSWORD_RESET_CONFIRMED',
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',

  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  USER_ROLES_ASSIGNED = 'USER_ROLES_ASSIGNED',

  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_PERMISSIONS_UPDATED = 'ROLE_PERMISSIONS_UPDATED',
}
