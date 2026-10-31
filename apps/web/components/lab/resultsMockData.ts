export interface ResultParameter {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Abnormal';
}

export interface TestResultItem {
  id: string;
  resultId: string;
  sampleId: string;
  patientName: string;
  patientRoom: string;
  patientBed: string;
  patientId: string;
  patientAge: number;
  patientGender: 'Female' | 'Male';
  patientPhone: string;
  patientEmail: string;
  patientCity: string;
  patientAvatar: string;
  testName: string;
  testFullName: string;
  department:
    | 'Hematology'
    | 'Biochemistry'
    | 'Microbiology'
    | 'Immunology'
    | 'Parasitology'
    | 'Virology'
    | 'Serology';
  resultValue: string;
  isResultPositiveBadge?: boolean;
  status: 'Verified' | 'Completed' | 'Reviewed' | 'Abnormal' | 'Pending';
  completedAt: string;
  collectedAt: string;
  verifiedAt: string;
  verifiedBy: string;
  notes: string;
  parameters: ResultParameter[];
}

export const RESULTS_KPI_STATS = {
  totalResults: { value: 152, change: '12%', trend: 'up' as const, label: 'vs. yesterday' },
  completed: { value: 118, change: '15%', trend: 'up' as const, label: 'vs. yesterday' },
  pendingReview: { value: 21, change: '8%', trend: 'up' as const, label: 'vs. yesterday' },
  abnormalResults: { value: 8, change: '44%', trend: 'down' as const, label: 'vs. yesterday' },
  verifiedAndReleased: { value: 105, change: '10%', trend: 'up' as const, label: 'vs. yesterday' },
};

export const EXACT_RESULT_ROWS: TestResultItem[] = [
  {
    id: 'res-0048',
    resultId: 'RES-2026-0048',
    sampleId: 'SMP-2026-0018',
    patientName: 'Aster Mulu',
    patientRoom: 'Room 3',
    patientBed: 'Room 3A-01',
    patientId: 'PID-001024',
    patientAge: 28,
    patientGender: 'Female',
    patientPhone: '+251 912 345 678',
    patientEmail: 'aster.mulu@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    testName: 'CBC',
    testFullName: 'CBC (Complete Blood Count)',
    department: 'Hematology',
    resultValue: 'WBC 7.4 ×10⁹/L',
    status: 'Verified',
    completedAt: 'Oct 19, 2026 08:20 AM',
    collectedAt: 'Oct 19, 2026 08:20 AM',
    verifiedAt: 'Oct 19, 2026 08:45 AM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'All parameters are within normal range.',
    parameters: [
      { parameter: 'WBC', result: '7.4', unit: '10⁹/L', referenceRange: '4.0 - 10.0', status: 'Normal' },
      { parameter: 'RBC', result: '4.62', unit: '10¹²/L', referenceRange: '4.0 - 5.5', status: 'Normal' },
      { parameter: 'Hemoglobin', result: '13.8', unit: 'g/dL', referenceRange: '12.0 - 16.0', status: 'Normal' },
      { parameter: 'Hematocrit', result: '41.2', unit: '%', referenceRange: '36.0 - 46.0', status: 'Normal' },
      { parameter: 'Platelets', result: '248', unit: '10⁹/L', referenceRange: '150 - 450', status: 'Normal' },
    ],
  },
  {
    id: 'res-0047',
    resultId: 'RES-2026-0047',
    sampleId: 'SMP-2026-0019',
    patientName: 'Samuel Girma',
    patientRoom: 'Room 5',
    patientBed: 'Room 5B-02',
    patientId: 'PID-001025',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '+251 922 456 789',
    patientEmail: 'samuel.g@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    testName: 'RBS',
    testFullName: 'Random Blood Sugar (RBS)',
    department: 'Biochemistry',
    resultValue: 'Glucose 112 mg/dL',
    status: 'Completed',
    completedAt: 'Oct 19, 2026 09:15 AM',
    collectedAt: 'Oct 19, 2026 09:00 AM',
    verifiedAt: 'Oct 19, 2026 09:20 AM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'Blood glucose level within normal random range.',
    parameters: [
      { parameter: 'Glucose', result: '112', unit: 'mg/dL', referenceRange: '70 - 140', status: 'Normal' },
    ],
  },
  {
    id: 'res-0046',
    resultId: 'RES-2026-0046',
    sampleId: 'SMP-2026-0020',
    patientName: 'Lidya Kebede',
    patientRoom: 'Room 7',
    patientBed: 'Room 7A-01',
    patientId: 'PID-001026',
    patientAge: 32,
    patientGender: 'Female',
    patientPhone: '+251 933 567 890',
    patientEmail: 'lidya.k@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    testName: 'Urine Analysis',
    testFullName: 'Routine Urine Analysis',
    department: 'Microbiology',
    resultValue: 'Normal',
    status: 'Completed',
    completedAt: 'Oct 19, 2026 10:00 AM',
    collectedAt: 'Oct 19, 2026 09:30 AM',
    verifiedAt: 'Oct 19, 2026 10:15 AM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'No abnormal sediments or microscopic findings observed.',
    parameters: [
      { parameter: 'Color', result: 'Pale Yellow', unit: '', referenceRange: 'Pale Yellow', status: 'Normal' },
      { parameter: 'pH', result: '6.0', unit: '', referenceRange: '4.5 - 8.0', status: 'Normal' },
      { parameter: 'Protein', result: 'Negative', unit: '', referenceRange: 'Negative', status: 'Normal' },
      { parameter: 'Glucose', result: 'Negative', unit: '', referenceRange: 'Negative', status: 'Normal' },
      { parameter: 'Leukocytes', result: 'Negative', unit: '', referenceRange: 'Negative', status: 'Normal' },
    ],
  },
  {
    id: 'res-0045',
    resultId: 'RES-2026-0045',
    sampleId: 'SMP-2026-0021',
    patientName: 'Getachew Tadese',
    patientRoom: 'Room 2',
    patientBed: 'Room 2B-01',
    patientId: 'PID-001027',
    patientAge: 51,
    patientGender: 'Male',
    patientPhone: '+251 944 678 901',
    patientEmail: 'getachew.t@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    testName: 'LFT',
    testFullName: 'Liver Function Test (LFT)',
    department: 'Biochemistry',
    resultValue: 'ALT 45 U/L',
    status: 'Reviewed',
    completedAt: 'Oct 19, 2026 11:10 AM',
    collectedAt: 'Oct 19, 2026 10:45 AM',
    verifiedAt: 'Oct 19, 2026 11:20 AM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'Hepatic enzymes are within acceptable reference limits.',
    parameters: [
      { parameter: 'ALT (SGPT)', result: '45', unit: 'U/L', referenceRange: '7 - 56', status: 'Normal' },
      { parameter: 'AST (SGOT)', result: '38', unit: 'U/L', referenceRange: '10 - 40', status: 'Normal' },
      { parameter: 'Alkaline Phosphatase', result: '78', unit: 'U/L', referenceRange: '44 - 147', status: 'Normal' },
      { parameter: 'Total Bilirubin', result: '0.8', unit: 'mg/dL', referenceRange: '0.3 - 1.2', status: 'Normal' },
    ],
  },
  {
    id: 'res-0044',
    resultId: 'RES-2026-0044',
    sampleId: 'SMP-2026-0022',
    patientName: 'Betlehem Abebe',
    patientRoom: 'Room 6',
    patientBed: 'Room 6A-02',
    patientId: 'PID-001028',
    patientAge: 24,
    patientGender: 'Female',
    patientPhone: '+251 955 789 012',
    patientEmail: 'betlehem.a@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    testName: 'KFT',
    testFullName: 'Kidney Function Test (KFT)',
    department: 'Biochemistry',
    resultValue: 'Creatinine 1.2 mg/dL',
    status: 'Completed',
    completedAt: 'Oct 19, 2026 11:30 AM',
    collectedAt: 'Oct 19, 2026 11:00 AM',
    verifiedAt: 'Oct 19, 2026 11:40 AM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'Renal parameters stable and well maintained.',
    parameters: [
      { parameter: 'Serum Creatinine', result: '1.2', unit: 'mg/dL', referenceRange: '0.6 - 1.3', status: 'Normal' },
      { parameter: 'Blood Urea Nitrogen', result: '15', unit: 'mg/dL', referenceRange: '7 - 20', status: 'Normal' },
      { parameter: 'eGFR', result: '92', unit: 'mL/min', referenceRange: '> 60', status: 'Normal' },
    ],
  },
  {
    id: 'res-0043',
    resultId: 'RES-2026-0043',
    sampleId: 'SMP-2026-0023',
    patientName: 'Daniel Wondimu',
    patientRoom: 'Room 4',
    patientBed: 'Room 4B-01',
    patientId: 'PID-001029',
    patientAge: 38,
    patientGender: 'Male',
    patientPhone: '+251 966 890 123',
    patientEmail: 'daniel.w@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    testName: 'Thyroid Profile',
    testFullName: 'Thyroid Function Panel',
    department: 'Immunology',
    resultValue: 'TSH 5.6 μIU/mL',
    status: 'Abnormal',
    completedAt: 'Oct 19, 2026 12:15 PM',
    collectedAt: 'Oct 19, 2026 11:30 AM',
    verifiedAt: 'Oct 19, 2026 12:20 PM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'Elevated TSH levels detected (High). Clinical evaluation recommended.',
    parameters: [
      { parameter: 'TSH', result: '5.6', unit: 'μIU/mL', referenceRange: '0.4 - 4.0', status: 'High' },
      { parameter: 'Free T4', result: '1.1', unit: 'ng/dL', referenceRange: '0.8 - 1.8', status: 'Normal' },
      { parameter: 'Free T3', result: '2.8', unit: 'pg/mL', referenceRange: '2.3 - 4.2', status: 'Normal' },
    ],
  },
  {
    id: 'res-0042',
    resultId: 'RES-2026-0042',
    sampleId: 'SMP-2026-0024',
    patientName: 'Tigist Alemu',
    patientRoom: 'Room 8',
    patientBed: 'Room 8A-01',
    patientId: 'PID-001030',
    patientAge: 29,
    patientGender: 'Female',
    patientPhone: '+251 977 901 234',
    patientEmail: 'tigist.a@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    testName: 'Stool Examination',
    testFullName: 'Comprehensive Stool Examination',
    department: 'Microbiology',
    resultValue: 'No parasites',
    status: 'Completed',
    completedAt: 'Oct 19, 2026 01:10 PM',
    collectedAt: 'Oct 19, 2026 12:30 PM',
    verifiedAt: 'Oct 19, 2026 01:15 PM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'No ova, cysts, or pathogenic parasites found in sample.',
    parameters: [
      { parameter: 'Consistency', result: 'Formed', unit: '', referenceRange: 'Formed', status: 'Normal' },
      { parameter: 'Ova / Parasites', result: 'None seen', unit: '', referenceRange: 'None seen', status: 'Normal' },
      { parameter: 'Occult Blood', result: 'Negative', unit: '', referenceRange: 'Negative', status: 'Normal' },
    ],
  },
  {
    id: 'res-0041',
    resultId: 'RES-2026-0041',
    sampleId: 'SMP-2026-0025',
    patientName: 'Abebe Assefa',
    patientRoom: 'Room 1',
    patientBed: 'Room 1A-02',
    patientId: 'PID-001031',
    patientAge: 62,
    patientGender: 'Male',
    patientPhone: '+251 988 012 345',
    patientEmail: 'abebe.a@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    testName: 'Malaria Test',
    testFullName: 'Malaria Microscopy & RDT',
    department: 'Parasitology',
    resultValue: 'Negative',
    status: 'Completed',
    completedAt: 'Oct 19, 2026 02:10 PM',
    collectedAt: 'Oct 19, 2026 01:40 PM',
    verifiedAt: 'Oct 19, 2026 02:15 PM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'Both rapid diagnostic test and peripheral smear negative for Plasmodium spp.',
    parameters: [
      { parameter: 'Blood Smear (Microscopy)', result: 'Negative', unit: '', referenceRange: 'Negative', status: 'Normal' },
      { parameter: 'Malaria Ag (RDT)', result: 'Negative', unit: '', referenceRange: 'Negative', status: 'Normal' },
    ],
  },
  {
    id: 'res-0040',
    resultId: 'RES-2026-0040',
    sampleId: 'SMP-2026-0026',
    patientName: 'Sofiya Mohamed',
    patientRoom: 'Room 9',
    patientBed: 'Room 9B-01',
    patientId: 'PID-001032',
    patientAge: 35,
    patientGender: 'Female',
    patientPhone: '+251 999 123 456',
    patientEmail: 'sofiya.m@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    testName: 'Hepatitis B Surface Ag',
    testFullName: 'Hepatitis B Surface Antigen (HBsAg)',
    department: 'Virology',
    resultValue: 'Positive',
    isResultPositiveBadge: true,
    status: 'Abnormal',
    completedAt: 'Oct 19, 2026 03:20 PM',
    collectedAt: 'Oct 19, 2026 02:50 PM',
    verifiedAt: 'Oct 19, 2026 03:25 PM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'HBsAg Reactive (Positive). Ordering physician immediately notified.',
    parameters: [
      { parameter: 'HBsAg', result: 'Reactive (Positive)', unit: '', referenceRange: 'Non-reactive', status: 'Abnormal' },
      { parameter: 'Confirmation ELISA', result: 'Positive', unit: '', referenceRange: 'Negative', status: 'Abnormal' },
    ],
  },
  {
    id: 'res-0039',
    resultId: 'RES-2026-0039',
    sampleId: 'SMP-2026-0027',
    patientName: 'Yonas Gebre',
    patientRoom: 'Room 3',
    patientBed: 'Room 3B-02',
    patientId: 'PID-001033',
    patientAge: 40,
    patientGender: 'Male',
    patientPhone: '+251 911 234 567',
    patientEmail: 'yonas.g@gmail.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    testName: 'HIV Screening',
    testFullName: 'HIV 1/2 Antibody & p24 Antigen Rapid Screening',
    department: 'Serology',
    resultValue: 'Non-reactive',
    status: 'Completed',
    completedAt: 'Oct 19, 2026 04:10 PM',
    collectedAt: 'Oct 19, 2026 03:30 PM',
    verifiedAt: 'Oct 19, 2026 04:15 PM',
    verifiedBy: 'Dawit Tadesse',
    notes: 'HIV rapid screening test non-reactive. Window period precautions explained.',
    parameters: [
      { parameter: 'HIV 1/2 Antibody', result: 'Non-reactive', unit: '', referenceRange: 'Non-reactive', status: 'Normal' },
      { parameter: 'p24 Antigen', result: 'Non-reactive', unit: '', referenceRange: 'Non-reactive', status: 'Normal' },
    ],
  },
];

export const RESULT_STATUS_DISTRIBUTION = [
  { name: 'Completed', value: 118, percentage: '78%', color: '#2563EB' },
  { name: 'Pending Review', value: 21, percentage: '14%', color: '#0EA5E9' },
  { name: 'Abnormal', value: 8, percentage: '5%', color: '#F59E0B' },
  { name: 'Rejected', value: 5, percentage: '3%', color: '#EF4444' },
];

export const RECENT_RESULTS = [
  {
    id: 'rec-1',
    patient: 'Aster Mulu',
    test: 'CBC',
    status: 'Verified' as const,
    time: 'Oct 19, 08:20 AM',
    indicatorColor: 'bg-emerald-500',
    isAlert: false,
  },
  {
    id: 'rec-2',
    patient: 'Samuel Girma',
    test: 'RBS',
    status: 'Completed' as const,
    time: 'Oct 19, 09:15 AM',
    indicatorColor: 'bg-purple-500',
    isAlert: false,
  },
  {
    id: 'rec-3',
    patient: 'Lidya Kebede',
    test: 'Urine Analysis',
    status: 'Completed' as const,
    time: 'Oct 19, 10:00 AM',
    indicatorColor: 'bg-rose-500',
    isAlert: true,
  },
  {
    id: 'rec-4',
    patient: 'Getachew Tadese',
    test: 'LFT',
    status: 'Reviewed' as const,
    time: 'Oct 19, 11:10 AM',
    indicatorColor: 'bg-blue-500',
    isAlert: false,
  },
  {
    id: 'rec-5',
    patient: 'Sofiya Mohamed',
    test: 'Hepatitis B Surface Ag',
    status: 'Abnormal' as const,
    time: 'Oct 19, 03:20 PM',
    indicatorColor: 'bg-rose-500',
    isAlert: true,
  },
];

export const ABNORMAL_ALERTS = [
  {
    id: 'abn-1',
    title: 'TSH 5.6 μIU/mL (High)',
    subtitle: 'Oct 19, 12:15 PM - SMP-2026-0023',
  },
  {
    id: 'abn-2',
    title: 'Hepatitis B Surface Ag (Positive)',
    subtitle: 'Oct 19, 03:20 PM - SMP-2026-0026',
  },
  {
    id: 'abn-3',
    title: 'WBC 11.2 ×10⁹/L (High)',
    subtitle: 'Oct 19, 02:45 PM - SMP-2026-0028',
  },
  {
    id: 'abn-4',
    title: 'RBC 3.8 ×10¹²/L (Low)',
    subtitle: 'Oct 19, 01:20 PM - SMP-2026-0029',
  },
];

