import { apiRequest } from './client';
import type {
  ClinicDashboardStatsDTO,
  DoctorDTO,
  CreateDoctorRequest,
  UpdateDoctorRequest,
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

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function fetchClinicDashboardStats(
  token: string | null,
): Promise<ClinicDashboardStatsDTO | null> {
  try {
    return await apiRequest<ClinicDashboardStatsDTO>('clinic-admin/dashboard', { token });
  } catch {
    return null;
  }
}

// ─── Branches ────────────────────────────────────────────────────────────────

export async function fetchBranches(token: string | null): Promise<BranchDTO[]> {
  try {
    return await apiRequest<BranchDTO[]>('branches', { token });
  } catch {
    return [];
  }
}

export async function createBranch(
  data: CreateBranchRequest,
  token: string | null,
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
  token: string | null,
): Promise<BranchDTO> {
  return apiRequest<BranchDTO>(`branches/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Staff & Users ───────────────────────────────────────────────────────────

export async function fetchStaffUsers(token: string | null): Promise<UserSummaryDTO[]> {
  try {
    return await apiRequest<UserSummaryDTO[]>('users', { token });
  } catch {
    return [];
  }
}

export async function createStaffUser(
  data: CreateUserRequest,
  token: string | null,
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
  token: string | null,
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
  token: string | null,
): Promise<UserSummaryDTO> {
  const payload: TransferStaffBranchRequest = { branchId };
  return apiRequest<UserSummaryDTO>(`users/${encodeURIComponent(userId)}/transfer-branch`, {
    token,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export async function fetchDoctors(token: string | null): Promise<DoctorDTO[]> {
  try {
    return await apiRequest<DoctorDTO[]>('clinic-admin/doctors', { token });
  } catch {
    return [];
  }
}

export async function createDoctor(
  data: CreateDoctorRequest,
  token: string | null,
): Promise<DoctorDTO> {
  return apiRequest<DoctorDTO>('clinic-admin/doctors', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDoctor(
  id: string,
  data: UpdateDoctorRequest,
  token: string | null,
): Promise<DoctorDTO> {
  return apiRequest<DoctorDTO>(`clinic-admin/doctors/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Departments ─────────────────────────────────────────────────────────────

export async function fetchDepartments(token: string | null): Promise<ClinicDepartmentDTO[]> {
  try {
    return await apiRequest<ClinicDepartmentDTO[]>('clinic-admin/departments', { token });
  } catch {
    return [];
  }
}

export async function createDepartment(
  data: CreateClinicDepartmentRequest,
  token: string | null,
): Promise<ClinicDepartmentDTO> {
  return apiRequest<ClinicDepartmentDTO>('clinic-admin/departments', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export async function fetchRooms(
  token: string | null,
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
  token: string | null,
): Promise<ClinicRoomDTO> {
  return apiRequest<ClinicRoomDTO>('clinic-admin/rooms', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}
