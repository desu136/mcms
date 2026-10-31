export interface ReportKPIStats {
  totalTestsPerformed: { value: string; change: string; trend: 'up' | 'down'; label: string };
  avgTurnaroundTime: { value: string; change: string; trend: 'down'; label: string };
  abnormalResults: { value: string; change: string; trend: 'up'; label: string };
  samplesProcessed: { value: string; change: string; trend: 'up'; label: string };
  resultReleaseRate: { value: string; change: string; trend: 'up'; label: string };
}

export const REPORTS_KPI_STATS: ReportKPIStats = {
  totalTestsPerformed: { value: '1,248', change: '12%', trend: 'up', label: 'vs. last week' },
  avgTurnaroundTime: { value: '2.8 hrs', change: '35%', trend: 'down', label: 'vs. last week' },
  abnormalResults: { value: '86', change: '18%', trend: 'up', label: 'vs. last week' },
  samplesProcessed: { value: '1,142', change: '11%', trend: 'up', label: 'vs. last week' },
  resultReleaseRate: { value: '96.4%', change: '2.3%', trend: 'up', label: 'vs. last week' },
};

export const TEST_VOLUME_TREND_DATA = [
  { day: 'Oct 13', Hematology: 85, Biochemistry: 90, Microbiology: 50, total: 225 },
  { day: 'Oct 14', Hematology: 95, Biochemistry: 85, Microbiology: 65, total: 245 },
  { day: 'Oct 15', Hematology: 90, Biochemistry: 92, Microbiology: 58, total: 240 },
  { day: 'Oct 16', Hematology: 100, Biochemistry: 95, Microbiology: 70, total: 265 },
  { day: 'Oct 17', Hematology: 110, Biochemistry: 85, Microbiology: 75, total: 270 },
  { day: 'Oct 18', Hematology: 130, Biochemistry: 105, Microbiology: 80, total: 315 },
  { day: 'Oct 19', Hematology: 140, Biochemistry: 110, Microbiology: 90, total: 340 },
];

export const TEST_TYPE_DISTRIBUTION_DATA = [
  { name: 'Hematology', value: 401, percentage: '32.1%', color: '#2563EB' },
  { name: 'Biochemistry', value: 358, percentage: '28.7%', color: '#06B6D4' },
  { name: 'Microbiology', value: 210, percentage: '16.8%', color: '#8B5CF6' },
  { name: 'Immunology', value: 140, percentage: '11.2%', color: '#38BDF8' },
  { name: 'Others', value: 139, percentage: '11.2%', color: '#F59E0B' },
];

export const TURNAROUND_TIME_DATA = [
  { department: 'Hematology', tat: '1.2 hrs', status: 'On Target' as const },
  { department: 'Biochemistry', tat: '2.6 hrs', status: 'On Target' as const },
  { department: 'Microbiology', tat: '5.4 hrs', status: 'Slightly High' as const },
  { department: 'Immunology', tat: '3.1 hrs', status: 'On Target' as const },
  { department: 'Others', tat: '4.2 hrs', status: 'Slightly High' as const },
];

export const RECENT_TEST_REPORTS = [
  {
    reportId: 'RPT-2026-1048',
    patientName: 'Aster Mulu',
    testName: 'CBC',
    resultStatus: 'Normal' as const,
    date: 'Oct 19, 2026 08:45 AM',
  },
  {
    reportId: 'RPT-2026-1047',
    patientName: 'Samuel Girma',
    testName: 'RBS',
    resultStatus: 'Normal' as const,
    date: 'Oct 19, 2026 08:30 AM',
  },
  {
    reportId: 'RPT-2026-1046',
    patientName: 'Lidya Kebede',
    testName: 'Urine Analysis',
    resultStatus: 'Abnormal' as const,
    date: 'Oct 19, 2026 08:20 AM',
  },
  {
    reportId: 'RPT-2026-1045',
    patientName: 'Getachew Tadese',
    testName: 'LFT',
    resultStatus: 'Normal' as const,
    date: 'Oct 19, 2026 08:10 AM',
  },
  {
    reportId: 'RPT-2026-1044',
    patientName: 'Betlehem Abebe',
    testName: 'KFT',
    resultStatus: 'Normal' as const,
    date: 'Oct 19, 2026 08:05 AM',
  },
];

export const STAFF_PERFORMANCE_DATA = [
  {
    name: 'Tadesse Kebede',
    role: 'Senior Lab Tech',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    testsProcessed: 285,
    accuracy: '98.9%',
    avgTat: '2.1 hrs',
  },
  {
    name: 'Mulugeta Alemu',
    role: 'Lab Technician',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    testsProcessed: 241,
    accuracy: '96.7%',
    avgTat: '2.8 hrs',
  },
  {
    name: 'Hawi Abebe',
    role: 'Lab Technician',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    testsProcessed: 198,
    accuracy: '95.5%',
    avgTat: '3.4 hrs',
  },
  {
    name: 'Selamawit Getachew',
    role: 'Lab Assistant',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    testsProcessed: 176,
    accuracy: '94.8%',
    avgTat: '3.9 hrs',
  },
  {
    name: 'Daniel Mesfin',
    role: 'Lab Assistant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    testsProcessed: 145,
    accuracy: '92.4%',
    avgTat: '4.6 hrs',
  },
];

export const ABNORMAL_RESULTS_SUMMARY = [
  { name: 'Hemoglobin (Low)', count: 24, percentage: '2.7%', trend: '↑ 33%' },
  { name: 'White Blood Cells (High)', count: 16, percentage: '1.8%', trend: '↑ 14%' },
  { name: 'Platelets (Low)', count: 12, percentage: '1.4%', trend: '↑ 9%' },
  { name: 'Glucose (High)', count: 10, percentage: '1.1%', trend: '↑ 11%' },
  { name: 'Others', count: 8, percentage: '0.9%', trend: '↑ 6%' },
];

export const REPORT_ANALYTICS_DATA = [
  { department: 'Hematology', total: 380, abnormal: 55 },
  { department: 'Biochemistry', total: 320, abnormal: 45 },
  { department: 'Microbiology', total: 210, abnormal: 35 },
  { department: 'Immunology', total: 145, abnormal: 20 },
  { department: 'Others', total: 130, abnormal: 15 },
];

export const RECENT_EXPORTS_DATA = [
  {
    id: 'exp-1',
    title: 'Lab Report (Oct 19, 2026)',
    timestamp: 'Oct 19, 2026 10:12 AM',
    status: 'Completed' as const,
  },
  {
    id: 'exp-2',
    title: 'Test Results (This Week)',
    timestamp: 'Oct 19, 2026 09:45 AM',
    status: 'Completed' as const,
  },
  {
    id: 'exp-3',
    title: 'Patient Summary',
    timestamp: 'Oct 18, 2026 04:32 PM',
    status: 'Completed' as const,
  },
  {
    id: 'exp-4',
    title: 'Monthly Report (Sep 2026)',
    timestamp: 'Oct 17, 2026 11:21 AM',
    status: 'Completed' as const,
  },
];

