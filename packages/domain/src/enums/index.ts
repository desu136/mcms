/**
 * @mcms/domain — User-facing role enum
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
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

  // Tenants & Branches
  TENANTS_READ = 'tenants:read',
  TENANTS_WRITE = 'tenants:write',
  BRANCHES_READ = 'branches:read',
  BRANCHES_WRITE = 'branches:write',

  // Clinical & Patients
  PATIENTS_READ = 'patients:read',
  PATIENTS_WRITE = 'patients:update',
  PATIENTS_CREATE = 'patients:create',
  APPOINTMENTS_READ = 'appointments:read',
  APPOINTMENTS_WRITE = 'appointments:create',
  APPOINTMENTS_MANAGE = 'appointments:manage',
  QUEUES_READ = 'queue:read',
  QUEUES_MANAGE = 'queue:manage',
  ADMISSIONS_READ = 'admissions:manage',
  ADMISSIONS_WRITE = 'admissions:manage',
  VITALS_READ = 'vitals:read',
  VITALS_RECORD = 'vitals:record',
  PRESCRIPTIONS_READ = 'prescriptions:read',
  PRESCRIPTIONS_WRITE = 'prescriptions:create',
  MEDICATIONS_ADMINISTER = 'medications:administer',
  NURSING_READ = 'tasks:manage',
  NURSING_TASKS = 'tasks:manage',
  LABS_READ = 'lab:orders:read',
  LABS_ORDER = 'lab:orders:create',
  LABS_COLLECT = 'lab:samples:collect',
  LABS_PROCESS = 'lab:results:enter',
  LABS_VERIFY = 'lab:results:verify',
  BILLING_READ = 'billing:read',
  BILLING_MANAGE = 'billing:manage',
  REPORTS_READ = 'reports:read',
  SETTINGS_READ = 'settings:read',
  SETTINGS_MANAGE = 'settings:manage',

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

  TENANT_CREATED = 'TENANT_CREATED',
  TENANT_UPDATED = 'TENANT_UPDATED',
  BRANCH_CREATED = 'BRANCH_CREATED',
  BRANCH_UPDATED = 'BRANCH_UPDATED',
  SYSTEM_CONFIG_UPDATED = 'SYSTEM_CONFIG_UPDATED',
}
