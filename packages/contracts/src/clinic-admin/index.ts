// ─── Clinic Dashboard Stats ───────────────────────────────────────────────

export interface ClinicDashboardStatsDTO {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  todayAppointmentsCount: number;
  activeQueueCount: number;
  occupiedBedsCount: number;
  availableBedsCount: number;
  recentAppointments: Array<{
    id: string;
    patientName: string;
    doctorName: string;
    departmentName: string;
    appointmentDate: string;
    startTime: string;
    status: string;
  }>;
  departmentBreakdown: Array<{
    name: string;
    doctorsCount: number;
    patientVisits: number;
    color: string;
  }>;
  weeklyTrends: Array<{
    day: string;
    thisWeek: number;
    lastWeek: number;
  }>;
}

// ─── Doctor Management ────────────────────────────────────────────────────────

export interface DoctorDTO {
  id: string;
  email: string;
  displayName: string;
  employeeNumber?: string | null;
  jobTitle?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  specialty?: string | null;
  phoneNumber?: string | null;
  licenseNumber?: string | null;
  status: string;
  workHours?: string | null;
  avatarInitials: string;
  avatarColor: string;
  createdAt: string;
}

export interface CreateDoctorRequest {
  email: string;
  password?: string;
  displayName: string;
  departmentId?: string;
  specialty?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  workHours?: string;
}

export interface UpdateDoctorRequest {
  displayName?: string;
  departmentId?: string;
  specialty?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  workHours?: string;
  status?: string;
}

// ─── Department Management ────────────────────────────────────────────────────

export interface ClinicDepartmentDTO {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  code: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  isActive: boolean;
  doctorsCount: number;
  roomsCount: number;
  createdAt: string;
}

export interface CreateClinicDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  branchId?: string;
}

export interface UpdateClinicDepartmentRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

// ─── Room & Bed Management ───────────────────────────────────────────────────

export interface ClinicRoomDTO {
  id: string;
  branchId: string;
  departmentId: string;
  departmentName: string;
  name: string;
  roomNumber: string;
  roomType: string;
  status: string;
  bedsCount: number;
  availableBedsCount: number;
}

export interface CreateClinicRoomRequest {
  name: string;
  roomNumber: string;
  departmentId: string;
  roomType?: string;
  bedsCount?: number;
}
