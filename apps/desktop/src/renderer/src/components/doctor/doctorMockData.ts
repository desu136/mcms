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

export const CURRENT_DOCTOR = {
  name: 'Dr. Fitsum Alemu',
  role: 'Cardiologist',
  department: 'Cardiology',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  isOnline: true,
  unreadNotifications: 3,
  unreadMessages: 3,
};

export const INITIAL_PATIENTS: PatientItem[] = [
  {
    id: 'p-1',
    name: 'Aster Mulu',
    pid: 'PID-001024',
    age: 28,
    gender: 'Female',
    phone: '+251 912 345 678',
    email: 'aster.mulu@email.com',
    address: 'Bole Sub-City, Addis Ababa, Ethiopia',
    department: 'Cardiology',
    lastVisit: 'Oct 18, 2026',
    lastVisitReason: 'Follow-up Visit',
    nextAppointment: 'Oct 25, 2026 - 09:00 AM • Cardiology',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    totalVisits: 5,
    conditions: [
      { title: 'Hypertension', diagnosedDate: '2023-06-12', status: 'Active', type: 'cardio' },
      { title: 'Type 2 Diabetes', diagnosedDate: '2022-11-03', status: 'Active', type: 'diabetes' },
      { title: 'High Cholesterol', diagnosedDate: '2023-08-14', status: 'Active', type: 'cholesterol' },
      { title: 'Allergy (Penicillin)', diagnosedDate: '2021-04-20', status: 'Resolved', type: 'allergy' },
    ],
  },
  {
    id: 'p-2',
    name: 'Samuel Girma',
    pid: 'PID-001087',
    age: 42,
    gender: 'Male',
    phone: '+251 911 223 456',
    email: 'samuel.girma@email.com',
    address: 'Kazanchis, Addis Ababa, Ethiopia',
    department: 'Cardiology',
    lastVisit: 'Oct 16, 2026',
    lastVisitReason: 'Consultation',
    nextAppointment: 'Nov 02, 2026 - 10:30 AM • Cardiology',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalVisits: 3,
    conditions: [
      { title: 'Coronary Artery Disease', diagnosedDate: '2024-01-15', status: 'Active', type: 'cardio' },
    ],
  },
  {
    id: 'p-3',
    name: 'Lidya Kebede',
    pid: 'PID-001062',
    age: 31,
    gender: 'Female',
    phone: '+251 918 765 432',
    email: 'lidya.kebede@email.com',
    address: 'Kirkos, Addis Ababa, Ethiopia',
    department: 'Cardiology',
    lastVisit: 'Oct 15, 2026',
    lastVisitReason: 'Follow-up Visit',
    nextAppointment: 'Oct 22, 2026 - 02:00 PM • Cardiology',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    totalVisits: 4,
    conditions: [
      { title: 'Mild Mitral Valve Prolapse', diagnosedDate: '2023-09-18', status: 'Active', type: 'cardio' },
    ],
  },
  {
    id: 'p-4',
    name: 'Getachew Tadesse',
    pid: 'PID-001076',
    age: 50,
    gender: 'Male',
    phone: '+251 904 321 987',
    email: 'getachew.t@email.com',
    address: 'Arada Sub-City, Addis Ababa, Ethiopia',
    department: 'Cardiology',
    lastVisit: 'Oct 14, 2026',
    lastVisitReason: 'Cardiology',
    nextAppointment: 'Oct 21, 2026 - 11:00 AM • Cardiology',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalVisits: 2,
    conditions: [
      { title: 'Atrial Fibrillation', diagnosedDate: '2024-03-10', status: 'Active', type: 'cardio' },
    ],
  },
  {
    id: 'p-5',
    name: 'Betlehem Abebe',
    pid: 'PID-001098',
    age: 38,
    gender: 'Female',
    phone: '+251 913 654 321',
    email: 'betlehem.a@email.com',
    address: 'Yeka, Addis Ababa, Ethiopia',
    department: 'Nursing',
    lastVisit: 'Oct 12, 2026',
    lastVisitReason: 'Nursing Checkup',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    totalVisits: 6,
    conditions: [
      { title: 'Gestational Hypertension', diagnosedDate: '2022-04-12', status: 'Resolved', type: 'cardio' },
    ],
  },
];

export const TODAY_SCHEDULE: AppointmentItem[] = [
  {
    id: 'apt-1',
    time: '08:00 AM - 08:20 AM',
    patientName: 'Aster Mulu',
    patientId: 'PID-001024',
    age: 28,
    gender: 'Female',
    reason: 'Follow-up Visit',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'Completed',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'apt-2',
    time: '08:40 AM - 09:00 AM',
    patientName: 'Abebe Assefa',
    patientId: 'PID-001087',
    age: 29,
    gender: 'Male',
    reason: 'Consultation',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'Completed',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'apt-3',
    time: '09:20 AM - 09:40 AM',
    patientName: 'Tigist Alemu',
    patientId: 'PID-001045',
    age: 35,
    gender: 'Female',
    reason: 'Consultation',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'Completed',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'apt-4',
    time: '10:00 AM - 10:30 AM',
    patientName: 'Getachew Tadesse',
    patientId: 'PID-001076',
    age: 50,
    gender: 'Male',
    reason: 'New Patient',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'In Progress',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'apt-5',
    time: '11:00 AM - 11:30 AM',
    patientName: 'Lidya Kebede',
    patientId: 'PID-001062',
    age: 31,
    gender: 'Female',
    reason: 'Follow-up Visit',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'Upcoming',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

export const UPCOMING_APPOINTMENTS_PAGE: AppointmentItem[] = [
  {
    id: 'u-1',
    time: '09:00 AM - 09:20 AM',
    date: 'Oct 20, 2026',
    patientName: 'Tigist Alemu',
    patientId: 'PID-001045',
    age: 35,
    gender: 'Female',
    reason: 'Consultation',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'Upcoming',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-2',
    time: '11:00 AM - 11:30 AM',
    date: 'Oct 21, 2026',
    patientName: 'Getachew Tadesse',
    patientId: 'PID-001076',
    age: 50,
    gender: 'Male',
    reason: 'Follow-up Visit',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'Upcoming',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-3',
    time: '02:00 PM - 02:20 PM',
    date: 'Oct 22, 2026',
    patientName: 'Lidya Kebede',
    patientId: 'PID-001062',
    age: 31,
    gender: 'Female',
    reason: 'Consultation',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'Upcoming',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];
