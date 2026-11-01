export interface LabUserProfile {
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    phone: string;
    relationship: string;
  };
  jobTitle: string;
  department: string;
  employeeId: string;
  status: 'Active' | 'On Leave';
  avatar: string;
  joinDate: string;
  experience: string;
  educationLevel: string;
  specialization: string;
  licenseNo: string;
  licenseExpiry: string;
  skills: string[];
}

export const LAB_USER_PROFILE: LabUserProfile = {
  fullName: 'Dawit Tadesse',
  dob: 'Mar 15, 1998',
  gender: 'Male',
  phone: '+251 912 345 678',
  email: 'dawit.tadesse@mcms.com',
  address: 'Bole, Addis Ababa, Ethiopia',
  emergencyContact: {
    phone: '+251 911 111 222',
    relationship: 'Father',
  },
  jobTitle: 'Lab Technician',
  department: 'Laboratory',
  employeeId: 'LAB-0045',
  status: 'Active',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250&auto=format&fit=crop&q=80',
  joinDate: 'Jan 10, 2024',
  experience: '2 years, 9 months',
  educationLevel: 'BSc in Medical Laboratory Science',
  specialization: 'Clinical Laboratory',
  licenseNo: 'LAB-2023-001',
  licenseExpiry: 'Dec 31, 2028',
  skills: ['Hematology', 'Biochemistry', 'Microbiology', 'Urine Analysis'],
};

export const PROFILE_STATS = {
  testsProcessed: { value: '1,248', trend: '↑ 12% vs. last month' },
  samplesHandled: { value: '892', trend: '↑ 8% vs. last month' },
  accuracyRate: { value: '98.7%', trend: '↑ 0.5% vs. last month' },
  avgTurnaroundTime: { value: '2.6 hrs', trend: '↓ 18% vs. last month' },
};

export const USER_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'ID Card',
    uploadDate: 'Oct 10, 2026',
  },
  {
    id: 'doc-2',
    name: 'Professional License',
    uploadDate: 'Aug 15, 2026',
  },
  {
    id: 'doc-3',
    name: 'Degree Certificate',
    uploadDate: 'Jul 20, 2026',
  },
];

export const RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    action: 'Updated test result - CBC',
    time: 'Oct 19, 2026 10:24 AM',
    iconType: 'user' as const,
  },
  {
    id: 'act-2',
    action: 'Registered new sample - SMP-2026-0048',
    time: 'Oct 19, 2026 09:15 AM',
    iconType: 'sample' as const,
  },
  {
    id: 'act-3',
    action: 'Logged in to the system',
    time: 'Oct 19, 2026 08:05 AM',
    iconType: 'login' as const,
  },
  {
    id: 'act-4',
    action: 'Viewed test order - RPT-2026-1048',
    time: 'Oct 18, 2026 04:32 PM',
    iconType: 'view' as const,
  },
  {
    id: 'act-5',
    action: 'Updated inventory stock',
    time: 'Oct 18, 2026 02:17 PM',
    iconType: 'inventory' as const,
  },
];

