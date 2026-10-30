export interface TenantDTO {
  id: string;
  name: string;
  slug: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  timezone: string;
  logoUrl?: string | null;
  subscriptionPlan: string;
  maxBranches: number;
  maxUsers: number;
  isActive: boolean;
  createdAt: string;
  branchCount?: number;
  userCount?: number;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  currency?: string;
  timezone?: string;
  logoUrl?: string;
  subscriptionPlan?: string;
  maxBranches?: number;
  maxUsers?: number;
}

export interface UpdateTenantRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  currency?: string;
  timezone?: string;
  logoUrl?: string;
  subscriptionPlan?: string;
  maxBranches?: number;
  maxUsers?: number;
  isActive?: boolean;
}

export interface BranchDTO {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isMainBranch: boolean;
  isActive: boolean;
  createdAt: string;
  departmentsCount?: number;
  roomsCount?: number;
  bedsCount?: number;
  usersCount?: number;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isMainBranch?: boolean;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  isMainBranch?: boolean;
  isActive?: boolean;
}

export interface DepartmentDTO {
  id: string;
  branchId: string;
  name: string;
  code: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  roomsCount?: number;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  type?: string;
  isActive?: boolean;
}
