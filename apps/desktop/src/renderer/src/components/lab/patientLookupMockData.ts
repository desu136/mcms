export interface PatientVisit {
  visitId: string;
  department: string;
  admitted: string;
  room: string;
  attendingDoctor: string;
}

export interface PatientOrderedTest {
  num: number;
  testName: string;
  sampleType: 'Blood' | 'Urine' | 'Stool' | 'Swab' | 'Other';
  orderedDate: string;
  status: 'Completed' | 'Pending' | 'Processing' | 'Scheduled';
  hasResult: boolean;
  resultSummary?: string;
}

export interface PatientLabHistoryItem {
  date: string;
  testName: string;
  resultStatus: string;
  isAbnormal?: boolean;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  name: string;
  status: 'Active' | 'Discharged' | 'Outpatient';
  gender: 'Female' | 'Male';
  dob: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  avatar: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string;
  currentVisit: PatientVisit;
  stats: {
    totalTests: number;
    completed: number;
    completedPct: string;
    pending: number;
    pendingChange: string;
    abnormal: number;
    abnormalChange: string;
  };
  orderedTests: PatientOrderedTest[];
  recentTests: {
    name: string;
    status: 'Completed' | 'Pending' | 'Processing' | 'Scheduled';
    time: string;
  }[];
  history: PatientLabHistoryItem[];
}

export const PRIMARY_PATIENT: PatientRecord = {
  id: 'pat-001024',
  patientId: 'PID-001024',
  name: 'Aster Mulu',
  status: 'Active',
  gender: 'Female',
  dob: 'Mar 15, 1996 (28 years)',
  age: 28,
  phone: '+251 912 345 678',
  email: 'aster.mulu@email.com',
  address: 'Addis Ababa, Ethiopia',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  bloodGroup: 'O+',
  emergencyContact: '+251 911 111 222 (Mother)',
  allergies: 'None known',
  currentVisit: {
    visitId: 'VIS-2026-1045',
    department: 'Hematology',
    admitted: 'Oct 19, 2026 08:20 AM',
    room: '3A-01',
    attendingDoctor: 'Dr. Tesfaye Alemu',
  },
  stats: {
    totalTests: 12,
    completed: 7,
    completedPct: '58%',
    pending: 4,
    pendingChange: '↑ 33%',
    abnormal: 1,
    abnormalChange: '↓ 8%',
  },
  orderedTests: [
    {
      num: 1,
      testName: 'Complete Blood Count (CBC)',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 08:20 AM',
      status: 'Completed',
      hasResult: true,
      resultSummary: 'WBC 7.4 ×10⁹/L, RBC 4.62, Hb 13.8',
    },
    {
      num: 2,
      testName: 'Blood Group & Rh',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 08:20 AM',
      status: 'Completed',
      hasResult: true,
      resultSummary: 'Blood Group O, Rh Positive',
    },
    {
      num: 3,
      testName: 'Urinalysis',
      sampleType: 'Urine',
      orderedDate: 'Oct 19, 2026 09:15 AM',
      status: 'Completed',
      hasResult: true,
      resultSummary: 'Normal sediment, protein negative',
    },
    {
      num: 4,
      testName: 'Liver Function Test (LFT)',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 10:00 AM',
      status: 'Pending',
      hasResult: false,
    },
    {
      num: 5,
      testName: 'Kidney Function Test (KFT)',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 11:30 AM',
      status: 'Pending',
      hasResult: false,
    },
    {
      num: 6,
      testName: 'Thyroid Profile',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 12:15 PM',
      status: 'Processing',
      hasResult: false,
    },
    {
      num: 7,
      testName: 'Hepatitis B Surface Ag',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 02:10 PM',
      status: 'Pending',
      hasResult: false,
    },
    {
      num: 8,
      testName: 'HIV Screening',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 04:10 PM',
      status: 'Scheduled',
      hasResult: false,
    },
    {
      num: 9,
      testName: 'Malaria Test',
      sampleType: 'Blood',
      orderedDate: 'Oct 19, 2026 05:00 PM',
      status: 'Scheduled',
      hasResult: false,
    },
    {
      num: 10,
      testName: 'Stool Examination',
      sampleType: 'Stool',
      orderedDate: 'Oct 19, 2026 05:30 PM',
      status: 'Pending',
      hasResult: false,
    },
    {
      num: 12,
      testName: 'Urine Culture',
      sampleType: 'Urine',
      orderedDate: 'Oct 20, 2026 08:00 AM',
      status: 'Scheduled',
      hasResult: false,
    },
  ],
  recentTests: [
    { name: 'CBC', status: 'Completed', time: 'Oct 19, 08:20 AM' },
    { name: 'Blood Group & Rh', status: 'Completed', time: 'Oct 19, 08:20 AM' },
    { name: 'Urinalysis', status: 'Completed', time: 'Oct 19, 09:15 AM' },
    { name: 'LFT', status: 'Pending', time: 'Oct 19, 10:00 AM' },
    { name: 'KFT', status: 'Pending', time: 'Oct 19, 11:30 AM' },
  ],
  history: [
    { date: 'Oct 12, 2026', testName: 'CBC', resultStatus: 'Normal', isAbnormal: false },
    { date: 'Oct 05, 2026', testName: 'LFT', resultStatus: 'Normal', isAbnormal: false },
    { date: 'Sep 28, 2026', testName: 'Urinalysis', resultStatus: 'Normal', isAbnormal: false },
    { date: 'Sep 15, 2026', testName: 'CBC', resultStatus: 'Mild Anemia', isAbnormal: true },
    { date: 'Aug 22, 2026', testName: 'Blood Group', resultStatus: 'O+', isAbnormal: false },
  ],
};

export const ALL_MOCK_PATIENTS: PatientRecord[] = [
  PRIMARY_PATIENT,
  {
    id: 'pat-001025',
    patientId: 'PID-001025',
    name: 'Samuel Girma',
    status: 'Active',
    gender: 'Male',
    dob: 'May 10, 1979 (45 years)',
    age: 45,
    phone: '+251 922 456 789',
    email: 'samuel.g@gmail.com',
    address: 'Addis Ababa, Ethiopia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'A+',
    emergencyContact: '+251 922 111 333 (Wife)',
    allergies: 'Penicillin',
    currentVisit: {
      visitId: 'VIS-2026-1046',
      department: 'Biochemistry',
      admitted: 'Oct 19, 2026 09:00 AM',
      room: '5B-02',
      attendingDoctor: 'Dr. Michael Chen',
    },
    stats: {
      totalTests: 4,
      completed: 2,
      completedPct: '50%',
      pending: 2,
      pendingChange: '↑ 20%',
      abnormal: 0,
      abnormalChange: '0%',
    },
    orderedTests: [
      {
        num: 1,
        testName: 'Random Blood Sugar (RBS)',
        sampleType: 'Blood',
        orderedDate: 'Oct 19, 2026 09:15 AM',
        status: 'Completed',
        hasResult: true,
        resultSummary: 'Glucose 112 mg/dL',
      },
      {
        num: 2,
        testName: 'Lipid Panel',
        sampleType: 'Blood',
        orderedDate: 'Oct 19, 2026 09:30 AM',
        status: 'Completed',
        hasResult: true,
        resultSummary: 'Cholesterol 185 mg/dL',
      },
    ],
    recentTests: [
      { name: 'RBS', status: 'Completed', time: 'Oct 19, 09:15 AM' },
      { name: 'Lipid Panel', status: 'Completed', time: 'Oct 19, 09:30 AM' },
    ],
    history: [
      { date: 'Sep 10, 2026', testName: 'HbA1c', resultStatus: 'Normal', isAbnormal: false },
    ],
  },
  {
    id: 'pat-001026',
    patientId: 'PID-001026',
    name: 'Lidya Kebede',
    status: 'Active',
    gender: 'Female',
    dob: 'Jun 20, 1992 (32 years)',
    age: 32,
    phone: '+251 933 567 890',
    email: 'lidya.k@gmail.com',
    address: 'Addis Ababa, Ethiopia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    emergencyContact: '+251 933 222 444 (Sister)',
    allergies: 'None',
    currentVisit: {
      visitId: 'VIS-2026-1047',
      department: 'Microbiology',
      admitted: 'Oct 19, 2026 09:30 AM',
      room: '7A-01',
      attendingDoctor: 'Dr. Sarah Jenkins',
    },
    stats: {
      totalTests: 3,
      completed: 3,
      completedPct: '100%',
      pending: 0,
      pendingChange: '0%',
      abnormal: 0,
      abnormalChange: '0%',
    },
    orderedTests: [
      {
        num: 1,
        testName: 'Routine Urine Analysis',
        sampleType: 'Urine',
        orderedDate: 'Oct 19, 2026 10:00 AM',
        status: 'Completed',
        hasResult: true,
        resultSummary: 'Normal',
      },
    ],
    recentTests: [
      { name: 'Urine Analysis', status: 'Completed', time: 'Oct 19, 10:00 AM' },
    ],
    history: [
      { date: 'Aug 04, 2026', testName: 'Urine Culture', resultStatus: 'Negative', isAbnormal: false },
    ],
  },
];

