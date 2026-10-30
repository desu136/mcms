import type {
  User,
  StaffProfile,
  UserRole,
  Role,
  RolePermission,
  Permission,
  Tenant,
  UserBranch,
  Branch,
} from '@prisma/client';

// The full user object as loaded by JwtStrategy.validate()
export type AuthenticatedUserEntity = User & {
  currentJti?: string;
  tenant?: Tenant | null;
  userBranches: Array<
    UserBranch & {
      branch: Branch;
    }
  >;
  staffProfile: StaffProfile | null;
  userRoles: Array<
    UserRole & {
      role: Role & {
        rolePermissions: Array<RolePermission & { permission: Permission }>;
      };
    }
  >;
};

