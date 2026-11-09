import { apiRequest } from './client';
import type { PatientDTO, CreatePatientRequest, UpdatePatientRequest } from '@mcms/contracts';

export interface PatientListResponse {
  data: PatientDTO[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchPatients(
  token?: string | null,
  params?: { search?: string | undefined; page?: number | undefined; limit?: number | undefined },
): Promise<PatientListResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const path = qs ? `patients?${qs}` : 'patients';
  return apiRequest<PatientListResponse>(path, { token, method: 'GET' });
}

export async function fetchPatientById(id: string, token?: string | null): Promise<PatientDTO> {
  return apiRequest<PatientDTO>(`patients/${encodeURIComponent(id)}`, { token, method: 'GET' });
}

export async function createPatient(data: CreatePatientRequest, token?: string | null): Promise<PatientDTO> {
  return apiRequest<PatientDTO>('patients', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePatient(
  id: string,
  data: UpdatePatientRequest,
  token?: string | null,
): Promise<PatientDTO> {
  return apiRequest<PatientDTO>(`patients/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

