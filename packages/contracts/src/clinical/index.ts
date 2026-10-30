// ─── Patient ─────────────────────────────────────────────────────────────────

export interface PatientDTO {
  id: string;
  tenantId: string;
  pid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender: string;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRel?: string | null;
  status: string;
  createdAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRel?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRel?: string;
  status?: string;
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export interface QueueEntryDTO {
  id: string;
  tenantId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  departmentId?: string | null;
  roomId?: string | null;
  assignedDoctorId?: string | null;
  ticketNumber: string;
  priority: string;
  status: string;
  checkInTime: string;
  calledTime?: string | null;
  completedTime?: string | null;
}

export interface CreateQueueEntryRequest {
  patientId: string;
  departmentId?: string;
  roomId?: string;
  assignedDoctorId?: string;
  priority?: string;
}

export interface UpdateQueueEntryRequest {
  status?: string;
  assignedDoctorId?: string;
  roomId?: string;
  departmentId?: string;
  priority?: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export interface AppointmentDTO {
  id: string;
  tenantId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  doctorId?: string | null;
  doctorName?: string | null;
  departmentId?: string | null;
  roomId?: string | null;
  appointmentDate: string;
  startTime: string;
  endTime?: string | null;
  type: string;
  status: string;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId?: string;
  departmentId?: string;
  roomId?: string;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  type?: string;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  doctorId?: string;
  departmentId?: string;
  roomId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  status?: string;
  reason?: string;
  notes?: string;
}

// ─── Admission ────────────────────────────────────────────────────────────────

export interface AdmissionDTO {
  id: string;
  tenantId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  bedId: string;
  admittingDoctorId?: string | null;
  admittingDoctorName?: string | null;
  admissionDate: string;
  dischargeDate?: string | null;
  status: string;
  admissionDiagnosis?: string | null;
  dischargeSummary?: string | null;
}

export interface CreateAdmissionRequest {
  patientId: string;
  bedId: string;
  admittingDoctorId?: string;
  admissionDiagnosis?: string;
}

export interface UpdateAdmissionRequest {
  bedId?: string;
  status?: string;
  admissionDiagnosis?: string;
  dischargeSummary?: string;
  dischargeDate?: string;
}

// ─── Vitals ───────────────────────────────────────────────────────────────────

export interface VitalReadingDTO {
  id: string;
  tenantId: string;
  patientId: string;
  admissionId?: string | null;
  recordedById?: string | null;
  recordedByName?: string | null;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperature: number;
  spo2: number;
  respiratoryRate?: number | null;
  condition: string;
  notes?: string | null;
  recordedAt: string;
}

export interface CreateVitalReadingRequest {
  patientId: string;
  admissionId?: string;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperature: number;
  spo2: number;
  respiratoryRate?: number;
  notes?: string;
}

// ─── Prescription ─────────────────────────────────────────────────────────────

export interface PrescriptionItemDTO {
  id: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export interface PrescriptionDTO {
  id: string;
  tenantId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  doctorId: string;
  doctorName?: string | null;
  diagnosis?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  items: PrescriptionItemDTO[];
}

export interface PrescriptionItemRequest {
  medicationName: string;
  dosage: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  diagnosis?: string;
  notes?: string;
  items: PrescriptionItemRequest[];
}

export interface UpdatePrescriptionRequest {
  status?: string;
  diagnosis?: string;
  notes?: string;
}

// ─── Medication Administration (eMAR) ─────────────────────────────────────────

export interface MedicationAdminDTO {
  id: string;
  patientId: string;
  patientName: string;
  admissionId?: string | null;
  medicationName: string;
  dose: string;
  route: string;
  schedule: string;
  scheduledTime?: string | null;
  status: string;
  administeredById?: string | null;
  administeredByName?: string | null;
  administeredAt?: string | null;
  instructions?: string | null;
  notes?: string | null;
}

export interface CreateMedAdminRequest {
  patientId: string;
  admissionId?: string;
  medicationName: string;
  dose: string;
  route?: string;
  schedule?: string;
  scheduledTime?: string;
  instructions?: string;
}

export interface UpdateMedAdminRequest {
  status?: string;
  notes?: string;
  administeredAt?: string;
}

// ─── Nursing Tasks ────────────────────────────────────────────────────────────

export interface NursingTaskDTO {
  id: string;
  branchId: string;
  patientId: string;
  patientName: string;
  admissionId?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  title: string;
  details?: string | null;
  taskType: string;
  priority: string;
  dueTime: string;
  status: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface CreateNursingTaskRequest {
  patientId: string;
  admissionId?: string;
  assignedToId?: string;
  title: string;
  details?: string;
  taskType?: string;
  priority?: string;
  dueTime: string;
}

export interface UpdateNursingTaskRequest {
  assignedToId?: string;
  title?: string;
  details?: string;
  taskType?: string;
  priority?: string;
  dueTime?: string;
  status?: string;
}

// ─── Lab Orders ───────────────────────────────────────────────────────────────

export interface LabSampleDTO {
  id: string;
  sampleId: string;
  sampleType: string;
  tubeType?: string | null;
  status: string;
  collectedAt?: string | null;
  receivedAt?: string | null;
}

export interface LabResultDTO {
  id: string;
  testName: string;
  testCategory?: string | null;
  value: string;
  unit?: string | null;
  referenceRange?: string | null;
  isAbnormal: boolean;
  performedAt: string;
  verifiedAt?: string | null;
  notes?: string | null;
}

export interface LabOrderDTO {
  id: string;
  tenantId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  orderingDoctorId: string;
  orderingDoctorName?: string | null;
  orderNumber: string;
  priority: string;
  status: string;
  clinicalNotes?: string | null;
  orderedAt: string;
  samples: LabSampleDTO[];
  results: LabResultDTO[];
}

export interface CreateLabOrderRequest {
  patientId: string;
  priority?: string;
  clinicalNotes?: string;
  tests: {
    testName: string;
    testCategory?: string;
    sampleType: string;
    tubeType?: string;
  }[];
}

export interface UpdateLabOrderRequest {
  status?: string;
  clinicalNotes?: string;
}

export interface RecordLabResultRequest {
  testName: string;
  testCategory?: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
  notes?: string;
}

export interface CollectSampleRequest {
  sampleId: string;
  sampleType: string;
  tubeType?: string;
}
