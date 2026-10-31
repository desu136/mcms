export interface SampleItem {
  id: string;
  sampleId: string;
  patientName: string;
  patientRoom: string;
  patientId: string;
  patientAge: number;
  patientGender: 'Female' | 'Male';
  patientPhone: string;
  patientEmail: string;
  patientCity: string;
  patientAvatar: string;
  testName: string;
  testCode: string;
  sampleType: 'Blood' | 'Urine' | 'Stool' | 'Swab' | 'Tissue' | 'Other';
  department:
    | 'Hematology'
    | 'Biochemistry'
    | 'Microbiology'
    | 'Immunology'
    | 'Parasitology'
    | 'Virology'
    | 'Serology';
  collectionTime: string;
  status: 'Collected' | 'In Processing' | 'Completed' | 'Pending' | 'Rejected';
}

export const SAMPLE_KPI_STATS = {
  totalSamples: { value: 152, change: '12%', trend: 'up' as const, label: 'vs. yesterday' },
  collected: { value: 118, change: '15%', trend: 'up' as const, label: 'vs. yesterday' },
  inProcessing: { value: 21, change: '5%', trend: 'up' as const, label: 'vs. yesterday' },
  completed: { value: 98, change: '18%', trend: 'up' as const, label: 'vs. yesterday' },
  rejected: { value: 5, change: '44%', trend: 'down' as const, label: 'vs. yesterday' },
};

export const EXACT_SAMPLE_ROWS: SampleItem[] = [
  {
    id: 'smp-0018',
    sampleId: 'SMP-2026-0018',
    patientName: 'Aster Mulu',
    patientRoom: 'Room 3',
    patientId: 'PID-001024',
    patientAge: 28,
    patientGender: 'Female',
    patientPhone: '+251 912 345 678',
    patientEmail: 'aster.mulu@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    testName: 'CBC',
    testCode: 'CBC (Complete Blood Count)',
    sampleType: 'Blood',
    department: 'Hematology',
    collectionTime: 'Oct 19, 2026 08:20 AM',
    status: 'Collected',
  },
  {
    id: 'smp-0019',
    sampleId: 'SMP-2026-0019',
    patientName: 'Samuel Girma',
    patientRoom: 'Room 5',
    patientId: 'PID-001023',
    patientAge: 42,
    patientGender: 'Male',
    patientPhone: '+251 911 234 567',
    patientEmail: 'samuel.girma@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    testName: 'RBS',
    testCode: 'Random Blood Sugar (RBS)',
    sampleType: 'Blood',
    department: 'Biochemistry',
    collectionTime: 'Oct 19, 2026 09:15 AM',
    status: 'In Processing',
  },
  {
    id: 'smp-0020',
    sampleId: 'SMP-2026-0020',
    patientName: 'Lidya Kebede',
    patientRoom: 'Room 7',
    patientId: 'PID-001022',
    patientAge: 35,
    patientGender: 'Female',
    patientPhone: '+251 913 456 789',
    patientEmail: 'lidya.k@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    testName: 'Urine Analysis',
    testCode: 'Routine Urinalysis & Microscopy',
    sampleType: 'Urine',
    department: 'Microbiology',
    collectionTime: 'Oct 19, 2026 10:00 AM',
    status: 'Completed',
  },
  {
    id: 'smp-0021',
    sampleId: 'SMP-2026-0021',
    patientName: 'Getachew Tadese',
    patientRoom: 'Room 2',
    patientId: 'PID-001021',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '+251 911 876 543',
    patientEmail: 'getachew.t@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    testName: 'LFT',
    testCode: 'Liver Function Test (LFT)',
    sampleType: 'Blood',
    department: 'Biochemistry',
    collectionTime: 'Oct 19, 2026 11:10 AM',
    status: 'In Processing',
  },
  {
    id: 'smp-0022',
    sampleId: 'SMP-2026-0022',
    patientName: 'Betlehem Abebe',
    patientRoom: 'Room 6',
    patientId: 'PID-001020',
    patientAge: 31,
    patientGender: 'Female',
    patientPhone: '+251 914 567 890',
    patientEmail: 'betlehem.a@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    testName: 'KFT',
    testCode: 'Kidney Function Test (KFT)',
    sampleType: 'Blood',
    department: 'Biochemistry',
    collectionTime: 'Oct 19, 2026 11:30 AM',
    status: 'Pending',
  },
  {
    id: 'smp-0023',
    sampleId: 'SMP-2026-0023',
    patientName: 'Daniel Wondimu',
    patientRoom: 'Room 4',
    patientId: 'PID-001019',
    patientAge: 47,
    patientGender: 'Male',
    patientPhone: '+251 915 678 901',
    patientEmail: 'daniel.w@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    testName: 'Thyroid Profile',
    testCode: 'Thyroid Profile (TSH, FT3, FT4)',
    sampleType: 'Blood',
    department: 'Immunology',
    collectionTime: 'Oct 19, 2026 12:15 PM',
    status: 'Completed',
  },
  {
    id: 'smp-0024',
    sampleId: 'SMP-2026-0024',
    patientName: 'Tigist Alemu',
    patientRoom: 'Room 8',
    patientId: 'PID-001018',
    patientAge: 24,
    patientGender: 'Female',
    patientPhone: '+251 916 789 012',
    patientEmail: 'tigist.a@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    testName: 'Stool Examination',
    testCode: 'Routine Stool Microscopy & Culture',
    sampleType: 'Stool',
    department: 'Microbiology',
    collectionTime: 'Oct 19, 2026 01:10 PM',
    status: 'Completed',
  },
  {
    id: 'smp-0025',
    sampleId: 'SMP-2026-0025',
    patientName: 'Abeebe Assefa',
    patientRoom: 'Room 1',
    patientId: 'PID-001017',
    patientAge: 51,
    patientGender: 'Male',
    patientPhone: '+251 917 890 123',
    patientEmail: 'abebe.a@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    testName: 'Malaria Test',
    testCode: 'Rapid Antigen & Thick/Thin Blood Film',
    sampleType: 'Blood',
    department: 'Parasitology',
    collectionTime: 'Oct 19, 2026 02:10 PM',
    status: 'Pending',
  },
  {
    id: 'smp-0026',
    sampleId: 'SMP-2026-0026',
    patientName: 'Sofiya Mohamed',
    patientRoom: 'Room 9',
    patientId: 'PID-001016',
    patientAge: 39,
    patientGender: 'Female',
    patientPhone: '+251 918 901 234',
    patientEmail: 'sofiya.m@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    testName: 'HIV Screening',
    testCode: 'HIV 1/2 Rapid Antibody/Antigen',
    sampleType: 'Blood',
    department: 'Virology',
    collectionTime: 'Oct 19, 2026 03:20 PM',
    status: 'Completed',
  },
  {
    id: 'smp-0027',
    sampleId: 'SMP-2026-0027',
    patientName: 'Yonas Gebre',
    patientRoom: 'Room 3',
    patientId: 'PID-001015',
    patientAge: 29,
    patientGender: 'Male',
    patientPhone: '+251 919 012 345',
    patientEmail: 'yonas.g@email.com',
    patientCity: 'Addis Ababa, Ethiopia',
    patientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    testName: 'Hepatitis B Surface Ag',
    testCode: 'Hepatitis B Surface Antigen (HBsAg)',
    sampleType: 'Blood',
    department: 'Serology',
    collectionTime: 'Oct 19, 2026 04:10 PM',
    status: 'In Processing',
  },
];

export const SAMPLE_STATUS_DISTRIBUTION = [
  { name: 'Collected', value: 118, percentage: '78%', color: '#10B981' },
  { name: 'In Processing', value: 21, percentage: '14%', color: '#3B82F6' },
  { name: 'Pending', value: 8, percentage: '5%', color: '#F59E0B' },
  { name: 'Rejected', value: 5, percentage: '3%', color: '#EF4444' },
];

export interface RecentActivityItem {
  id: string;
  time: string;
  sampleId: string;
  patient: string;
  action: 'Registered' | 'Collected' | 'Accepted' | 'Rejected' | 'Completed';
  by: string;
}

export const RECENT_SAMPLE_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    time: '10:15 AM',
    sampleId: 'SMP-2026-0028',
    patient: 'Tigist Alemu',
    action: 'Registered',
    by: 'Dawit T.',
  },
  {
    id: 'act-2',
    time: '09:45 AM',
    sampleId: 'SMP-2026-0027',
    patient: 'Yonas Gebre',
    action: 'Collected',
    by: 'Dawit T.',
  },
  {
    id: 'act-3',
    time: '08:30 AM',
    sampleId: 'SMP-2026-0026',
    patient: 'Sofiya Mohamed',
    action: 'Accepted',
    by: 'Meseret K.',
  },
  {
    id: 'act-4',
    time: '07:50 AM',
    sampleId: 'SMP-2026-0025',
    patient: 'Abebe Assefa',
    action: 'Rejected',
    by: 'Dawit T.',
  },
  {
    id: 'act-5',
    time: '07:20 AM',
    sampleId: 'SMP-2026-0024',
    patient: 'Tigist Alemu',
    action: 'Completed',
    by: 'Meseret K.',
  },
];

export const HANDOVER_TRACKING_STEPS = [
  {
    title: 'Samples collected',
    time: 'Oct 19, 2026 • 08:20 AM',
    count: '148 samples',
    status: 'completed' as const,
  },
  {
    title: 'Delivered to Lab',
    time: 'Oct 19, 2026 • 10:05 AM',
    count: '132 samples',
    status: 'completed' as const,
  },
  {
    title: 'Processing',
    time: 'In Progress',
    count: '21 samples',
    status: 'in_progress' as const,
  },
  {
    title: 'Result Available',
    time: 'Pending',
    count: '0 samples',
    status: 'pending' as const,
  },
];

