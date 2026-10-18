import type { User, StaffProfile, UserRole, Role, RolePermission, Permission } from '@prisma/client';

// The full user object as loaded by JwtStrategy.validate()
export type AuthenticatedUserEntity = User & {
  currentJti?: string;
  staffProfile: StaffProfile | null;
  userRoles: Array<
    UserRole & {
      role: Role & {
        rolePermissions: Array<RolePermission & { permission: Permission }>;
      };
    }
  >;
};

