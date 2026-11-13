import { apiRequest } from './client';
import type {
  VitalReadingDTO,
  CreateVitalReadingRequest,
  PrescriptionDTO,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
  MedicationAdminDTO,
  CreateMedAdminRequest,
  UpdateMedAdminRequest,
  NursingTaskDTO,
  CreateNursingTaskRequest,
  UpdateNursingTaskRequest,
  LabOrderDTO,
  CreateLabOrderRequest,
  UpdateLabOrderRequest,
  RecordLabResultRequest,
  CollectSampleRequest,
  AdmissionDTO,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
} from '@mcms/contracts';

// ─── Vitals ────────────────────────────────────────────────────────────────

export async function fetchPatientVitals(
  patientId: string,
  token?: string | null,
  limit = 20,
): Promise<VitalReadingDTO[]> {
  return apiRequest<VitalReadingDTO[]>(
    `patients/${encodeURIComponent(patientId)}/vitals?limit=${limit}`,
    { token, method: 'GET' },
  );
}

export async function recordVitals(
  data: CreateVitalReadingRequest,
  token?: string | null,
): Promise<VitalReadingDTO> {
  return apiRequest<VitalReadingDTO>('vitals', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Prescriptions ─────────────────────────────────────────────────────────

export async function fetchPrescriptions(
  token?: string | null,
  params?: { patientId?: string; status?: string },
): Promise<PrescriptionDTO[]> {
  const q = new URLSearchParams();
  if (params?.patientId) q.set('patientId', params.patientId);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString();
  return apiRequest<PrescriptionDTO[]>(qs ? `prescriptions?${qs}` : 'prescriptions', {
    token,
    method: 'GET',
  });
}

export async function createPrescription(
  data: CreatePrescriptionRequest,
  token?: string | null,
): Promise<PrescriptionDTO> {
  return apiRequest<PrescriptionDTO>('prescriptions', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePrescription(
  id: string,
  data: UpdatePrescriptionRequest,
  token?: string | null,
): Promise<PrescriptionDTO> {
  return apiRequest<PrescriptionDTO>(`prescriptions/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Medications (eMAR) ────────────────────────────────────────────────────

export async function fetchMedications(
  token?: string | null,
  params?: { patientId?: string; status?: string },
): Promise<MedicationAdminDTO[]> {
  const q = new URLSearchParams();
  if (params?.patientId) q.set('patientId', params.patientId);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString();
  return apiRequest<MedicationAdminDTO[]>(qs ? `medications?${qs}` : 'medications', {
    token,
    method: 'GET',
  });
}

export async function createMedication(
  data: CreateMedAdminRequest,
  token?: string | null,
): Promise<MedicationAdminDTO> {
  return apiRequest<MedicationAdminDTO>('medications', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function administerMedication(
  id: string,
  data: UpdateMedAdminRequest,
  token?: string | null,
): Promise<MedicationAdminDTO> {
  return apiRequest<MedicationAdminDTO>(`medications/${encodeURIComponent(id)}/administer`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Nursing Tasks ─────────────────────────────────────────────────────────

export async function fetchNursingTasks(
  token?: string | null,
  params?: { status?: string; assignedToId?: string; patientId?: string },
): Promise<NursingTaskDTO[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.assignedToId) q.set('assignedToId', params.assignedToId);
  if (params?.patientId) q.set('patientId', params.patientId);
  const qs = q.toString();
  return apiRequest<NursingTaskDTO[]>(qs ? `nursing-tasks?${qs}` : 'nursing-tasks', {
    token,
    method: 'GET',
  });
}

export async function createNursingTask(
  data: CreateNursingTaskRequest,
  token?: string | null,
): Promise<NursingTaskDTO> {
  return apiRequest<NursingTaskDTO>('nursing-tasks', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNursingTask(
  id: string,
  data: UpdateNursingTaskRequest,
  token?: string | null,
): Promise<NursingTaskDTO> {
  return apiRequest<NursingTaskDTO>(`nursing-tasks/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Lab Orders ────────────────────────────────────────────────────────────

export async function fetchLabOrders(
  token?: string | null,
  params?: { patientId?: string; status?: string },
): Promise<LabOrderDTO[]> {
  const q = new URLSearchParams();
  if (params?.patientId) q.set('patientId', params.patientId);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString();
  return apiRequest<LabOrderDTO[]>(qs ? `lab-orders?${qs}` : 'lab-orders', {
    token,
    method: 'GET',
  });
}

export async function fetchLabOrderById(id: string, token?: string | null): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(`lab-orders/${encodeURIComponent(id)}`, {
    token,
    method: 'GET',
  });
}

export async function createLabOrder(
  data: CreateLabOrderRequest,
  token?: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>('lab-orders', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLabOrder(
  id: string,
  data: UpdateLabOrderRequest,
  token?: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(`lab-orders/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function collectSample(
  orderId: string,
  sampleId: string,
  data: CollectSampleRequest,
  token?: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(
    `lab-orders/${encodeURIComponent(orderId)}/samples/${encodeURIComponent(sampleId)}/collect`,
    { token, method: 'POST', body: JSON.stringify(data) },
  );
}

export async function recordLabResult(
  orderId: string,
  data: RecordLabResultRequest,
  token?: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(`lab-orders/${encodeURIComponent(orderId)}/results`, {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyLabResult(
  orderId: string,
  resultId: string,
  token?: string | null,
): Promise<LabOrderDTO> {
  return apiRequest<LabOrderDTO>(
    `lab-orders/${encodeURIComponent(orderId)}/results/${encodeURIComponent(resultId)}/verify`,
    { token, method: 'PATCH', body: JSON.stringify({}) },
  );
}

// ─── Admissions ────────────────────────────────────────────────────────────

export async function fetchAdmissions(
  token?: string | null,
  params?: { patientId?: string; status?: string },
): Promise<AdmissionDTO[]> {
  const q = new URLSearchParams();
  if (params?.patientId) q.set('patientId', params.patientId);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString();
  return apiRequest<AdmissionDTO[]>(qs ? `admissions?${qs}` : 'admissions', {
    token,
    method: 'GET',
  });
}

export async function createAdmission(
  data: CreateAdmissionRequest,
  token?: string | null,
): Promise<AdmissionDTO> {
  return apiRequest<AdmissionDTO>('admissions', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function dischargePatient(
  id: string,
  data: UpdateAdmissionRequest,
  token?: string | null,
): Promise<AdmissionDTO> {
  return apiRequest<AdmissionDTO>(`admissions/${encodeURIComponent(id)}/discharge`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export {
  fetchMedications as fetchMedAdmins,
  createMedication as createMedAdmin,
  collectSample as collectLabSample,
};


