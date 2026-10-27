export interface ReceptionistUser {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  unreadNotifications: number;
  unreadMessages: number;
}

export const CURRENT_RECEPTIONIST: ReceptionistUser = {
  name: 'Selamawit Alemu',
  role: 'Receptionist',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  isOnline: true,
  unreadNotifications: 3,
  unreadMessages: 3,
};

// ─── DASHBOARD METRICS ────────────────────────────────────────────────────────

export interface KpiMetric {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change: string;
  trend: 'up' | 'down';
  trendLabel: string;
  iconName: 'users' | 'calendar' | 'check-circle' | 'receipt' | 'clock' | 'dollar';
  color: 'blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose';
}

export const DASHBOARD_KPIS: KpiMetric[] = [
  {
    title: "Today's Registered Patients",
    value: 48,
    change: '12%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'users',
    color: 'blue',
  },
  {
    title: "Today's Appointments",
    value: 35,
    change: '8%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'calendar',
    color: 'emerald',
  },
  {
    title: 'Checked In Patients',
    value: 28,
    change: '16%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'check-circle',
    color: 'cyan',
  },
  {
    title: "Today's Billings",
    value: '12,480',
    prefix: 'ETB ',
    change: '22%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'receipt',
    color: 'amber',
  },
  {
    title: 'Average Waiting Time',
    value: 18,
    suffix: ' min',
    change: '32%',
    trend: 'down',
    trendLabel: 'vs. yesterday',
    iconName: 'clock',
    color: 'purple',
  },
];

// ─── TODAY'S APPOINTMENTS (DASHBOARD) ─────────────────────────────────────────

export interface DashboardAppointment {
  id: string;
  time: string;
  patientName: string;
  doctor: string;
  type: string;
  status: 'Checked In' | 'Waiting' | 'Scheduled' | 'Confirmed' | 'Pending';
}

export const TODAY_DASHBOARD_APPOINTMENTS: DashboardAppointment[] = [
  {
    id: 'apt-1',
    time: '08:00 AM',
    patientName: 'Habtamu Abebe',
    doctor: 'Dr. Tadesse',
    type: 'General',
    status: 'Checked In',
  },
  {
    id: 'apt-2',
    time: '08:30 AM',
    patientName: 'Aster Mulu',
    doctor: 'Dr. Abebe',
    type: 'Follow-up',
    status: 'Waiting',
  },
  {
    id: 'apt-3',
    time: '09:00 AM',
    patientName: 'Wondimagegn Tadesse',
    doctor: 'Dr. Mekonnen',
    type: 'General',
    status: 'Waiting',
  },
  {
    id: 'apt-4',
    time: '09:30 AM',
    patientName: 'Frehiwot Getachew',
    doctor: 'Dr. Sara',
    type: 'Consultation',
    status: 'Scheduled',
  },
  {
    id: 'apt-5',
    time: '10:00 AM',
    patientName: 'Belaynesh Alemu',
    doctor: 'Dr. Tadesse',
    type: 'General',
    status: 'Scheduled',
  },
];

// ─── PATIENT FLOW (LAST 7 DAYS) ───────────────────────────────────────────────

export const PATIENT_FLOW_CHART = [
  { day: 'Oct 13', registered: 38, appointments: 28, checkedIn: 22 },
  { day: 'Oct 14', registered: 42, appointments: 32, checkedIn: 26 },
  { day: 'Oct 15', registered: 40, appointments: 30, checkedIn: 24 },
  { day: 'Oct 16', registered: 46, appointments: 34, checkedIn: 28 },
  { day: 'Oct 17', registered: 54, appointments: 40, checkedIn: 32 },
  { day: 'Oct 18', registered: 58, appointments: 44, checkedIn: 36 },
  { day: 'Oct 19', registered: 62, appointments: 48, checkedIn: 40 },
];

// ─── PATIENT TYPES ────────────────────────────────────────────────────────────

export const PATIENT_TYPES_DONUT = [
  { name: 'New Patients', value: 90, percent: 42, color: '#1E6BFF' },
  { name: 'Returning Patients', value: 81, percent: 38, color: '#10B981' },
  { name: 'Follow-up', value: 32, percent: 15, color: '#8B5CF6' },
  { name: 'Others', value: 11, percent: 5, color: '#F59E0B' },
];

// ─── RECENT PATIENT REGISTRATIONS ─────────────────────────────────────────────

export interface RecentRegistration {
  time: string;
  patientName: string;
  phone: string;
  gender: 'Female' | 'Male';
  age: number;
}

export const RECENT_REGISTRATIONS_DATA: RecentRegistration[] = [
  { time: '10:15 AM', patientName: 'Lemlem Shiferaw', phone: '+251 912 345 678', gender: 'Female', age: 28 },
  { time: '09:47 AM', patientName: 'Tesfaye Worku', phone: '+251 911 222 333', gender: 'Male', age: 35 },
  { time: '09:32 AM', patientName: 'Saron Assefa', phone: '+251 913 456 789', gender: 'Female', age: 22 },
  { time: '09:20 AM', patientName: 'Daniel Girma', phone: '+251 918 777 666', gender: 'Male', age: 41 },
  { time: '08:55 AM', patientName: 'Hiwet Molla', phone: '+251 912 888 999', gender: 'Female', age: 31 },
];

// ─── QUEUE / CHECK-IN MINI STATUS ─────────────────────────────────────────────

export interface CurrentQueueItem {
  queueNumber: string;
  patientName: string;
  type: string;
  status: 'Waiting' | 'Checked In' | 'Scheduled' | 'In Consultation';
}

export const CURRENT_QUEUE_ITEMS: CurrentQueueItem[] = [
  { queueNumber: 'A-012', patientName: 'Aster Mulu', type: 'General', status: 'Waiting' },
  { queueNumber: 'A-013', patientName: 'Wondimagegn Tadesse', type: 'Follow-up', status: 'Waiting' },
  { queueNumber: 'A-014', patientName: 'Frehiwot Getachew', type: 'General', status: 'Checked In' },
  { queueNumber: 'A-015', patientName: 'Belaynesh Alemu', type: 'Consultation', status: 'Scheduled' },
  { queueNumber: 'A-016', patientName: 'Hamdi Kedir', type: 'General', status: 'Scheduled' },
];

// ─── TODAY'S STATISTICS (MINI CARDS) ─────────────────────────────────────────

export const TODAY_STATS_MINI = [
  { label: 'Total Visits', value: 92, change: '14%', trend: 'up' },
  { label: 'New Patients', value: 34, change: '20%', trend: 'up' },
  { label: 'Follow-ups', value: 22, change: '10%', trend: 'up' },
  { label: 'No Shows', value: 3, change: '50%', trend: 'down' },
];

// ─── RECENT BILLS (DASHBOARD) ─────────────────────────────────────────────────

export interface RecentBillItem {
  time: string;
  patientName: string;
  amount: string;
  status: 'Paid' | 'Pending';
}

export const RECENT_BILLS_DATA: RecentBillItem[] = [
  { time: '10:12 AM', patientName: 'Habtamu Abebe', amount: 'ETB 1,250', status: 'Paid' },
  { time: '09:58 AM', patientName: 'Aster Mulu', amount: 'ETB 850', status: 'Pending' },
  { time: '09:33 AM', patientName: 'Wondimagegn Tadesse', amount: 'ETB 2,300', status: 'Paid' },
  { time: '09:10 AM', patientName: 'Frehiwot Getachew', amount: 'ETB 1,150', status: 'Paid' },
  { time: '08:47 AM', patientName: 'Belaynesh Alemu', amount: 'ETB 980', status: 'Pending' },
];

// ─── TODAY'S MESSAGES ─────────────────────────────────────────────────────────

export interface ReceptionistMessage {
  id: string;
  sender: string;
  time: string;
  text: string;
  role: string;
  avatarColor: string;
}

export const TODAY_MESSAGES_DATA: ReceptionistMessage[] = [
  {
    id: 'msg-1',
    sender: 'Dr. Tadesse',
    time: '09:45 AM',
    text: 'Please review the patient in room 3.',
    role: 'Doctor',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'msg-2',
    sender: 'Lab Technician',
    time: '08:32 AM',
    text: 'Sample #SMP-2026-1045 is ready for results.',
    role: 'Lab',
    avatarColor: 'bg-cyan-500',
  },
  {
    id: 'msg-3',
    sender: 'Pharmacy',
    time: '08:20 AM',
    text: 'Prescription for patient #PID-001024 is ready.',
    role: 'Pharmacy',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'msg-4',
    sender: 'Nurse',
    time: '07:56 AM',
    text: 'Room 5 is ready for the next patient.',
    role: 'Nurse',
    avatarColor: 'bg-indigo-500',
  },
];

// ─── PATIENT REGISTRATION PAGE DATA ──────────────────────────────────────────

export interface RegistrationPatientSummary {
  name: string;
  pid: string;
  time: string;
  badge: 'New' | 'Follow-up';
  avatar: string;
}

export const REGISTRATION_RECENT_PATIENTS: RegistrationPatientSummary[] = [
  {
    name: 'Aster Mulu',
    pid: 'P-2026-001245',
    time: 'Oct 19, 2026 09:42 AM',
    badge: 'New',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tesfaye Worku',
    pid: 'P-2026-001244',
    time: 'Oct 19, 2026 09:28 AM',
    badge: 'New',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lidya Kebede',
    pid: 'P-2026-001243',
    time: 'Oct 19, 2026 09:15 AM',
    badge: 'New',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Getachew Tadesse',
    pid: 'P-2026-001242',
    time: 'Oct 19, 2026 08:50 AM',
    badge: 'Follow-up',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hiwet Molla',
    pid: 'P-2026-001241',
    time: 'Oct 19, 2026 08:32 AM',
    badge: 'New',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

// ─── BILLING & PAYMENTS DATA ─────────────────────────────────────────────────

export const BILLING_KPIS: KpiMetric[] = [
  {
    title: "Today's Revenue",
    value: '12,480',
    prefix: 'ETB ',
    change: '22%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'dollar',
    color: 'blue',
  },
  {
    title: 'Invoices Created',
    value: 18,
    change: '12%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'receipt',
    color: 'emerald',
  },
  {
    title: 'Payments Received',
    value: '11,250',
    prefix: 'ETB ',
    change: '18%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'check-circle',
    color: 'cyan',
  },
  {
    title: 'Outstanding Balance',
    value: '3,420',
    prefix: 'ETB ',
    change: '5%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'clock',
    color: 'amber',
  },
  {
    title: 'Total Patients Billed',
    value: 16,
    change: '14%',
    trend: 'up',
    trendLabel: 'vs. yesterday',
    iconName: 'users',
    color: 'purple',
  },
];

export interface InvoiceLineItem {
  id: string;
  item: string;
  category: string;
  price: number;
  qty: number;
  total: number;
}

export const INITIAL_INVOICE_LINES: InvoiceLineItem[] = [
  { id: '1', item: 'Consultation Fee', category: 'Consultation', price: 250, qty: 1, total: 250 },
  { id: '2', item: 'Complete Blood Count (CBC)', category: 'Laboratory', price: 650, qty: 1, total: 650 },
  { id: '3', item: 'Urinalysis', category: 'Laboratory', price: 400, qty: 1, total: 400 },
  { id: '4', item: 'Medicine (Paracetamol)', category: 'Pharmacy', price: 120, qty: 1, total: 120 },
];

export interface RecentInvoice {
  invoiceNo: string;
  patientName: string;
  amount: string;
  status: 'Paid' | 'Pending';
  date: string;
}

export const RECENT_INVOICES_LIST: RecentInvoice[] = [
  { invoiceNo: 'INV-2026-1087', patientName: 'Aster Mulu', amount: '1,420.00', status: 'Paid', date: 'Oct 19, 09:45 AM' },
  { invoiceNo: 'INV-2026-1086', patientName: 'Lidya Kebede', amount: '850.00', status: 'Paid', date: 'Oct 19, 09:12 AM' },
  { invoiceNo: 'INV-2026-1085', patientName: 'Hawi Abebe', amount: '1,250.00', status: 'Paid', date: 'Oct 18, 04:32 PM' },
  { invoiceNo: 'INV-2026-1084', patientName: 'Tadesse Worku', amount: '980.00', status: 'Pending', date: 'Oct 18, 02:15 PM' },
  { invoiceNo: 'INV-2026-1083', patientName: 'Saron Assefa', amount: '2,100.00', status: 'Paid', date: 'Oct 18, 11:20 AM' },
  { invoiceNo: 'INV-2026-1082', patientName: 'Daniel Girma', amount: '750.00', status: 'Paid', date: 'Oct 17, 03:50 PM' },
  { invoiceNo: 'INV-2026-1081', patientName: 'Betelhem Abera', amount: '1,680.00', status: 'Paid', date: 'Oct 17, 01:10 PM' },
  { invoiceNo: 'INV-2026-1080', patientName: 'Getachew Tadesse', amount: '930.00', status: 'Paid', date: 'Oct 16, 04:22 PM' },
];

export interface PaymentHistoryItem {
  dateTime: string;
  patientName: string;
  invoiceNo: string;
  amount: string;
  method: 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer';
  status: 'Completed' | 'Pending';
}

export const PAYMENT_HISTORY_LIST: PaymentHistoryItem[] = [
  { dateTime: 'Oct 19, 09:45 AM', patientName: 'Aster Mulu', invoiceNo: 'INV-2026-1087', amount: '1,420.00', method: 'Cash', status: 'Completed' },
  { dateTime: 'Oct 19, 08:32 AM', patientName: 'Lidya Kebede', invoiceNo: 'INV-2026-1086', amount: '850.00', method: 'Card', status: 'Completed' },
  { dateTime: 'Oct 18, 04:32 PM', patientName: 'Hawi Abebe', invoiceNo: 'INV-2026-1085', amount: '1,250.00', method: 'Mobile Money', status: 'Completed' },
  { dateTime: 'Oct 18, 02:15 PM', patientName: 'Tadesse Worku', invoiceNo: 'INV-2026-1084', amount: '980.00', method: 'Cash', status: 'Pending' },
  { dateTime: 'Oct 17, 03:50 PM', patientName: 'Saron Assefa', invoiceNo: 'INV-2026-1083', amount: '2,100.00', method: 'Card', status: 'Completed' },
];

export interface OutstandingBalanceItem {
  patientName: string;
  amount: string;
  daysDue: number;
}

export const OUTSTANDING_BALANCES_LIST: OutstandingBalanceItem[] = [
  { patientName: 'Tadesse Worku', amount: '1,250.00', daysDue: 3 },
  { patientName: 'Lidya Kebede', amount: '980.00', daysDue: 5 },
  { patientName: 'Saron Assefa', amount: '750.00', daysDue: 7 },
  { patientName: 'Daniel Girma', amount: '640.00', daysDue: 8 },
  { patientName: 'Hawi Abebe', amount: '420.00', daysDue: 10 },
];

export const PAYMENT_METHODS_DONUT = [
  { name: 'Cash', percent: 52, amount: '5,850', color: '#1E6BFF' },
  { name: 'Card', percent: 28, amount: '3,150', color: '#10B981' },
  { name: 'Mobile Money', percent: 15, amount: '1,690', color: '#F59E0B' },
  { name: 'Bank Transfer', percent: 5, amount: '560', color: '#8B5CF6' },
];

// ─── CHECK-IN & QUEUE MANAGEMENT DATA ────────────────────────────────────────

export const QUEUE_KPIS = [
  { title: 'Total Waiting', value: 12, suffix: ' patients', iconName: 'users' as const, color: 'blue' as const },
  { title: 'In Consultation', value: 8, suffix: ' patients', iconName: 'check-circle' as const, color: 'emerald' as const },
  { title: 'Completed Today', value: 24, suffix: ' patients', iconName: 'check-circle' as const, color: 'purple' as const },
  { title: 'Average Waiting Time', value: 18, suffix: ' min', change: '32%', trend: 'down' as const, iconName: 'clock' as const, color: 'amber' as const },
];

export interface QueuePatient {
  queueNo: string;
  patientName: string;
  pid: string;
  avatar: string;
  age: number;
  gender: 'F' | 'M';
  visitType: string;
  department: string;
  doctor: string;
  waitingTime: string;
  status: 'In Consultation' | 'Waiting' | 'Completed';
  phone?: string;
  checkInTime?: string;
}

export const QUEUE_PATIENTS_LIST: QueuePatient[] = [
  {
    queueNo: 'Q-001',
    patientName: 'Aster Mulu',
    pid: 'P-2026-001245',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    age: 28,
    gender: 'F',
    visitType: 'Follow-up',
    department: 'General',
    doctor: 'Dr. Tadesse',
    waitingTime: '5 min',
    status: 'In Consultation',
    phone: '+251 912 345 678',
    checkInTime: '08:15 AM',
  },
  {
    queueNo: 'Q-002',
    patientName: 'Tesfaye Worku',
    pid: 'P-2026-001244',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    age: 42,
    gender: 'M',
    visitType: 'Consultation',
    department: 'Internal Medicine',
    doctor: 'Dr. Sara',
    waitingTime: '10 min',
    status: 'In Consultation',
    phone: '+251 911 222 333',
    checkInTime: '08:20 AM',
  },
  {
    queueNo: 'Q-003',
    patientName: 'Lidya Kebede',
    pid: 'P-2026-001243',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: 35,
    gender: 'F',
    visitType: 'Check-up',
    department: 'Gynecology',
    doctor: 'Dr. Mekonnen',
    waitingTime: '12 min',
    status: 'In Consultation',
    phone: '+251 913 456 789',
    checkInTime: '08:28 AM',
  },
  {
    queueNo: 'Q-004',
    patientName: 'Hawi Abebe',
    pid: 'P-2026-001242',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    age: 50,
    gender: 'M',
    visitType: 'Consultation',
    department: 'Cardiology',
    doctor: 'Dr. Lemma',
    waitingTime: '18 min',
    status: 'Waiting',
    phone: '+251 918 777 666',
    checkInTime: '08:42 AM',
  },
  {
    queueNo: 'Q-005',
    patientName: 'Saron Assefa',
    pid: 'P-2026-001241',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    age: 27,
    gender: 'F',
    visitType: 'Follow-up',
    department: 'Orthopedics',
    doctor: 'Dr. Abebe',
    waitingTime: '20 min',
    status: 'Waiting',
    phone: '+251 912 888 999',
    checkInTime: '08:48 AM',
  },
  {
    queueNo: 'Q-006',
    patientName: 'Daniel Girma',
    pid: 'P-2026-001240',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    age: 38,
    gender: 'M',
    visitType: 'Consultation',
    department: 'Surgery',
    doctor: 'Dr. Sara',
    waitingTime: '24 min',
    status: 'Waiting',
    phone: '+251 911 345 678',
    checkInTime: '09:05 AM',
  },
  {
    queueNo: 'Q-007',
    patientName: 'Getachew Tadesse',
    pid: 'P-2026-001239',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    age: 31,
    gender: 'F',
    visitType: 'Check-up',
    department: 'Pediatrics',
    doctor: 'Dr. Tadesse',
    waitingTime: '28 min',
    status: 'Waiting',
    phone: '+251 915 678 123',
    checkInTime: '09:10 AM',
  },
  {
    queueNo: 'Q-008',
    patientName: 'Betelhem Abera',
    pid: 'P-2026-001238',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    age: 45,
    gender: 'M',
    visitType: 'Consultation',
    department: 'Dermatology',
    doctor: 'Dr. Lemma',
    waitingTime: '32 min',
    status: 'Waiting',
    phone: '+251 913 222 111',
    checkInTime: '09:15 AM',
  },
];

export const QUEUE_SUMMARY_DONUT = [
  { name: 'Waiting', value: 12, percent: 27, color: '#10B981' },
  { name: 'In Consultation', value: 8, percent: 18, color: '#1E6BFF' },
  { name: 'Completed', value: 24, percent: 55, color: '#8B5CF6' },
];

export const TODAYS_CHECK_INS = [
  { time: '08:05 AM', patientName: 'Habtamu Abebe', queueNo: 'Q-001', department: 'General', status: 'Checked In' },
  { time: '08:15 AM', patientName: 'Lidya Kebede', queueNo: 'Q-003', department: 'Gynecology', status: 'Checked In' },
  { time: '08:28 AM', patientName: 'Mekonnen Tesfaye', queueNo: 'Q-006', department: 'Surgery', status: 'Checked In' },
  { time: '08:42 AM', patientName: 'Saron Assefa', queueNo: 'Q-005', department: 'Orthopedics', status: 'Checked In' },
  { time: '09:10 AM', patientName: 'Daniel Girma', queueNo: 'Q-007', department: 'Pediatrics', status: 'Checked In' },
];

export const RECENT_COMPLETED_VISITS = [
  { time: '09:05 AM', patientName: 'Fikiru Assefa', doctor: 'Dr. Sara', department: 'Internal Medicine' },
  { time: '08:52 AM', patientName: 'Abebe Biru', doctor: 'Dr. Abebe', department: 'Pediatrics' },
  { time: '08:37 AM', patientName: 'Wondimagegn Tadesse', doctor: 'Dr. Mekonnen', department: 'Gynecology' },
  { time: '08:21 AM', patientName: 'Hawi Abebe', doctor: 'Dr. Tadesse', department: 'General' },
  { time: '08:10 AM', patientName: 'Getachew Tadesse', doctor: 'Dr. Lemma', department: 'Orthopedics' },
];

// ─── APPOINTMENTS PAGE DATA ──────────────────────────────────────────────────

export interface DetailedAppointment {
  id: string;
  time: string;
  patientName: string;
  pid: string;
  avatar: string;
  doctor: string;
  department: string;
  type: string;
  status: 'Checked In' | 'Waiting' | 'Scheduled' | 'Confirmed' | 'Pending';
}

export const APPOINTMENTS_TODAY_LIST: DetailedAppointment[] = [
  {
    id: 'apt-101',
    time: '08:30 AM',
    patientName: 'Aster Mulu',
    pid: 'P-2026-001245',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Tadesse',
    department: 'General',
    type: 'General Check-up',
    status: 'Checked In',
  },
  {
    id: 'apt-102',
    time: '09:00 AM',
    patientName: 'Lidya Kebede',
    pid: 'P-2026-001243',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Mekonnen',
    department: 'Gynecology',
    type: 'Consultation',
    status: 'Waiting',
  },
  {
    id: 'apt-103',
    time: '10:30 AM',
    patientName: 'Hawi Abebe',
    pid: 'P-2026-001242',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Sara',
    department: 'Internal Medicine',
    type: 'Follow-up',
    status: 'Scheduled',
  },
  {
    id: 'apt-104',
    time: '11:30 AM',
    patientName: 'Tadesse Worku',
    pid: 'P-2026-001241',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Tadesse',
    department: 'Pediatrics',
    type: 'Consultation',
    status: 'Scheduled',
  },
  {
    id: 'apt-105',
    time: '01:00 PM',
    patientName: 'Saron Assefa',
    pid: 'P-2026-001240',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Abebe',
    department: 'General',
    type: 'Check-up',
    status: 'Confirmed',
  },
  {
    id: 'apt-106',
    time: '02:30 PM',
    patientName: 'Daniel Girma',
    pid: 'P-2026-001239',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Lemma',
    department: 'Cardiology',
    type: 'Consultation',
    status: 'Scheduled',
  },
  {
    id: 'apt-107',
    time: '03:30 PM',
    patientName: 'Getachew Tadesse',
    pid: 'P-2026-001238',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Fitsum',
    department: 'Orthopedics',
    type: 'Follow-up',
    status: 'Scheduled',
  },
  {
    id: 'apt-108',
    time: '04:30 PM',
    patientName: 'Betelhem Abera',
    pid: 'P-2026-001237',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    doctor: 'Dr. Sara',
    department: 'Dermatology',
    type: 'Consultation',
    status: 'Pending',
  },
];

export const UPCOMING_APPOINTMENTS_LIST = [
  { time: '04:00 PM', patientName: 'Betelhem Abera', doctor: 'Dr. Tadesse', type: 'General', status: 'Confirmed' },
  { time: '04:30 PM', patientName: 'Mulugeta Alemu', doctor: 'Dr. Mekonnen', type: 'Gynecology', status: 'Scheduled' },
  { time: '05:00 PM', patientName: 'Fikru Assefa', doctor: 'Dr. Sara', type: 'Internal Medicine', status: 'Scheduled' },
  { time: '05:30 PM', patientName: 'Abebe Biru', doctor: 'Dr. Abebe', type: 'Pediatrics', status: 'Scheduled' },
];

export interface DoctorAvailabilityItem {
  name: string;
  specialty: string;
  hours: string;
  status: 'Available' | 'In Consultation' | 'Off Duty';
  avatar: string;
}

export const DOCTOR_AVAILABILITY_LIST: DoctorAvailabilityItem[] = [
  {
    name: 'Dr. Tadesse',
    specialty: 'General Practitioner',
    hours: '08:00 AM - 04:00 PM',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Mekonnen',
    specialty: 'Gynecologist',
    hours: '08:00 AM - 04:00 PM',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Sara',
    specialty: 'Internal Medicine',
    hours: '09:00 AM - 05:00 PM',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Abebe',
    specialty: 'Pediatrician',
    hours: '08:00 AM - 04:00 PM',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Lemma',
    specialty: 'Cardiologist',
    hours: '10:00 AM - 06:00 PM',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const RECENT_APPOINTMENT_ACTIVITIES = [
  {
    user: 'Dr. Tadesse',
    time: '09:45 AM',
    action: 'Patient checked in - Aster Mulu (P-2026-001245)',
    iconColor: 'text-blue-500 bg-blue-50',
  },
  {
    user: 'Lidya Kebede',
    time: '09:20 AM',
    action: 'Appointment rescheduled - P-2026-001243',
    iconColor: 'text-cyan-500 bg-cyan-50',
  },
  {
    user: 'Getachew Tadesse',
    time: '08:50 AM',
    action: 'New appointment booked - P-2026-001238',
    iconColor: 'text-emerald-500 bg-emerald-50',
  },
  {
    user: 'Selamawit Alemu',
    time: '08:32 AM',
    action: 'Patient registration completed - P-2026-001237',
    iconColor: 'text-indigo-500 bg-indigo-50',
  },
];

export const CALENDAR_TIME_SLOTS = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
];

export interface CalendarEventBlock {
  timeRange: string;
  patientName: string;
  department: string;
  topOffset: string; // e.g. "top-6" or percentage
  height: string;
  colorClass: string;
}

export const CALENDAR_EVENTS_LIST: CalendarEventBlock[] = [
  {
    timeRange: '08:30 - 09:00',
    patientName: 'Aster Mulu',
    department: 'General',
    topOffset: 'top-[36px]',
    height: 'h-[46px]',
    colorClass: 'bg-blue-50 border-l-4 border-blue-500 text-blue-900',
  },
  {
    timeRange: '09:00 - 09:45',
    patientName: 'Lidya Kebede',
    department: 'Gynecology',
    topOffset: 'top-[88px]',
    height: 'h-[58px]',
    colorClass: 'bg-purple-50 border-l-4 border-purple-500 text-purple-900',
  },
  {
    timeRange: '10:30 - 11:15',
    patientName: 'Hiwet Molla',
    department: 'Internal Medicine',
    topOffset: 'top-[178px]',
    height: 'h-[58px]',
    colorClass: 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900',
  },
  {
    timeRange: '11:30 - 12:15',
    patientName: 'Tadesse Worku',
    department: 'Pediatrics',
    topOffset: 'top-[248px]',
    height: 'h-[58px]',
    colorClass: 'bg-amber-50 border-l-4 border-amber-500 text-amber-900',
  },
  {
    timeRange: '01:00 - 01:45',
    patientName: 'Saron Assefa',
    department: 'General',
    topOffset: 'top-[350px]',
    height: 'h-[58px]',
    colorClass: 'bg-cyan-50 border-l-4 border-cyan-500 text-cyan-900',
  },
  {
    timeRange: '02:30 - 03:15',
    patientName: 'Daniel Girma',
    department: 'Cardiology',
    topOffset: 'top-[440px]',
    height: 'h-[58px]',
    colorClass: 'bg-indigo-50 border-l-4 border-indigo-500 text-indigo-900',
  },
  {
    timeRange: '03:30 - 04:15',
    patientName: 'Getachew Tadesse',
    department: 'Orthopedics',
    topOffset: 'top-[520px]',
    height: 'h-[58px]',
    colorClass: 'bg-teal-50 border-l-4 border-teal-500 text-teal-900',
  },
];

// ─── PROFILE & SETTINGS DATA ──────────────────────────────────────────────────

export interface ReceptionistProfile {
  name: string;
  role: string;
  employeeId: string;
  department: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  nationality: string;
  position: string;
  hireDate: string;
  workSchedule: string;
  address: string;
  city: string;
  woreda: string;
  kebele: string;
  emergencyName: string;
  emergencyRel: string;
  emergencyPhone: string;
  about: string;
  avatar: string;
  status: 'Active' | 'Inactive';
}

export const RECEPTIONIST_PROFILE_DATA: ReceptionistProfile = {
  name: 'Selamawit Alemu',
  role: 'Receptionist',
  employeeId: 'RE-001',
  department: 'Reception',
  email: 'selamawit.alemu@clinic.et',
  phone: '+251 912 345 678',
  dob: '1998-04-12',
  gender: 'Female',
  nationality: 'Ethiopian',
  position: 'Receptionist',
  hireDate: '2024-01-15',
  workSchedule: 'Mon - Fri (8:00 AM - 5:00 PM)',
  address: 'Bole Medhanialem, Addis Ababa',
  city: 'Addis Ababa',
  woreda: 'Bole',
  kebele: '01',
  emergencyName: 'Tadesse Mulu',
  emergencyRel: 'Brother',
  emergencyPhone: '+251 911 111 222',
  about: 'I am a dedicated receptionist with a passion for providing excellent patient service and ensuring smooth clinic operations.',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  status: 'Active',
};

// ─── FULL MESSAGES CENTER DATA ────────────────────────────────────────────────

export interface ChatConversation {
  id: string;
  name: string;
  role: string;
  category: 'Doctors' | 'Nurses' | 'Lab' | 'Admin';
  lastMessage: string;
  time: string;
  unreadCount?: number;
  avatar: string;
  status: 'Online' | 'Offline';
  phone: string;
  email: string;
  isDoctor?: boolean;
}

export const MESSAGES_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    name: 'Dr. Tadesse Worku',
    role: 'Doctor • Internal Medicine',
    category: 'Doctors',
    lastMessage: 'The patient with ID P-2026-001245 needs...',
    time: '10:24 AM',
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    status: 'Online',
    phone: '+251 911 234 567',
    email: 'tadesse@clinic.et',
    isDoctor: true,
  },
  {
    id: 'conv-2',
    name: 'Lab Team',
    role: 'Laboratory',
    category: 'Lab',
    lastMessage: 'Lab results for P-2026-001238 are ready.',
    time: '09:48 AM',
    unreadCount: 1,
    avatar: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=150&auto=format&fit=crop&q=80',
    status: 'Online',
    phone: '+251 912 444 555',
    email: 'lab@clinic.et',
  },
  {
    id: 'conv-3',
    name: 'Alemu Kebede',
    role: 'Nurse • Outpatient',
    category: 'Nurses',
    lastMessage: 'Room 3 is ready for the next patient.',
    time: '09:32 AM',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Online',
    phone: '+251 911 333 222',
    email: 'alemu.k@clinic.et',
  },
  {
    id: 'conv-4',
    name: 'Dr. Mihret Abate',
    role: 'Doctor • Pediatrics',
    category: 'Doctors',
    lastMessage: 'Please check the growth chart for P-2026-0012...',
    time: '09:15 AM',
    avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=150&auto=format&fit=crop&q=80',
    status: 'Online',
    phone: '+251 913 888 777',
    email: 'mihret@clinic.et',
    isDoctor: true,
  },
  {
    id: 'conv-5',
    name: 'Finance Department',
    role: 'Admin',
    category: 'Admin',
    lastMessage: 'Monthly billing report is ready for review.',
    time: '08:47 AM',
    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    status: 'Online',
    phone: '+251 911 999 000',
    email: 'finance@clinic.et',
  },
  {
    id: 'conv-6',
    name: 'Dr. Solomon Tesfaye',
    role: 'Doctor • Cardiology',
    category: 'Doctors',
    lastMessage: 'The ECG result for P-2026-001233 is normal.',
    time: '08:21 AM',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    status: 'Online',
    phone: '+251 914 222 333',
    email: 'solomon@clinic.et',
    isDoctor: true,
  },
  {
    id: 'conv-7',
    name: 'Nurse Station',
    role: 'Nurse',
    category: 'Nurses',
    lastMessage: 'We have 2 patients waiting for Lab service.',
    time: '07:50 AM',
    avatar: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&auto=format&fit=crop&q=80',
    status: 'Online',
    phone: '+251 911 000 111',
    email: 'nursestation@clinic.et',
  },
  {
    id: 'conv-8',
    name: 'IT Support',
    role: 'Technical Support',
    category: 'Admin',
    lastMessage: 'System maintenance will be done tonight...',
    time: 'Yesterday',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'Offline',
    phone: '+251 912 000 222',
    email: 'itsupport@clinic.et',
  },
  {
    id: 'conv-9',
    name: 'Dr. Getachew Assefa',
    role: 'Doctor • Surgery',
    category: 'Doctors',
    lastMessage: 'The surgery schedule for tomorrow is updated.',
    time: 'Yesterday',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Offline',
    phone: '+251 915 111 222',
    email: 'getachew.s@clinic.et',
    isDoctor: true,
  },
  {
    id: 'conv-10',
    name: 'Administration',
    role: 'Admin',
    category: 'Admin',
    lastMessage: 'Meeting at 2 PM in the conference room.',
    time: 'Yesterday',
    avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80',
    status: 'Offline',
    phone: '+251 911 888 999',
    email: 'admin@clinic.et',
  },
];

export interface ChatMessageItem {
  id: string;
  sender: string;
  avatar?: string;
  time: string;
  text: string;
  isMe: boolean;
}

export const ACTIVE_CHAT_MESSAGES: ChatMessageItem[] = [
  {
    id: 'c-1',
    sender: 'Dr. Tadesse Worku',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    time: '10:24 AM',
    text: 'The patient with ID P-2026-001245 needs an urgent follow-up. His lab results show high blood sugar levels.',
    isMe: false,
  },
  {
    id: 'c-2',
    sender: 'Selamawit Alemu',
    time: '10:26 AM',
    text: 'Thank you, Dr. Tadesse. I will inform the patient and schedule a follow-up appointment. Do you need any specific tests or instructions?',
    isMe: true,
  },
  {
    id: 'c-3',
    sender: 'Dr. Tadesse Worku',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    time: '10:28 AM',
    text: 'Yes, please repeat the HbA1c test and advise the patient to fast for 8 hours before the test.',
    isMe: false,
  },
  {
    id: 'c-4',
    sender: 'Selamawit Alemu',
    time: '10:30 AM',
    text: 'Noted. I will arrange the test and provide the instructions to the patient.',
    isMe: true,
  },
];

export interface SharedFileItem {
  name: string;
  size: string;
  date: string;
  type: 'pdf' | 'txt' | 'doc';
}

export const SHARED_FILES_LIST: SharedFileItem[] = [
  { name: 'Lab_Results_P-2026-001245.pdf', size: 'PDF, 2.4 MB', date: 'Oct 19, 2026 10:20 AM', type: 'pdf' },
  { name: 'ECG_Report.pdf', size: 'PDF, 1.8 MB', date: 'Oct 18, 2026 04:35 PM', type: 'pdf' },
  { name: 'Patient_Notes.txt', size: '0.5 MB', date: 'Oct 18, 2026 11:12 AM', type: 'txt' },
];

// ─── REPORTS PAGE DATA ────────────────────────────────────────────────────────

export const REPORTS_KPIS: KpiMetric[] = [
  { title: 'Total Patients', value: '1,248', change: '12%', trend: 'up', trendLabel: 'vs. previous period', iconName: 'users', color: 'blue' },
  { title: 'Total Appointments', value: '324', change: '8%', trend: 'up', trendLabel: 'vs. previous period', iconName: 'calendar', color: 'emerald' },
  { title: 'Total Check-ins', value: '298', change: '10%', trend: 'up', trendLabel: 'vs. previous period', iconName: 'check-circle', color: 'purple' },
  { title: 'Total Revenue', value: '124,580', prefix: 'ETB ', change: '22%', trend: 'up', trendLabel: 'vs. previous period', iconName: 'dollar', color: 'amber' },
  { title: 'Invoices Created', value: '186', change: '15%', trend: 'up', trendLabel: 'vs. previous period', iconName: 'receipt', color: 'rose' },
];

export const PATIENT_REG_SUMMARY_TABLE = [
  { date: 'Oct 13, 2026', newPatients: 18, totalPatients: '1,210', male: 9, female: 9 },
  { date: 'Oct 14, 2026', newPatients: 22, totalPatients: '1,232', male: 11, female: 11 },
  { date: 'Oct 15, 2026', newPatients: 20, totalPatients: '1,252', male: 10, female: 10 },
  { date: 'Oct 16, 2026', newPatients: 25, totalPatients: '1,277', male: 13, female: 12 },
  { date: 'Oct 17, 2026', newPatients: 28, totalPatients: '1,305', male: 15, female: 13 },
  { date: 'Oct 18, 2026', newPatients: 19, totalPatients: '1,324', male: 8, female: 11 },
  { date: 'Oct 19, 2026', newPatients: 24, totalPatients: '1,348', male: 12, female: 12 },
];

export const APPOINTMENT_SUMMARY_TABLE = [
  { type: 'Consultation', total: 184, completed: 168, cancelled: 10, noShow: 6 },
  { type: 'Follow-up', total: 72, completed: 66, cancelled: 4, noShow: 2 },
  { type: 'Check-up', total: 38, completed: 34, cancelled: 3, noShow: 1 },
  { type: 'Procedure', total: 20, completed: 18, cancelled: 2, noShow: 0 },
  { type: 'Other', total: 10, completed: 9, cancelled: 1, noShow: 0 },
];

export const VISIT_TYPES_REPORT_DONUT = [
  { name: 'Consultation', value: 184, percent: 57, color: '#1E6BFF' },
  { name: 'Follow-up', value: 72, percent: 22, color: '#10B981' },
  { name: 'Check-up', value: 38, percent: 12, color: '#F59E0B' },
  { name: 'Procedure', value: 20, percent: 6, color: '#EC4899' },
  { name: 'Other', value: 10, percent: 3, color: '#8B5CF6' },
];

export const PAYMENT_METHODS_REPORT_DONUT = [
  { name: 'Cash', value: '64,781', percent: 52, color: '#1E6BFF' },
  { name: 'Mobile Money', value: '34,882', percent: 28, color: '#F59E0B' },
  { name: 'Card', value: '18,687', percent: 15, color: '#10B981' },
  { name: 'Bank Transfer', value: '6,230', percent: 5, color: '#8B5CF6' },
];

export const RECENT_REGISTRATIONS_REPORT = [
  { time: 'Oct 19, 09:15 AM', name: 'Aster Mulu', age: 28, gender: 'Female', phone: '+251 912 345 678', doctor: 'Dr. Tadesse' },
  { time: 'Oct 19, 10:30 AM', name: 'Lidya Kebede', age: 42, gender: 'Female', phone: '+251 911 234 567', doctor: 'Dr. Sara' },
  { time: 'Oct 19, 11:20 AM', name: 'Hawi Abebe', age: 35, gender: 'Female', phone: '+251 922 876 543', doctor: 'Dr. Mekonnen' },
  { time: 'Oct 19, 01:15 PM', name: 'Daniel Girma', age: 38, gender: 'Male', phone: '+251 920 111 222', doctor: 'Dr. Lemma' },
  { time: 'Oct 19, 02:40 PM', name: 'Saron Assefa', age: 27, gender: 'Female', phone: '+251 914 321 098', doctor: 'Dr. Abebe' },
];

export const RECENT_PAYMENTS_REPORT = [
  { time: 'Oct 19, 09:45 AM', invoice: 'INV-2026-1087', name: 'Aster Mulu', amount: '1,420.00', method: 'Cash', status: 'Paid' },
  { time: 'Oct 19, 11:05 AM', invoice: 'INV-2026-1086', name: 'Lidya Kebede', amount: '850.00', method: 'Card', status: 'Paid' },
  { time: 'Oct 19, 12:30 PM', invoice: 'INV-2026-1085', name: 'Hawi Abebe', amount: '1,250.00', method: 'Mobile', status: 'Paid' },
  { time: 'Oct 19, 02:10 PM', invoice: 'INV-2026-1084', name: 'Daniel Girma', amount: '750.00', method: 'Cash', status: 'Pending' },
  { time: 'Oct 19, 03:15 PM', invoice: 'INV-2026-1083', name: 'Saron Assefa', amount: '2,100.00', method: 'Card', status: 'Paid' },
];

// ─── PATIENTS DIRECTORY FULL DATA ─────────────────────────────────────────────

export const PATIENTS_DIRECTORY_KPIS: KpiMetric[] = [
  { title: 'Total Patients', value: '1,248', change: '12%', trend: 'up', trendLabel: 'vs. last month', iconName: 'users', color: 'blue' },
  { title: 'New Patients (This Month)', value: '142', change: '18%', trend: 'up', trendLabel: 'vs. last month', iconName: 'calendar', color: 'emerald' },
  { title: 'Active Patients', value: '1,186', change: '10%', trend: 'up', trendLabel: 'vs. last month', iconName: 'check-circle', color: 'cyan' },
  { title: 'Inactive Patients', value: '62', change: '8%', trend: 'down', trendLabel: 'vs. last month', iconName: 'clock', color: 'rose' },
];

export interface PatientDirectoryRow {
  pid: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  phone: string;
  lastVisit: string;
  status: 'Active' | 'Inactive';
  avatar: string;
  dob?: string;
  nationalId?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  address?: string;
  city?: string;
  woreda?: string;
  kebele?: string;
  emergencyName?: string;
  emergencyRel?: string;
  emergencyPhone?: string;
  visitType?: string;
  department?: string;
  doctor?: string;
  checkInTime?: string;
}

export const FULL_PATIENTS_DIRECTORY: PatientDirectoryRow[] = [
  {
    pid: 'P-2026-001245',
    name: 'Aster Mulu',
    age: 28,
    gender: 'Female',
    phone: '+251 912 345 678',
    lastVisit: 'Oct 19, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    dob: 'Oct 19, 1998',
    nationalId: '1-2345-6789-0',
    bloodGroup: 'O+',
    maritalStatus: 'Single',
    address: 'Bole Medhanialem, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Bole',
    kebele: '01',
    emergencyName: 'Tadesse Mulu',
    emergencyRel: 'Brother',
    emergencyPhone: '+251 911 111 222',
    visitType: 'Follow-up',
    department: 'Internal Medicine',
    doctor: 'Dr. Tadesse',
    checkInTime: 'Oct 19, 2026 08:45 AM',
  },
  {
    pid: 'P-2026-001244',
    name: 'Lidya Kebede',
    age: 42,
    gender: 'Female',
    phone: '+251 911 234 567',
    lastVisit: 'Oct 12, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dob: 'May 14, 1984',
    nationalId: '1-4567-8910-1',
    bloodGroup: 'A+',
    maritalStatus: 'Married',
    address: 'Kirkos Sub-City, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Kirkos',
    kebele: '04',
    emergencyName: 'Kebede Alemu',
    emergencyRel: 'Spouse',
    emergencyPhone: '+251 912 222 333',
    visitType: 'Consultation',
    department: 'Gynecology',
    doctor: 'Dr. Mekonnen',
    checkInTime: 'Oct 12, 2026 09:15 AM',
  },
  {
    pid: 'P-2026-001243',
    name: 'Hawi Abebe',
    age: 35,
    gender: 'Female',
    phone: '+251 922 876 543',
    lastVisit: 'Oct 10, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    dob: 'Aug 22, 1991',
    nationalId: '1-9876-5432-0',
    bloodGroup: 'B+',
    maritalStatus: 'Single',
    address: 'Yeka Sub-City, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Yeka',
    kebele: '07',
    emergencyName: 'Abebe Chala',
    emergencyRel: 'Father',
    emergencyPhone: '+251 911 888 777',
    visitType: 'Check-up',
    department: 'Cardiology',
    doctor: 'Dr. Lemma',
    checkInTime: 'Oct 10, 2026 10:00 AM',
  },
  {
    pid: 'P-2026-001242',
    name: 'Tadesse Worku',
    age: 50,
    gender: 'Male',
    phone: '+251 913 567 890',
    lastVisit: 'Oct 08, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dob: 'Jan 15, 1976',
    nationalId: '1-3333-4444-5',
    bloodGroup: 'AB+',
    maritalStatus: 'Married',
    address: 'Arada Sub-City, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Arada',
    kebele: '02',
    emergencyName: 'Worku Tadesse',
    emergencyRel: 'Son',
    emergencyPhone: '+251 914 555 666',
    visitType: 'Consultation',
    department: 'Pediatrics',
    doctor: 'Dr. Tadesse',
    checkInTime: 'Oct 08, 2026 11:30 AM',
  },
  {
    pid: 'P-2026-001241',
    name: 'Saron Assefa',
    age: 27,
    gender: 'Female',
    phone: '+251 914 321 098',
    lastVisit: 'Oct 05, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    dob: 'Nov 03, 1999',
    nationalId: '1-7777-8888-9',
    bloodGroup: 'O-',
    maritalStatus: 'Single',
    address: 'Nifas Silk, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Nifas Silk',
    kebele: '09',
    emergencyName: 'Assefa Girma',
    emergencyRel: 'Father',
    emergencyPhone: '+251 911 444 333',
    visitType: 'Check-up',
    department: 'General',
    doctor: 'Dr. Abebe',
    checkInTime: 'Oct 05, 2026 01:00 PM',
  },
  {
    pid: 'P-2026-001240',
    name: 'Daniel Girma',
    age: 38,
    gender: 'Male',
    phone: '+251 920 111 222',
    lastVisit: 'Sep 28, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    dob: 'Jun 19, 1988',
    nationalId: '1-5555-6666-7',
    bloodGroup: 'A-',
    maritalStatus: 'Married',
    address: 'Bole Sub-City, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Bole',
    kebele: '03',
    emergencyName: 'Tigist Lemma',
    emergencyRel: 'Spouse',
    emergencyPhone: '+251 913 222 111',
    visitType: 'Consultation',
    department: 'Surgery',
    doctor: 'Dr. Sara',
    checkInTime: 'Sep 28, 2026 02:30 PM',
  },
  {
    pid: 'P-2026-001239',
    name: 'Getachew Tadesse',
    age: 31,
    gender: 'Male',
    phone: '+251 911 666 777',
    lastVisit: 'Sep 25, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    dob: 'Apr 02, 1995',
    nationalId: '1-8888-9999-0',
    bloodGroup: 'B-',
    maritalStatus: 'Single',
    address: 'Gulele Sub-City, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Gulele',
    kebele: '05',
    emergencyName: 'Tadesse Bekele',
    emergencyRel: 'Father',
    emergencyPhone: '+251 912 777 666',
    visitType: 'Follow-up',
    department: 'Orthopedics',
    doctor: 'Dr. Fitsum',
    checkInTime: 'Sep 25, 2026 03:30 PM',
  },
  {
    pid: 'P-2026-001238',
    name: 'Betelhem Abera',
    age: 45,
    gender: 'Female',
    phone: '+251 922 333 444',
    lastVisit: 'Sep 25, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    dob: 'Jul 29, 1981',
    nationalId: '1-1111-2222-3',
    bloodGroup: 'O+',
    maritalStatus: 'Married',
    address: 'Akaki Kality, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Akaki',
    kebele: '08',
    emergencyName: 'Abera Molla',
    emergencyRel: 'Spouse',
    emergencyPhone: '+251 911 333 444',
    visitType: 'Consultation',
    department: 'Dermatology',
    doctor: 'Dr. Sara',
    checkInTime: 'Sep 25, 2026 04:30 PM',
  },
  {
    pid: 'P-2026-001237',
    name: 'Mulugeta Alemu',
    age: 29,
    gender: 'Male',
    phone: '+251 911 789 012',
    lastVisit: 'Sep 18, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    dob: 'Sep 12, 1997',
    nationalId: '1-4444-5555-6',
    bloodGroup: 'A+',
    maritalStatus: 'Single',
    address: 'Kolfe Keranio, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Kolfe',
    kebele: '06',
    emergencyName: 'Alemu Worku',
    emergencyRel: 'Father',
    emergencyPhone: '+251 912 666 555',
    visitType: 'General',
    department: 'General',
    doctor: 'Dr. Tadesse',
    checkInTime: 'Sep 18, 2026 09:00 AM',
  },
  {
    pid: 'P-2026-001236',
    name: 'Fikiru Assefa',
    age: 33,
    gender: 'Female',
    phone: '+251 923 456 789',
    lastVisit: 'Sep 15, 2026',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    dob: 'Dec 05, 1993',
    nationalId: '1-6666-7777-8',
    bloodGroup: 'B+',
    maritalStatus: 'Married',
    address: 'Lideta Sub-City, Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Lideta',
    kebele: '02',
    emergencyName: 'Assefa Bekele',
    emergencyRel: 'Spouse',
    emergencyPhone: '+251 911 777 888',
    visitType: 'Follow-up',
    department: 'Internal Medicine',
    doctor: 'Dr. Sara',
    checkInTime: 'Sep 15, 2026 10:30 AM',
  },
];

export const PATIENT_NOTES_LIST = [
  { date: 'Oct 19, 2026', name: 'Aster Mulu', note: 'Follow-up visit complete. Next appointment in 2 weeks.' },
  { date: 'Oct 18, 2026', name: 'Daniel Girma', note: 'Prescribed medication. Advised to check BP daily.' },
  { date: 'Oct 16, 2026', name: 'Betelhem Abera', note: 'Lab results normal. Continue current treatment.' },
  { date: 'Oct 14, 2026', name: 'Getachew Tadesse', note: 'Referred to Cardiology for further evaluation.' },
  { date: 'Oct 12, 2026', name: 'Mulugeta Alemu', note: 'Patient needs dental check-up. Follow-up in 1 month.' },
];

