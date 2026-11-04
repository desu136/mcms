import { apiRequest } from './client';
import type {
  PrescriptionDTO,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
  LabOrderDTO,
  CreateLabOrderRequest,
  CollectSampleRequest,
  RecordLabResultRequest,
  VitalReadingDTO,
  CreateVitalReadingRequest,
  NursingTaskDTO,
  CreateNursingTaskRequest,
  UpdateNursingTaskRequest,
  AdmissionDTO,
  MedicationAdminDTO,
  CreateMedAdminRequest,
  UpdateMedAdminRequest,
} from '@mcms/contracts';

// Prescriptions
export async function fetchPrescriptions(
  token: string | null,
  params?: { patientId?: string; status?: string },
): Promise<PrescriptionDTO[]> {
  const query = new URLSearchParams();
  if (params?.patientId) query.set('patientId', params.patientId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return apiRequest<PrescriptionDTO[]>(qs ? `prescriptions?${qs}` : 'prescriptions', { token });
}

export async function createPrescription(data: CreatePrescriptionRequest, token: string | null): Promise<PrescriptionDTO> {
  return apiRequest<PrescriptionDTO>('prescriptions', { token, method: 'POST', body: JSON.stringify(data) });
}

export async function updatePrescription(id: string, data: UpdatePrescriptionRequest, token: string | null): Promise<PrescriptionDTO> {
  return apiRequest<PrescriptionDTO>(`prescriptions/${id}`, { token, method: 'PATCH', body: JSON.stringify(data) });
}

// Lab Orders
export async function fetchLabOrders(
  token: string | null,
  params?: { patientId?: string; status?: string },
): Promise<LabOrderDTO[]> {
  const query = new URLSearchParams();
  if (params?.patientId) query.set('patientId', params.patientId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return apiRequest<LabOrderDTO[]>(qs ? `lab-orders?${qs}` : 'lab-orders', { token });
}

export async function createLabOrder(data: CreateLabOrderRequest, token: string | null): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>('lab-orders', { token, method: 'POST', body: JSON.stringify(data) });
}

export async function fetchLabOrderById(id: string, token: string | null): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(`lab-orders/${encodeURIComponent(id)}`, { token, method: 'GET' });
}

export async function collectLabSample(
  labOrderId: string,
  sampleId: string,
  data: CollectSampleRequest,
  token: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(
    `lab-orders/${encodeURIComponent(labOrderId)}/samples/${encodeURIComponent(sampleId)}/collect`,
    { token, method: 'POST', body: JSON.stringify(data) },
  );
}

export async function recordLabResult(
  labOrderId: string,
  data: RecordLabResultRequest,
  token: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(`lab-orders/${encodeURIComponent(labOrderId)}/results`, {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyLabResult(
  labOrderId: string,
  resultId: string,
  token: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(
    `lab-orders/${encodeURIComponent(labOrderId)}/results/${encodeURIComponent(resultId)}/verify`,
    { token, method: 'PATCH' },
  );
}

// Vitals
export async function fetchPatientVitals(patientId: string, token: string | null, limit = 20): Promise<VitalReadingDTO[]> {
  return apiRequest<VitalReadingDTO[]>(`patients/${patientId}/vitals?limit=${limit}`, { token });
}

export async function recordVitals(data: CreateVitalReadingRequest, token: string | null): Promise<VitalReadingDTO> {
  return apiRequest<VitalReadingDTO>('vitals', { token, method: 'POST', body: JSON.stringify(data) });
}

// Nursing Tasks
export async function fetchNursingTasks(
  token: string | null,
  params?: { status?: string; assignedToId?: string; patientId?: string },
): Promise<NursingTaskDTO[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.assignedToId) query.set('assignedToId', params.assignedToId);
  if (params?.patientId) query.set('patientId', params.patientId);
  const qs = query.toString();
  return apiRequest<NursingTaskDTO[]>(qs ? `nursing-tasks?${qs}` : 'nursing-tasks', { token });
}

export async function createNursingTask(data: CreateNursingTaskRequest, token: string | null): Promise<NursingTaskDTO> {
  return apiRequest<NursingTaskDTO>('nursing-tasks', { token, method: 'POST', body: JSON.stringify(data) });
}

export async function updateNursingTask(id: string, data: UpdateNursingTaskRequest, token: string | null): Promise<NursingTaskDTO> {
  return apiRequest<NursingTaskDTO>(`nursing-tasks/${id}`, { token, method: 'PATCH', body: JSON.stringify(data) });
}

// Admissions
export async function fetchAdmissions(
  token: string | null,
  params?: { patientId?: string; status?: string },
): Promise<AdmissionDTO[]> {
  const query = new URLSearchParams();
  if (params?.patientId) query.set('patientId', params.patientId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return apiRequest<AdmissionDTO[]>(qs ? `admissions?${qs}` : 'admissions', { token });
}

// Medications / eMAR
export async function fetchMedAdmins(
  token: string | null,
  params?: { patientId?: string; admissionId?: string; status?: string },
): Promise<MedicationAdminDTO[]> {
  const query = new URLSearchParams();
  if (params?.patientId) query.set('patientId', params.patientId);
  if (params?.admissionId) query.set('admissionId', params.admissionId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return apiRequest<MedicationAdminDTO[]>(qs ? `medications?${qs}` : 'medications', { token });
}

export async function createMedAdmin(data: CreateMedAdminRequest, token: string | null): Promise<MedicationAdminDTO> {
  return apiRequest<MedicationAdminDTO>('medications', { token, method: 'POST', body: JSON.stringify(data) });
}

export async function administerMedication(id: string, data: UpdateMedAdminRequest, token: string | null): Promise<MedicationAdminDTO> {
  return apiRequest<MedicationAdminDTO>(`medications/${id}/administer`, { token, method: 'PATCH', body: JSON.stringify(data) });
}

