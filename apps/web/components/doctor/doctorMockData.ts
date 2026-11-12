export interface PatientItem {
  id: string;
  name: string;
  pid: string;
  age: number;
  gender: 'Female' | 'Male';
  phone: string;
  email: string;
  address: string;
  department: string;
  lastVisit: string;
  lastVisitReason: string;
  nextAppointment?: string;
  status: 'Active' | 'Inactive';
  avatar: string;
  totalVisits: number;
  conditions: Array<{
    title: string;
    diagnosedDate: string;
    status: 'Active' | 'Resolved';
    type: 'cardio' | 'diabetes' | 'cholesterol' | 'allergy' | 'general';
  }>;
}

export interface AppointmentItem {
  id: string;
  time: string;
  fullDateTime?: string;
  date?: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: 'Female' | 'Male';
  reason: string;
  department: string;
  doctorName: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Scheduled' | 'Cancelled';
  avatar: string;
}
