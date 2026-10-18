import type { UserRole, PermissionSlug } from '@mcms/domain';

// ─── Generic API envelope ────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

// ─── Auth contracts ──────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string; // Included only in dev/test environment when email service is mocked
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

export interface StaffProfileDTO {
  employeeNumber?: string;
  jobTitle?: string;
  department?: string;
  phoneNumber?: string;
  licenseNumber?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole; // primary role backwards-compatibility
  roles: string[];
  permissions: string[];
  staffProfile?: StaffProfileDTO;
}

export interface LogoutResponse {
  message: string;
}

// ─── RBAC & User Management contracts ────────────────────────────────────────

export interface UserSummaryDTO {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  isLocked: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  roleIds: string[];
  staffProfile?: StaffProfileDTO;
}

export interface UpdateUserRequest {
  displayName?: string;
  isActive?: boolean;
  roleIds?: string[];
  staffProfile?: StaffProfileDTO;
}

export interface RoleDTO {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: string[];
}

export interface PermissionDTO {
  id: string;
  slug: PermissionSlug | string;
  name: string;
  module: string;
  description: string;
}
