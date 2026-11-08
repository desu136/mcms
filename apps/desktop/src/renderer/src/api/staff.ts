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

const API_BASE = (
  (typeof process !== 'undefined' && (process as any).env?.DESKTOP_API_URL) ||
  'http://localhost:3001'
).replace(/\/+$/, '') + '/api/v1';

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  token?: string | null | undefined;
  headers?: Record<string, string> | undefined;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers = {}, ...rest } = options;
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const res = await fetch(`${API_BASE}/${cleanPath}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (Array.isArray(errorBody?.message) ? errorBody.message.join(', ') : errorBody?.message) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

// ─── Branches ────────────────────────────────────────────────────────────────

export async function fetchBranches(token: string | null): Promise<BranchDTO[]> {
  try {
    const data = await apiRequest<BranchDTO[]>('branches', { token });
    return Array.isArray(data) ? data : [];
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
    const data = await apiRequest<UserSummaryDTO[]>('users', { token });
    return Array.isArray(data) ? data : [];
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

export async function activateStaffUser(id: string, token: string | null): Promise<void> {
  return apiRequest<void>(`users/${encodeURIComponent(id)}/activate`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export async function deactivateStaffUser(id: string, token: string | null): Promise<void> {
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

export async function fetchStaffRoles(token: string | null): Promise<StaffRoleItem[]> {
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

// ─── Departments & Rooms ─────────────────────────────────────────────────────

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
