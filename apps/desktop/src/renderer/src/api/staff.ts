import { apiRequest } from './client';
import type {
  DoctorDTO,
  ClinicDepartmentDTO,
  ClinicRoomDTO,
  BranchDTO,
  UserSummaryDTO,
} from '@mcms/contracts';

export async function fetchBranches(token?: string | null): Promise<BranchDTO[]> {
  try {
    return await apiRequest<BranchDTO[]>('branches', { token });
  } catch {
    return [];
  }
}

export async function fetchStaffUsers(token?: string | null): Promise<UserSummaryDTO[]> {
  try {
    return await apiRequest<UserSummaryDTO[]>('users', { token });
  } catch {
    return [];
  }
}

export async function fetchDoctors(token?: string | null): Promise<DoctorDTO[]> {
  try {
    return await apiRequest<DoctorDTO[]>('clinic-admin/doctors', { token });
  } catch {
    return [];
  }
}

export async function fetchDepartments(token?: string | null): Promise<ClinicDepartmentDTO[]> {
  try {
    return await apiRequest<ClinicDepartmentDTO[]>('clinic-admin/departments', { token });
  } catch {
    return [];
  }
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

