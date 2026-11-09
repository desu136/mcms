import { apiRequest, API_BASE } from './client';
import type { ApiRequestOptions } from './client';
export { apiRequest, API_BASE };
export type { ApiRequestOptions };

import type {
  ClinicDashboardStatsDTO,
  DoctorDTO,
  ClinicDepartmentDTO,
  CreateClinicDepartmentRequest,
  ClinicRoomDTO,
  CreateClinicRoomRequest,
  BranchDTO,
  CreateBranchRequest,
  UpdateBranchRequest,
  UserSummaryDTO,
  CreateUserRequest,
  UpdateUserRequest,
  TransferStaffBranchRequest,
} from '@mcms/contracts';

// ─── Branches ────────────────────────────────────────────────────────────────

export async function fetchBranches(token?: string | null): Promise<BranchDTO[]> {
  try {
    const data = await apiRequest<BranchDTO[]>('branches', { token });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createBranch(
  data: CreateBranchRequest,
  token?: string | null,
): Promise<BranchDTO> {
  return apiRequest<BranchDTO>('branches', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBranch(
  id: string,
  data: UpdateBranchRequest,
  token?: string | null,
): Promise<BranchDTO> {
  return apiRequest<BranchDTO>(`branches/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Staff & Users ───────────────────────────────────────────────────────────

export async function fetchStaffUsers(token?: string | null): Promise<UserSummaryDTO[]> {
  try {
    const data = await apiRequest<UserSummaryDTO[]>('users', { token });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createStaffUser(
  data: CreateUserRequest,
  token?: string | null,
): Promise<UserSummaryDTO> {
  return apiRequest<UserSummaryDTO>('users', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStaffUser(
  id: string,
  data: UpdateUserRequest,
  token?: string | null,
): Promise<UserSummaryDTO> {
  return apiRequest<UserSummaryDTO>(`users/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function transferStaffBranch(
  userId: string,
  branchId: string,
  token?: string | null,
): Promise<UserSummaryDTO> {
  const payload: TransferStaffBranchRequest = { branchId };
  return apiRequest<UserSummaryDTO>(`users/${encodeURIComponent(userId)}/transfer-branch`, {
    token,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function activateStaffUser(id: string, token?: string | null): Promise<void> {
  return apiRequest<void>(`users/${encodeURIComponent(id)}/activate`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export async function deactivateStaffUser(id: string, token?: string | null): Promise<void> {
  return apiRequest<void>(`users/${encodeURIComponent(id)}/deactivate`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export interface StaffRoleItem {
  id: string;
  name: string;
  description: string;
}

export async function fetchStaffRoles(token?: string | null): Promise<StaffRoleItem[]> {
  try {
    return await apiRequest<StaffRoleItem[]>('roles', { token });
  } catch {
    return [
      { id: 'role-doc', name: 'DOCTOR', description: 'Medical Doctor' },
      { id: 'role-nur', name: 'NURSE', description: 'Clinical Nurse' },
      { id: 'role-rec', name: 'RECEPTIONIST', description: 'Front Desk' },
      { id: 'role-lab', name: 'LAB_TECHNICIAN', description: 'Laboratory Tech' },
      { id: 'role-phr', name: 'PHARMACIST', description: 'Pharmacist' },
    ];
  }
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export async function fetchDoctors(token?: string | null): Promise<DoctorDTO[]> {
  try {
    return await apiRequest<DoctorDTO[]>('clinic-admin/doctors', { token });
  } catch {
    return [];
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function fetchClinicDashboardStats(
  token?: string | null,
): Promise<ClinicDashboardStatsDTO | null> {
  try {
    return await apiRequest<ClinicDashboardStatsDTO>('clinic-admin/dashboard', { token });
  } catch {
    return null;
  }
}

// ─── Departments & Rooms ─────────────────────────────────────────────────────

export async function fetchDepartments(token?: string | null): Promise<ClinicDepartmentDTO[]> {
  try {
    return await apiRequest<ClinicDepartmentDTO[]>('clinic-admin/departments', { token });
  } catch {
    return [];
  }
}

export async function createDepartment(
  data: CreateClinicDepartmentRequest,
  token?: string | null,
): Promise<ClinicDepartmentDTO> {
  return apiRequest<ClinicDepartmentDTO>('clinic-admin/departments', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchRooms(
  token?: string | null,
  departmentId?: string,
): Promise<ClinicRoomDTO[]> {
  try {
    const qs = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
    return await apiRequest<ClinicRoomDTO[]>(`clinic-admin/rooms${qs}`, { token });
  } catch {
    return [];
  }
}

export async function createRoom(
  data: CreateClinicRoomRequest,
  token?: string | null,
): Promise<ClinicRoomDTO> {
  return apiRequest<ClinicRoomDTO>('clinic-admin/rooms', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

