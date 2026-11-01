import { apiRequest } from './client';
import type {
  QueueEntryDTO,
  CreateQueueEntryRequest,
  UpdateQueueEntryRequest,
  AppointmentDTO,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '@mcms/contracts';

// ─── Queue Endpoints ─────────────────────────────────────────────────────────

export async function fetchQueue(token: string | null): Promise<QueueEntryDTO[]> {
  return apiRequest<QueueEntryDTO[]>('queue', { token, method: 'GET' });
}

export async function addToQueue(
  data: CreateQueueEntryRequest,
  token: string | null,
): Promise<QueueEntryDTO> {
  return apiRequest<QueueEntryDTO>('queue', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQueueEntry(
  id: string,
  data: UpdateQueueEntryRequest,
  token: string | null,
): Promise<QueueEntryDTO> {
  return apiRequest<QueueEntryDTO>(`queue/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Appointments Endpoints ─────────────────────────────────────────────────

export async function fetchAppointments(
  token: string | null,
  params?: { date?: string | undefined; doctorId?: string | undefined; patientId?: string | undefined },
): Promise<AppointmentDTO[]> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.doctorId) query.set('doctorId', params.doctorId);
  if (params?.patientId) query.set('patientId', params.patientId);

  const qs = query.toString();
  const path = qs ? `appointments?${qs}` : 'appointments';
  return apiRequest<AppointmentDTO[]>(path, { token, method: 'GET' });
}

export async function createAppointment(
  data: CreateAppointmentRequest,
  token: string | null,
): Promise<AppointmentDTO> {
  return apiRequest<AppointmentDTO>('appointments', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAppointment(
  id: string,
  data: UpdateAppointmentRequest,
  token: string | null,
): Promise<AppointmentDTO> {
  return apiRequest<AppointmentDTO>(`appointments/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
