// ─── Nurse Portal Mock Data ───────────────────────────────────────────────────

export interface CurrentNurse {
  id: string;
  name: string;
  role: string;
  department: string;
  ward: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  quote: string;
  unreadNotifications: number;
  unreadMessages: number;
  status: 'online' | 'busy' | 'offline';
}

export const CURRENT_NURSE: CurrentNurse = {
  id: 'nurse-001',
  name: 'Aster Mulu',
  role: 'Nurse',
  department: 'Cardiology Ward 3A',
  ward: 'Ward 3A - Bed 01-12',
  email: 'aster.mulu@email.com',
  phone: '+251 912 345 678',
  location: 'Addis Ababa, Ethiopia',
  avatar: 'https://images.unsplash.com/photo-1594824813575-d143c683b7b2?auto=format&fit=crop&q=80&w=256',
  quote: 'Caring for patients is a work of heart.',
  unreadNotifications: 3,
  unreadMessages: 3,
  status: 'online',
};

// ─── Patient Interface ────────────────────────────────────────────────────────

export interface NursePatient {
  id: string;
  pid: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  avatar: string;
  phone: string;
  email: string;
  address: string;
  room: string;
  bed: string;
  department: string;
  visitReason: string;
  status: 'In Ward' | 'Waiting' | 'Completed' | 'In Care' | 'Discharged' | 'Critical';
  vitalsStatus: 'Normal' | 'High BP' | 'Critical' | 'Low BP' | 'Elevated';
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
  };
  nextFollowUp?: string;
  doctor: string;
  admissionDate: string;
}

export const NURSE_PATIENTS: NursePatient[] = [
  {
    id: 'p-1',
    pid: 'PID-001024',
    name: 'Aster Mulu',
    age: 28,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
    phone: '+251 912 345 678',
    email: 'aster.mulu@gmail.com',
    address: 'Bole Subcity, Woreda 03, Addis Ababa',
    room: '3A-01',
    bed: 'Bed 01',
    department: 'Cardiology',
    visitReason: 'Follow-up',
    status: 'In Ward',
    vitalsStatus: 'Normal',
    vitals: { bp: '118/76', hr: 72, temp: 36.8, spo2: 98 },
    nextFollowUp: 'Oct 20, 2026 09:00 AM',
    doctor: 'Dr. Fitsum Alemu',
    admissionDate: 'Oct 17, 2026',
  },
  {
    id: 'p-2',
    pid: 'PID-001087',
    name: 'Samuel Girma',
    age: 45,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160',
    phone: '+251 911 222 333',
    email: 'samuel.girma@email.com',
    address: 'Kirkos Subcity, Addis Ababa',
    room: '2B-03',
    bed: 'Bed 04',
    department: 'Internal Medicine',
    visitReason: 'Fever & Cough',
    status: 'Waiting',
    vitalsStatus: 'High BP',
    vitals: { bp: '142/88', hr: 96, temp: 37.9, spo2: 96 },
    nextFollowUp: 'Oct 21, 2026 10:00 AM',
    doctor: 'Dr. Hana Mengesha',
    admissionDate: 'Oct 18, 2026',
  },
  {
    id: 'p-3',
    pid: 'PID-001062',
    name: 'Lidya Kebede',
    age: 32,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
    phone: '+251 913 111 444',
    email: 'lidya.kebede@email.com',
    address: 'Yeka Subcity, Addis Ababa',
    room: '4A-02',
    bed: 'Bed 02',
    department: 'Wound Care',
    visitReason: 'Wound Check',
    status: 'In Ward',
    vitalsStatus: 'Normal',
    vitals: { bp: '110/70', hr: 78, temp: 36.6, spo2: 99 },
    nextFollowUp: 'Oct 22, 2026 08:30 AM',
    doctor: 'Dr. Abebe Kebede',
    admissionDate: 'Oct 16, 2026',
  },
  {
    id: 'p-4',
    pid: 'PID-001076',
    name: 'Getachew Tadesse',
    age: 56,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
    phone: '+251 902 778 991',
    email: 'getachew.t@email.com',
    address: 'Arada Subcity, Addis Ababa',
    room: '1B-05',
    bed: 'Bed 05',
    department: 'Diabetes Clinic',
    visitReason: 'Diabetes Follow-up',
    status: 'In Care',
    vitalsStatus: 'Critical',
    vitals: { bp: '168/102', hr: 102, temp: 38.2, spo2: 94 },
    nextFollowUp: 'Oct 23, 2026 09:15 AM',
    doctor: 'Dr. Fitsum Alemu',
    admissionDate: 'Oct 15, 2026',
  },
  {
    id: 'p-5',
    pid: 'PID-001098',
    name: 'Betlehem Abebe',
    age: 22,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
    phone: '+251 913 667 221',
    email: 'betlehem.a@email.com',
    address: 'Nifas Silk, Addis Ababa',
    room: '3B-02',
    bed: 'Bed 03',
    department: 'Pediatrics',
    visitReason: 'Prenatal Checkup',
    status: 'Waiting',
    vitalsStatus: 'Low BP',
    vitals: { bp: '96/60', hr: 88, temp: 37.0, spo2: 93 },
    nextFollowUp: 'Oct 24, 2026 10:00 AM',
    doctor: 'Dr. Lealem Demissie',
    admissionDate: 'Oct 19, 2026',
  },
  {
    id: 'p-6',
    pid: 'PID-001099',
    name: 'Daniel Wondimu',
    age: 48,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=160',
    phone: '+251 911 556 778',
    email: 'daniel.w@email.com',
    address: 'Kolfe Keranio, Addis Ababa',
    room: '2A-04',
    bed: 'Bed 01',
    department: 'Orthopedics',
    visitReason: 'Post-op Check',
    status: 'Waiting',
    vitalsStatus: 'Normal',
    vitals: { bp: '124/82', hr: 76, temp: 36.9, spo2: 98 },
    doctor: 'Dr. Fitsum Alemu',
    admissionDate: 'Oct 14, 2026',
  },
  {
    id: 'p-7',
    pid: 'PID-001045',
    name: 'Tigist Alemu',
    age: 37,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=160',
    phone: '+251 912 223 445',
    email: 'tigist.a@email.com',
    address: 'Akaki Kality, Addis Ababa',
    room: '4B-01',
    bed: 'Bed 02',
    department: 'Gynaecology',
    visitReason: 'Prenatal Checkup',
    status: 'In Care',
    vitalsStatus: 'Elevated',
    vitals: { bp: '138/90', hr: 88, temp: 37.2, spo2: 95 },
    nextFollowUp: 'Oct 20, 2026 11:00 AM',
    doctor: 'Dr. Hana Mengesha',
    admissionDate: 'Oct 17, 2026',
  },
  {
    id: 'p-8',
    pid: 'PID-001087',
    name: 'Abebe Assefa',
    age: 40,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=160',
    phone: '+251 910 887 776',
    email: 'abebe.a@email.com',
    address: 'Gullele Subcity, Addis Ababa',
    room: '1A-03',
    bed: 'Bed 01',
    department: 'General Medicine',
    visitReason: 'Follow-up',
    status: 'Discharged',
    vitalsStatus: 'Normal',
    vitals: { bp: '120/78', hr: 70, temp: 36.7, spo2: 99 },
    doctor: 'Dr. Fitsum Alemu',
    admissionDate: 'Oct 12, 2026',
  },
  {
    id: 'p-9',
    pid: 'PID-001113',
    name: 'Sofiya Mohamed',
    age: 29,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=160',
    phone: '+251 911 223 667',
    email: 'sofiya.m@email.com',
    address: 'Lideta Subcity, Addis Ababa',
    room: '3A-03',
    bed: 'Bed 03',
    department: 'ENT',
    visitReason: 'Ear Infection',
    status: 'Critical',
    vitalsStatus: 'Normal',
    vitals: { bp: '102/68', hr: 82, temp: 36.5, spo2: 97 },
    nextFollowUp: 'Oct 20, 2026 02:00 PM',
    doctor: 'Dr. Abebe Kebede',
    admissionDate: 'Oct 18, 2026',
  },
  {
    id: 'p-10',
    pid: 'PID-001120',
    name: 'Yonas Gebre',
    age: 51,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=160',
    phone: '+251 902 554 331',
    email: 'yonas.g@email.com',
    address: 'Kirkos Subcity, Addis Ababa',
    room: '2B-02',
    bed: 'Bed 02',
    department: 'Surgery',
    visitReason: 'Post-op Check',
    status: 'In Care',
    vitalsStatus: 'High BP',
    vitals: { bp: '150/96', hr: 94, temp: 37.8, spo2: 93 },
    nextFollowUp: 'Oct 21, 2026 09:30 AM',
    doctor: 'Dr. Fitsum Alemu',
    admissionDate: 'Oct 16, 2026',
  },
];

// ─── Nursing Tasks Interface ──────────────────────────────────────────────────

export interface NursingTask {
  id: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  room: string;
  title: string;
  details?: string;
  type: 'Medication' | 'Vital Signs' | 'Wound Care' | 'Lab Sample' | 'Education' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  dueTime: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Scheduled' | 'Completed';
  completedAt?: string;
}

export const NURSE_TASKS: NursingTask[] = [
  {
    id: 't-1',
    patientId: 'p-1',
    patientName: 'Aster Mulu',
    patientPid: 'PID-001024',
    room: 'Room 3',
    title: 'Check vital signs',
    details: 'BP, Pulse, Temp, SpO2 check prior to rounds',
    type: 'Vital Signs',
    priority: 'High',
    dueTime: '08:00 AM',
    dueDate: 'Oct 19, 2026',
    status: 'Pending',
  },
  {
    id: 't-2',
    patientId: 'p-2',
    patientName: 'Samuel Girma',
    patientPid: 'PID-001087',
    room: 'Room 5',
    title: 'Administer medication',
    details: 'Amoxicillin 500mg IV drip',
    type: 'Medication',
    priority: 'Medium',
    dueTime: '09:30 AM',
    dueDate: 'Oct 19, 2026',
    status: 'In Progress',
  },
  {
    id: 't-3',
    patientId: 'p-3',
    patientName: 'Lidya Kebede',
    patientPid: 'PID-001062',
    room: 'Room 7',
    title: 'Wound dressing',
    details: 'Right leg surgical incision cleaning and sterile dressing change',
    type: 'Wound Care',
    priority: 'Medium',
    dueTime: '10:00 AM',
    dueDate: 'Oct 19, 2026',
    status: 'Pending',
  },
  {
    id: 't-4',
    patientId: 'p-4',
    patientName: 'Getachew Tadesse',
    patientPid: 'PID-001076',
    room: 'Room 2',
    title: 'Collect lab sample',
    details: 'Fasting blood glucose, CBC, Urine culture',
    type: 'Lab Sample',
    priority: 'Medium',
    dueTime: '11:00 AM',
    dueDate: 'Oct 19, 2026',
    status: 'Scheduled',
  },
  {
    id: 't-5',
    patientId: 'p-5',
    patientName: 'Betlehem Abebe',
    patientPid: 'PID-001098',
    room: 'Room 6',
    title: 'Administer medication',
    details: 'Insulin 10 units subcutaneously',
    type: 'Medication',
    priority: 'High',
    dueTime: '11:30 AM',
    dueDate: 'Oct 19, 2026',
    status: 'Pending',
  },
  {
    id: 't-6',
    patientId: 'p-6',
    patientName: 'Daniel Wondimu',
    patientPid: 'PID-001099',
    room: 'Room 4',
    title: 'Check vital signs',
    details: 'Post-op continuous vital surveillance',
    type: 'Vital Signs',
    priority: 'Medium',
    dueTime: '01:00 PM',
    dueDate: 'Oct 19, 2026',
    status: 'Scheduled',
  },
  {
    id: 't-7',
    patientId: 'p-7',
    patientName: 'Tigist Alemu',
    patientPid: 'PID-001045',
    room: 'Room 8',
    title: 'Patient education',
    details: 'Prenatal dietary care and gestational health guidelines',
    type: 'Education',
    priority: 'Low',
    dueTime: '02:30 PM',
    dueDate: 'Oct 19, 2026',
    status: 'Pending',
  },
  {
    id: 't-8',
    patientId: 'p-8',
    patientName: 'Abebe Assefa',
    patientPid: 'PID-001087',
    room: 'Room 1',
    title: 'Dressing change',
    details: 'Inspect discharge site and redress',
    type: 'Wound Care',
    priority: 'Medium',
    dueTime: '03:00 PM',
    dueDate: 'Oct 19, 2026',
    status: 'In Progress',
  },
  {
    id: 't-9',
    patientId: 'p-9',
    patientName: 'Sofiya Mohamed',
    patientPid: 'PID-001113',
    room: 'Room 9',
    title: 'Give oral medication',
    details: 'Amoxicillin 500mg capsule',
    type: 'Medication',
    priority: 'High',
    dueTime: '04:00 PM',
    dueDate: 'Oct 19, 2026',
    status: 'Pending',
  },
  {
    id: 't-10',
    patientId: 'p-10',
    patientName: 'Yonas Gebre',
    patientPid: 'PID-001120',
    room: 'Room 3',
    title: 'Check vital signs',
    details: 'Evening rounds routine check',
    type: 'Vital Signs',
    priority: 'Medium',
    dueTime: '05:00 PM',
    dueDate: 'Oct 19, 2026',
    status: 'Scheduled',
  },
];

// ─── Nurse Appointments Interface ─────────────────────────────────────────────

export interface NurseAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  avatar: string;
  age: number;
  gender: 'Female' | 'Male';
  department: string;
  reason: string;
  appointmentTime: string;
  date: string;
  status: 'Checked In' | 'Waiting' | 'In Progress' | 'Scheduled' | 'Cancelled' | 'Completed' | 'On Time' | 'Upcoming';
  doctor: string;
}

export const NURSE_APPOINTMENTS: NurseAppointment[] = [
  {
    id: 'apt-1',
    patientId: 'p-1',
    patientName: 'Aster Mulu',
    patientPid: 'PID-001024',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
    age: 28,
    gender: 'Female',
    department: 'Cardiology',
    reason: 'Follow-up',
    appointmentTime: '09:00 AM',
    date: 'Oct 19, 2026',
    status: 'Checked In',
    doctor: 'Dr. Fitsum Alemu',
  },
  {
    id: 'apt-2',
    patientId: 'p-2',
    patientName: 'Samuel Girma',
    patientPid: 'PID-001087',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160',
    age: 45,
    gender: 'Male',
    department: 'Internal Medicine',
    reason: 'Diabetes Follow-up',
    appointmentTime: '09:30 AM',
    date: 'Oct 19, 2026',
    status: 'Waiting',
    doctor: 'Dr. Hana Mengesha',
  },
  {
    id: 'apt-3',
    patientId: 'p-3',
    patientName: 'Lidya Kebede',
    patientPid: 'PID-001062',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
    age: 32,
    gender: 'Female',
    department: 'Wound Care',
    reason: 'Wound Check',
    appointmentTime: '10:00 AM',
    date: 'Oct 19, 2026',
    status: 'In Progress',
    doctor: 'Dr. Abebe Kebede',
  },
  {
    id: 'apt-4',
    patientId: 'p-4',
    patientName: 'Getachew Tadesse',
    patientPid: 'PID-001076',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
    age: 56,
    gender: 'Male',
    department: 'Diabetes Clinic',
    reason: 'Routine Check',
    appointmentTime: '11:00 AM',
    date: 'Oct 19, 2026',
    status: 'Scheduled',
    doctor: 'Dr. Fitsum Alemu',
  },
  {
    id: 'apt-5',
    patientId: 'p-5',
    patientName: 'Betlehem Abebe',
    patientPid: 'PID-001098',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
    age: 22,
    gender: 'Female',
    department: 'Pediatrics',
    reason: 'Vaccination',
    appointmentTime: '01:00 PM',
    date: 'Oct 19, 2026',
    status: 'Scheduled',
    doctor: 'Dr. Lealem Demissie',
  },
  {
    id: 'apt-6',
    patientId: 'p-6',
    patientName: 'Daniel Wondimu',
    patientPid: 'PID-001099',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=160',
    age: 48,
    gender: 'Male',
    department: 'Orthopedics',
    reason: 'Post-op Check',
    appointmentTime: '02:30 PM',
    date: 'Oct 19, 2026',
    status: 'Scheduled',
    doctor: 'Dr. Fitsum Alemu',
  },
  {
    id: 'apt-7',
    patientId: 'p-7',
    patientName: 'Tigist Alemu',
    patientPid: 'PID-001045',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=160',
    age: 37,
    gender: 'Female',
    department: 'Gynecology',
    reason: 'Prenatal Checkup',
    appointmentTime: '03:30 PM',
    date: 'Oct 19, 2026',
    status: 'Scheduled',
    doctor: 'Dr. Hana Mengesha',
  },
  {
    id: 'apt-8',
    patientId: 'p-8',
    patientName: 'Abebe Assefa',
    patientPid: 'PID-001087',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=160',
    age: 40,
    gender: 'Male',
    department: 'General Medicine',
    reason: 'Follow-up',
    appointmentTime: '04:30 PM',
    date: 'Oct 19, 2026',
    status: 'Cancelled',
    doctor: 'Dr. Fitsum Alemu',
  },
  {
    id: 'apt-9',
    patientId: 'p-9',
    patientName: 'Sofiya Mohamed',
    patientPid: 'PID-001113',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=160',
    age: 29,
    gender: 'Female',
    department: 'ENT',
    reason: 'Ear Check',
    appointmentTime: '05:00 PM',
    date: 'Oct 19, 2026',
    status: 'Scheduled',
    doctor: 'Dr. Abebe Kebede',
  },
  {
    id: 'apt-10',
    patientId: 'p-10',
    patientName: 'Yonas Gebre',
    patientPid: 'PID-001120',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=160',
    age: 51,
    gender: 'Male',
    department: 'Surgery',
    reason: 'Post-op Check',
    appointmentTime: '05:30 PM',
    date: 'Oct 19, 2026',
    status: 'Completed',
    doctor: 'Dr. Fitsum Alemu',
  },
];

// ─── Nursing Notes Interface ──────────────────────────────────────────────────

export interface NursingNote {
  id: string;
  patientName: string;
  patientPid: string;
  title: string;
  category: 'Education' | 'Care' | 'Medication' | 'Vitals';
  timestamp: string;
  author: string;
  text?: string;
}

export const NURSE_NOTES: NursingNote[] = [
  {
    id: 'n-1',
    patientName: 'Aster Mulu',
    patientPid: 'PID-001024',
    title: 'Patient education completed',
    category: 'Education',
    timestamp: '08:45 AM',
    author: 'Aster Mulu (Nurse)',
    text: 'Patient informed on post-op wound management and daily diet precautions.',
  },
  {
    id: 'n-2',
    patientName: 'Lidya Kebede',
    patientPid: 'PID-001062',
    title: 'Wound dressing done',
    category: 'Care',
    timestamp: '11:20 AM',
    author: 'Aster Mulu (Nurse)',
    text: 'Surgical wound cleaned with saline. Clean dressing placed. No sign of erythema.',
  },
  {
    id: 'n-3',
    patientName: 'Samuel Girma',
    patientPid: 'PID-001087',
    title: 'Medication administered',
    category: 'Medication',
    timestamp: '09:45 AM',
    author: 'Aster Mulu (Nurse)',
    text: 'Ceftriaxone 1g IV given. Patient tolerated medication well with no adverse events.',
  },
  {
    id: 'n-4',
    patientName: 'Getachew Tadesse',
    patientPid: 'PID-001076',
    title: 'Vital signs recorded',
    category: 'Vitals',
    timestamp: '02:10 PM',
    author: 'Aster Mulu (Nurse)',
    text: 'Patient complains of mild chest pain. Vitals stable. Reported to attending physician.',
  },
];

// ─── Vital Signs History & Trends Data ────────────────────────────────────────

export interface VitalsHistoryPoint {
  date: string;
  temperature: number;
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  spo2: number;
}

export const VITALS_HISTORY_DATA: VitalsHistoryPoint[] = [
  { date: 'Oct 13', temperature: 36.4, bpSystolic: 120, bpDiastolic: 78, heartRate: 72, spo2: 98 },
  { date: 'Oct 14', temperature: 36.6, bpSystolic: 122, bpDiastolic: 80, heartRate: 74, spo2: 99 },
  { date: 'Oct 15', temperature: 36.5, bpSystolic: 119, bpDiastolic: 76, heartRate: 71, spo2: 98 },
  { date: 'Oct 16', temperature: 36.8, bpSystolic: 124, bpDiastolic: 82, heartRate: 76, spo2: 97 },
  { date: 'Oct 17', temperature: 36.9, bpSystolic: 118, bpDiastolic: 74, heartRate: 70, spo2: 99 },
  { date: 'Oct 18', temperature: 37.1, bpSystolic: 121, bpDiastolic: 79, heartRate: 75, spo2: 98 },
  { date: 'Oct 19', temperature: 37.4, bpSystolic: 126, bpDiastolic: 84, heartRate: 80, spo2: 98 },
];

export interface VitalsReading {
  id: string;
  dateTime: string;
  bp: string;
  hr: number;
  temp: number;
  spo2: number;
}

export const RECENT_VITALS_READINGS: VitalsReading[] = [
  { id: 'vr-1', dateTime: 'Oct 19, 2026 10:00 AM', bp: '118/76', hr: 72, temp: 36.8, spo2: 98 },
  { id: 'vr-2', dateTime: 'Oct 19, 2026 08:00 AM', bp: '120/80', hr: 76, temp: 37.1, spo2: 97 },
  { id: 'vr-3', dateTime: 'Oct 18, 2026 10:15 AM', bp: '124/82', hr: 78, temp: 36.9, spo2: 98 },
  { id: 'vr-4', dateTime: 'Oct 18, 2026 08:00 AM', bp: '130/86', hr: 82, temp: 37.4, spo2: 96 },
  { id: 'vr-5', dateTime: 'Oct 17, 2026 10:00 AM', bp: '118/74', hr: 70, temp: 36.6, spo2: 99 },
];

export interface NurseAlert {
  id: string;
  title: string;
  patientName: string;
  details: string;
  severity: 'High' | 'Low' | 'Medium';
}

export const RECENT_NURSE_ALERTS: NurseAlert[] = [
  {
    id: 'alt-1',
    title: 'High Blood Pressure',
    patientName: 'Samuel Girma',
    details: '142/88 mmHg • Oct 19, 09:30 AM',
    severity: 'High',
  },
  {
    id: 'alt-2',
    title: 'Low Oxygen Saturation',
    patientName: 'Betlehem Abebe',
    details: '93% • Oct 19, 08:15 AM',
    severity: 'Low',
  },
  {
    id: 'alt-3',
    title: 'Elevated Temperature',
    patientName: 'Getachew Tadesse',
    details: '38.2°C • Oct 19, 07:45 AM',
    severity: 'High',
  },
];

// ─── Medications Module Data ──────────────────────────────────────────────────

export interface NurseMedicationRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  patientAvatar: string;
  age: number;
  gender: 'Female' | 'Male';
  room: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  medicationName: string;
  condition: string;
  dose: string;
  route: 'Oral' | 'Subcutaneous' | 'Intravenous' | 'Intramuscular' | 'Inhalation' | 'Topical';
  schedule: 'BID' | 'TID' | 'QID' | 'Daily' | 'Before Meals' | 'PRN' | 'Every 8 hrs';
  nextDue: string;
  status: 'Administered' | 'Pending' | 'Due Soon' | 'Missed' | 'Refill Due';
  prescribingDoctor: string;
  instructions: string;
  lastAdministered?: string;
  sideEffects?: string;
}

export const NURSE_MEDICATIONS: NurseMedicationRecord[] = [
  {
    id: 'med-1',
    patientId: 'p-1',
    patientName: 'Aster Mulu',
    patientPid: 'PID-001024',
    patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
    age: 28,
    gender: 'Female',
    room: 'Room 3A-01',
    phone: '+251 912 345 678',
    email: 'aster.mulu@email.com',
    address: 'Addis Ababa, Ethiopia',
    department: 'Cardiology',
    medicationName: 'Metformin',
    condition: 'Diabetes',
    dose: '500 mg',
    route: 'Oral',
    schedule: 'BID',
    nextDue: 'Oct 19, 2026 08:00 AM',
    status: 'Administered',
    prescribingDoctor: 'Dr. Fitsum Alemu',
    instructions: 'Take with or immediately after meals to reduce stomach upset.',
    lastAdministered: 'Oct 19, 2026 08:05 AM',
    sideEffects: 'Mild nausea, dizziness',
  },
  {
    id: 'med-2',
    patientId: 'p-2',
    patientName: 'Samuel Girma',
    patientPid: 'PID-001087',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160',
    age: 45,
    gender: 'Male',
    room: 'Room 5',
    phone: '+251 911 222 333',
    email: 'samuel.g@email.com',
    address: 'Kirkos, Addis Ababa',
    department: 'Internal Medicine',
    medicationName: 'Amoxicillin',
    condition: 'Infection',
    dose: '500 mg',
    route: 'Oral',
    schedule: 'TID',
    nextDue: 'Oct 19, 2026 09:00 AM',
    status: 'Administered',
    prescribingDoctor: 'Dr. Hana Mengesha',
    instructions: 'Complete full 7-day antibiotic course even if feeling better.',
    lastAdministered: 'Oct 19, 2026 09:02 AM',
  },
  {
    id: 'med-3',
    patientId: 'p-3',
    patientName: 'Lidya Kebede',
    patientPid: 'PID-001062',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
    age: 32,
    gender: 'Female',
    room: 'Room 7',
    phone: '+251 922 456 789',
    email: 'lidya.k@email.com',
    address: 'Bole, Addis Ababa',
    department: 'General Ward',
    medicationName: 'Paracetamol',
    condition: 'Pain & Fever',
    dose: '1 g',
    route: 'Oral',
    schedule: 'QID',
    nextDue: 'Oct 19, 2026 12:00 PM',
    status: 'Pending',
    prescribingDoctor: 'Dr. Fitsum Alemu',
    instructions: 'Administer every 6 hours as needed for temperature > 38.0°C.',
  },
  {
    id: 'med-4',
    patientId: 'p-4',
    patientName: 'Getachew Tadesse',
    patientPid: 'PID-001076',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
    age: 58,
    gender: 'Male',
    room: 'Room 2',
    phone: '+251 933 678 901',
    email: 'getachew.t@email.com',
    address: 'Yeka, Addis Ababa',
    department: 'Endocrinology',
    medicationName: 'Insulin (Novorapid)',
    condition: 'Diabetes',
    dose: '10 units',
    route: 'Subcutaneous',
    schedule: 'Before Meals',
    nextDue: 'Oct 19, 2026 12:30 PM',
    status: 'Pending',
    prescribingDoctor: 'Dr. Hana Mengesha',
    instructions: 'Rotate injection site on abdomen. Check blood glucose before dose.',
  },
  {
    id: 'med-5',
    patientId: 'p-5',
    patientName: 'Betlehem Abebe',
    patientPid: 'PID-001096',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
    age: 24,
    gender: 'Female',
    room: 'Room 1',
    phone: '+251 944 890 123',
    email: 'betlehem.a@email.com',
    address: 'Arada, Addis Ababa',
    department: 'Cardiology',
    medicationName: 'Furosemide',
    condition: 'Fluid Retention',
    dose: '40 mg',
    route: 'Oral',
    schedule: 'Daily',
    nextDue: 'Oct 19, 2026 08:00 AM',
    status: 'Administered',
    prescribingDoctor: 'Dr. Fitsum Alemu',
    instructions: 'Administer early in the morning to prevent nocturia.',
    lastAdministered: 'Oct 19, 2026 08:10 AM',
  },
  {
    id: 'med-6',
    patientId: 'p-6',
    patientName: 'Daniel Wondimu',
    patientPid: 'PID-001099',
    patientAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=160',
    age: 36,
    gender: 'Male',
    room: 'Room 4',
    phone: '+251 955 012 345',
    email: 'daniel.w@email.com',
    address: 'Akaki Kality, Addis Ababa',
    department: 'Cardiology',
    medicationName: 'Amlodipine',
    condition: 'Hypertension',
    dose: '10 mg',
    route: 'Oral',
    schedule: 'Daily',
    nextDue: 'Oct 19, 2026 09:00 AM',
    status: 'Administered',
    prescribingDoctor: 'Dr. Fitsum Alemu',
    instructions: 'Monitor blood pressure regularly. Report peripheral edema.',
    lastAdministered: 'Oct 19, 2026 09:05 AM',
  },
  {
    id: 'med-7',
    patientId: 'p-7',
    patientName: 'Tigist Alemu',
    patientPid: 'PID-001045',
    patientAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=160',
    age: 31,
    gender: 'Female',
    room: 'Room 8',
    phone: '+251 966 234 567',
    email: 'tigist.a@email.com',
    address: 'Kolfe Keranio, Addis Ababa',
    department: 'Orthopedics',
    medicationName: 'Ibuprofen',
    condition: 'Pain & Inflammation',
    dose: '400 mg',
    route: 'Oral',
    schedule: 'TID',
    nextDue: 'Oct 19, 2026 02:00 PM',
    status: 'Due Soon',
    prescribingDoctor: 'Dr. Abebe Kebede',
    instructions: 'Take with food or milk to avoid GI irritation.',
  },
  {
    id: 'med-8',
    patientId: 'p-8',
    patientName: 'Abebe Assefa',
    patientPid: 'PID-001087',
    patientAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=160',
    age: 40,
    gender: 'Male',
    room: 'Room 1',
    phone: '+251 910 887 776',
    email: 'abebe.a@email.com',
    address: 'Gullele, Addis Ababa',
    department: 'General Medicine',
    medicationName: 'Vitamin D3',
    condition: 'Supplement',
    dose: '1000 IU',
    route: 'Oral',
    schedule: 'Daily',
    nextDue: 'Oct 19, 2026 09:00 AM',
    status: 'Pending',
    prescribingDoctor: 'Dr. Hana Mengesha',
    instructions: 'Take in the morning with food containing healthy fats.',
  },
  {
    id: 'med-9',
    patientId: 'p-9',
    patientName: 'Sofiya Mohamed',
    patientPid: 'PID-001113',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=160',
    age: 29,
    gender: 'Female',
    room: 'Room 9',
    phone: '+251 911 223 667',
    email: 'sofiya.m@email.com',
    address: 'Lideta, Addis Ababa',
    department: 'ENT',
    medicationName: 'Ciprofloxacin',
    condition: 'Infection',
    dose: '500 mg',
    route: 'Oral',
    schedule: 'BID',
    nextDue: 'Oct 19, 2026 10:00 AM',
    status: 'Missed',
    prescribingDoctor: 'Dr. Abebe Kebede',
    instructions: 'Patient was away for ultrasound during scheduled dose. Reschedule ASAP.',
  },
  {
    id: 'med-10',
    patientId: 'p-10',
    patientName: 'Yonas Gebre',
    patientPid: 'PID-001120',
    patientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=160',
    age: 51,
    gender: 'Male',
    room: 'Room 3',
    phone: '+251 902 554 331',
    email: 'yonas.g@email.com',
    address: 'Kirkos, Addis Ababa',
    department: 'Surgery',
    medicationName: 'Omeprazole',
    condition: 'GERD',
    dose: '20 mg',
    route: 'Oral',
    schedule: 'Daily',
    nextDue: 'Oct 19, 2026 08:00 AM',
    status: 'Administered',
    prescribingDoctor: 'Dr. Fitsum Alemu',
    instructions: 'Take 30 minutes before breakfast.',
    lastAdministered: 'Oct 19, 2026 08:00 AM',
  },
  {
    id: 'med-11',
    patientId: 'p-1',
    patientName: 'Aster Mulu',
    patientPid: 'PID-001024',
    patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
    age: 28,
    gender: 'Female',
    room: 'Room 3A-01',
    phone: '+251 912 345 678',
    email: 'aster.mulu@email.com',
    address: 'Addis Ababa, Ethiopia',
    department: 'Cardiology',
    medicationName: 'Paracetamol',
    condition: 'Pain Relief',
    dose: '1 g',
    route: 'Oral',
    schedule: 'QID',
    nextDue: 'Oct 19, 2026 01:00 PM',
    status: 'Pending',
    prescribingDoctor: 'Dr. Fitsum Alemu',
    instructions: 'Post-op analgesic support as needed.',
  },
];

export interface MedicationAlert {
  id: string;
  type: 'missed' | 'refill' | 'pending';
  title: string;
  patientName: string;
  details: string;
  badge: string;
}

export const NURSE_MEDICATION_ALERTS: MedicationAlert[] = [
  {
    id: 'med-alt-1',
    type: 'missed',
    title: 'Missed dose – Ciprofloxacin',
    patientName: 'Sofiya Mohamed',
    details: 'PID-001113 • 10:00 AM',
    badge: 'Missed',
  },
  {
    id: 'med-alt-2',
    type: 'refill',
    title: 'Refill due – Insulin',
    patientName: 'Getachew Tadesse',
    details: 'PID-001076 • 2 days left',
    badge: 'Refill Due',
  },
  {
    id: 'med-alt-3',
    type: 'pending',
    title: 'Pending dose – Amlodipine',
    patientName: 'Daniel Wondimu',
    details: 'PID-001099 • 12:30 PM',
    badge: 'Pending',
  },
];

// ─── Lab Samples Module Data ──────────────────────────────────────────────────

export interface NurseLabSample {
  id: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  patientAvatar: string;
  room: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  testName: string;
  sampleType: 'Blood' | 'Urine' | 'Stool' | 'Swab' | 'Sputum';
  priority: 'High' | 'Normal' | 'Urgent';
  collectionTime: string;
  status: 'Pending' | 'Collected' | 'In Lab' | 'Completed';
  doctor: string;
  collectedAt?: string;
  deliveredAt?: string;
  labTech?: string;
  instructions?: string;
  results?: string;
}

export const NURSE_LAB_SAMPLES: NurseLabSample[] = [
  {
    id: 'smp-1',
    sampleId: 'SMP-2026-0018',
    patientId: 'p-1',
    patientName: 'Aster Mulu',
    patientPid: 'PID-001024',
    patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
    room: 'Room 3',
    phone: '+251 912 345 678',
    email: 'aster.mulu@email.com',
    address: 'Addis Ababa, Ethiopia',
    department: 'Cardiology',
    testName: 'Complete Blood Count (CBC)',
    sampleType: 'Blood',
    priority: 'High',
    collectionTime: '08:00 AM Oct 19, 2026',
    status: 'Pending',
    doctor: 'Dr. Fitsum Alemu',
    instructions: 'Draw 3ml lavender top EDTA tube. Invert 8 times immediately.',
    collectedAt: 'Oct 19, 2026 08:15 AM',
    deliveredAt: 'Oct 19, 2026 09:00 AM',
  },
  {
    id: 'smp-2',
    sampleId: 'SMP-2026-0019',
    patientId: 'p-2',
    patientName: 'Samuel Girma',
    patientPid: 'PID-001087',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160',
    room: 'Room 5',
    phone: '+251 911 222 333',
    email: 'samuel.g@email.com',
    address: 'Kirkos, Addis Ababa',
    department: 'Internal Medicine',
    testName: 'Blood Glucose (RBS)',
    sampleType: 'Blood',
    priority: 'Normal',
    collectionTime: '09:15 AM Oct 19, 2026',
    status: 'Collected',
    doctor: 'Dr. Hana Mengesha',
    collectedAt: 'Oct 19, 2026 09:18 AM',
    deliveredAt: 'Oct 19, 2026 09:40 AM',
    instructions: 'Grey top sodium fluoride tube for glucose estimation.',
  },
  {
    id: 'smp-3',
    sampleId: 'SMP-2026-0020',
    patientId: 'p-3',
    patientName: 'Lidya Kebede',
    patientPid: 'PID-001062',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
    room: 'Room 7',
    phone: '+251 922 456 789',
    email: 'lidya.k@email.com',
    address: 'Bole, Addis Ababa',
    department: 'Urology',
    testName: 'Urine Analysis (UA)',
    sampleType: 'Urine',
    priority: 'Normal',
    collectionTime: '10:00 AM Oct 19, 2026',
    status: 'Collected',
    doctor: 'Dr. Abebe Kebede',
    collectedAt: 'Oct 19, 2026 10:05 AM',
    instructions: 'Clean-catch midstream urine sample in sterile container.',
  },
  {
    id: 'smp-4',
    sampleId: 'SMP-2026-0021',
    patientId: 'p-4',
    patientName: 'Getachew Tadesse',
    patientPid: 'PID-001076',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
    room: 'Room 2',
    phone: '+251 933 678 901',
    email: 'getachew.t@email.com',
    address: 'Yeka, Addis Ababa',
    department: 'Gastroenterology',
    testName: 'Liver Function Test (LFT)',
    sampleType: 'Blood',
    priority: 'High',
    collectionTime: '11:00 AM Oct 19, 2026',
    status: 'In Lab',
    doctor: 'Dr. Fitsum Alemu',
    collectedAt: 'Oct 19, 2026 11:05 AM',
    deliveredAt: 'Oct 19, 2026 11:30 AM',
    labTech: 'Tech Kidus Yohannes',
  },
  {
    id: 'smp-5',
    sampleId: 'SMP-2026-0022',
    patientId: 'p-5',
    patientName: 'Betlehem Abebe',
    patientPid: 'PID-001096',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
    room: 'Room 1',
    phone: '+251 944 890 123',
    email: 'betlehem.a@email.com',
    address: 'Arada, Addis Ababa',
    department: 'Nephrology',
    testName: 'Kidney Function Test (KFT)',
    sampleType: 'Blood',
    priority: 'Normal',
    collectionTime: '11:30 AM Oct 19, 2026',
    status: 'Collected',
    doctor: 'Dr. Fitsum Alemu',
    collectedAt: 'Oct 19, 2026 11:35 AM',
  },
  {
    id: 'smp-6',
    sampleId: 'SMP-2026-0023',
    patientId: 'p-6',
    patientName: 'Daniel Wondimu',
    patientPid: 'PID-001099',
    patientAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=160',
    room: 'Room 4',
    phone: '+251 955 012 345',
    email: 'daniel.w@email.com',
    address: 'Akaki, Addis Ababa',
    department: 'Endocrinology',
    testName: 'Thyroid Profile (T3, T4, TSH)',
    sampleType: 'Blood',
    priority: 'Normal',
    collectionTime: '01:00 PM Oct 19, 2026',
    status: 'Pending',
    doctor: 'Dr. Hana Mengesha',
    instructions: 'Gold SST tube. Allow 30 min clot time before centrifugation.',
  },
  {
    id: 'smp-7',
    sampleId: 'SMP-2026-0024',
    patientId: 'p-7',
    patientName: 'Tigist Alemu',
    patientPid: 'PID-001045',
    patientAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=160',
    room: 'Room 8',
    phone: '+251 966 234 567',
    email: 'tigist.a@email.com',
    address: 'Kolfe, Addis Ababa',
    department: 'Parasitology',
    testName: 'Stool Examination',
    sampleType: 'Stool',
    priority: 'Normal',
    collectionTime: '02:30 PM Oct 19, 2026',
    status: 'Pending',
    doctor: 'Dr. Abebe Kebede',
    instructions: 'Deliver to lab within 1 hour of collection.',
  },
  {
    id: 'smp-8',
    sampleId: 'SMP-2026-0025',
    patientId: 'p-8',
    patientName: 'Abebe Assefa',
    patientPid: 'PID-001087',
    patientAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=160',
    room: 'Room 1',
    phone: '+251 910 887 776',
    email: 'abebe.a@email.com',
    address: 'Gullele, Addis Ababa',
    department: 'Infectious Disease',
    testName: 'Malaria Test',
    sampleType: 'Blood',
    priority: 'High',
    collectionTime: '02:00 PM Oct 19, 2026',
    status: 'Pending',
    doctor: 'Dr. Fitsum Alemu',
    instructions: 'Thick and thin blood smear preparation.',
  },
  {
    id: 'smp-9',
    sampleId: 'SMP-2026-0026',
    patientId: 'p-9',
    patientName: 'Sofiya Mohamed',
    patientPid: 'PID-001113',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=160',
    room: 'Room 9',
    phone: '+251 911 223 667',
    email: 'sofiya.m@email.com',
    address: 'Lideta, Addis Ababa',
    department: 'Virology',
    testName: 'HIV Screening',
    sampleType: 'Blood',
    priority: 'Normal',
    collectionTime: '04:30 PM Oct 19, 2026',
    status: 'Collected',
    doctor: 'Dr. Abebe Kebede',
    collectedAt: 'Oct 19, 2026 04:35 PM',
  },
  {
    id: 'smp-10',
    sampleId: 'SMP-2026-0027',
    patientId: 'p-10',
    patientName: 'Yonas Gebre',
    patientPid: 'PID-001120',
    patientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=160',
    room: 'Room 3',
    phone: '+251 902 554 331',
    email: 'yonas.g@email.com',
    address: 'Kirkos, Addis Ababa',
    department: 'Gastroenterology',
    testName: 'Hepatitis B Surface Antigen',
    sampleType: 'Blood',
    priority: 'High',
    collectionTime: '05:00 PM Oct 19, 2026',
    status: 'Pending',
    doctor: 'Dr. Fitsum Alemu',
    instructions: 'Red top tube without anticoagulant.',
  },
];

// ─── Messages Module Data ─────────────────────────────────────────────────────

export interface NurseConversation {
  id: string;
  name: string;
  role: 'Patient' | 'Doctor' | 'Nurse' | 'Laboratory Team' | 'Pharmacy' | 'IT Support';
  category: 'patient' | 'staff';
  avatar?: string;
  isOnline: boolean;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  pid?: string;
  age?: number;
  gender?: 'Female' | 'Male';
  phone?: string;
  email?: string;
  address?: string;
  currentRoom?: string;
  currentDoctor?: string;
  currentDept?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'nurse' | 'other';
  senderName: string;
  text: string;
  time: string;
  read?: boolean;
}

export const NURSE_CONVERSATIONS: NurseConversation[] = [
  {
    id: 'conv-1',
    name: 'Aster Mulu',
    role: 'Patient',
    category: 'patient',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160',
    isOnline: true,
    lastMessage: 'Thank you for your help. I feel much better...',
    time: '10:24 AM',
    unreadCount: 2,
    pid: 'PID-001024',
    age: 28,
    gender: 'Female',
    phone: '+251 912 345 678',
    email: 'aster.mulu@email.com',
    address: 'Addis Ababa, Ethiopia',
    currentRoom: 'Room 3A-01',
    currentDoctor: 'Dr. Fitsum Alemu',
    currentDept: 'Cardiology',
  },
  {
    id: 'conv-2',
    name: 'Dr. Fitsum Alemu',
    role: 'Doctor',
    category: 'staff',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=160',
    isOnline: true,
    lastMessage: 'Please check the lab results for Room 3...',
    time: '09:42 AM',
    unreadCount: 1,
  },
  {
    id: 'conv-3',
    name: 'Betlehem Abebe',
    role: 'Patient',
    category: 'patient',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
    isOnline: false,
    lastMessage: 'Ok, I will come at 2 PM. Thank you.',
    time: '08:55 AM',
    unreadCount: 1,
    pid: 'PID-001096',
    age: 24,
    gender: 'Female',
    phone: '+251 944 890 123',
    email: 'betlehem.a@email.com',
    address: 'Arada, Addis Ababa',
    currentRoom: 'Room 1',
    currentDoctor: 'Dr. Fitsum Alemu',
    currentDept: 'Cardiology',
  },
  {
    id: 'conv-4',
    name: 'Laboratory Team',
    role: 'Laboratory Team',
    category: 'staff',
    avatar: '',
    isOnline: true,
    lastMessage: 'Sample #SMP-2026-0018 is ready for review.',
    time: '08:32 AM',
    unreadCount: 2,
  },
  {
    id: 'conv-5',
    name: 'Daniel Wondimu',
    role: 'Doctor',
    category: 'staff',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=160',
    isOnline: true,
    lastMessage: 'The patient in Room 4 is stable now.',
    time: '07:50 AM',
  },
  {
    id: 'conv-6',
    name: 'Tsegaye Kebede',
    role: 'Nurse',
    category: 'staff',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=160',
    isOnline: false,
    lastMessage: 'We have a new admission in Room 7.',
    time: 'Yesterday',
  },
  {
    id: 'conv-7',
    name: 'Pharmacy',
    role: 'Pharmacy',
    category: 'staff',
    avatar: '',
    isOnline: true,
    lastMessage: 'Medication Metformin 500mg is available.',
    time: 'Yesterday',
    unreadCount: 2,
  },
  {
    id: 'conv-8',
    name: 'Getachew Tadesse',
    role: 'Patient',
    category: 'patient',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160',
    isOnline: false,
    lastMessage: 'Can I get a copy of my test results?',
    time: 'Yesterday',
    unreadCount: 1,
    pid: 'PID-001076',
    age: 58,
    gender: 'Male',
    phone: '+251 933 678 901',
    email: 'getachew.t@email.com',
    address: 'Yeka, Addis Ababa',
    currentRoom: 'Room 2',
    currentDoctor: 'Dr. Hana Mengesha',
    currentDept: 'Endocrinology',
  },
  {
    id: 'conv-9',
    name: 'Lidya Kebede',
    role: 'Patient',
    category: 'patient',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160',
    isOnline: true,
    lastMessage: 'Thank you very much!',
    time: 'Oct 18',
    pid: 'PID-001062',
    age: 32,
    gender: 'Female',
    phone: '+251 922 456 789',
    email: 'lidya.k@email.com',
    address: 'Bole, Addis Ababa',
    currentRoom: 'Room 7',
    currentDoctor: 'Dr. Fitsum Alemu',
    currentDept: 'General Ward',
  },
  {
    id: 'conv-10',
    name: 'IT Support',
    role: 'IT Support',
    category: 'staff',
    avatar: '',
    isOnline: true,
    lastMessage: 'System maintenance scheduled tonight.',
    time: 'Oct 18',
    unreadCount: 1,
  },
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      sender: 'other',
      senderName: 'Aster Mulu',
      text: "Hello Nurse, I wanted to ask about my medication. I'm still feeling a little dizzy after taking it this morning. Is this normal?",
      time: '09:12 AM',
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      sender: 'nurse',
      senderName: 'Aster Mulu (Nurse)',
      text: 'Hello Aster, thank you for reaching out. Dizziness can be a side effect of Metformin. Please take it after meals and drink plenty of water. If it persists or gets worse, let us know immediately.',
      time: '09:18 AM',
      read: true,
    },
    {
      id: 'm-3',
      conversationId: 'conv-1',
      sender: 'other',
      senderName: 'Aster Mulu',
      text: 'Thank you for your help. I will follow your advice. I feel a bit better now.',
      time: '10:02 AM',
    },
    {
      id: 'm-4',
      conversationId: 'conv-1',
      sender: 'nurse',
      senderName: 'Aster Mulu (Nurse)',
      text: "That's good to hear! 😊 If you need anything else, just message us. We're here to help.",
      time: '10:15 AM',
      read: true,
    },
    {
      id: 'm-5',
      conversationId: 'conv-1',
      sender: 'other',
      senderName: 'Aster Mulu',
      text: 'Thank you very much. 🙏',
      time: '10:24 AM',
    },
  ],
};

// ─── Nurse Profile & Settings Data ────────────────────────────────────────────

export interface NurseProfileInfo {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  emergencyContact: string;
  relationship: string;
  languages: string;
  role: string;
  licenseNumber: string;
  qualification: string;
  yearsOfExperience: string;
  specialization: string;
  department: string;
}

export const NURSE_PROFILE_DATA: NurseProfileInfo = {
  fullName: 'Aster Mulu',
  dateOfBirth: 'Mar 15, 1996',
  gender: 'Female',
  nationality: 'Ethiopian',
  address: 'Addis Ababa, Ethiopia',
  emergencyContact: '+251 911 111 222',
  relationship: 'Mother',
  languages: 'Amharic, English',
  role: 'Registered Nurse',
  licenseNumber: 'RN-2020-0456',
  qualification: 'Bachelor of Science in Nursing',
  yearsOfExperience: '4 Years',
  specialization: 'General Nursing',
  department: 'Nursing',
};

export interface NurseActivityLog {
  id: string;
  title: string;
  time: string;
  description: string;
  type: 'profile' | 'task' | 'message' | 'medication' | 'login';
}

export const NURSE_RECENT_ACTIVITIES: NurseActivityLog[] = [
  {
    id: 'act-1',
    title: 'Profile updated',
    time: 'Today, 10:24 AM',
    description: 'You updated your profile information.',
    type: 'profile',
  },
  {
    id: 'act-2',
    title: 'Task completed',
    time: 'Today, 09:15 AM',
    description: 'Vital signs recorded for patient #PID-001024.',
    type: 'task',
  },
  {
    id: 'act-3',
    title: 'New message',
    time: 'Today, 08:42 AM',
    description: 'From Dr. Fitsum Alemu',
    type: 'message',
  },
  {
    id: 'act-4',
    title: 'Medication administered',
    time: 'Oct 19, 2026, 02:30 PM',
    description: 'Patient #PID-001087 - Paracetamol 1g',
    type: 'medication',
  },
  {
    id: 'act-5',
    title: 'Login activity',
    time: 'Oct 19, 2026, 08:12 AM',
    description: 'You logged in to the system.',
    type: 'login',
  },
];

