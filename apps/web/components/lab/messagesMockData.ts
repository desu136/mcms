export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ConversationItem {
  id: string;
  name: string;
  role: 'Patient' | 'Doctor' | 'Nurse' | 'Lab Staff' | 'Pharmacy' | 'Reception';
  roleDetails: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  patientInfo?: {
    patientId: string;
    status: 'Active' | 'Discharged';
    ageDob: string;
    phone: string;
    address: string;
    currentVisit: {
      visitId: string;
      department: string;
      admitted: string;
      attendingDoctor: string;
      status: string;
    };
    notes: {
      date: string;
      time: string;
      author: string;
      content: string;
    }[];
  };
  messages: ChatMessage[];
}

export const EXACT_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    name: 'Aster Mulu',
    role: 'Patient',
    roleDetails: 'Patient • Room 3',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Thank you for the update. 🙏',
    time: '10:24 AM',
    unreadCount: 2,
    patientInfo: {
      patientId: 'PID-001024',
      status: 'Active',
      ageDob: '28 years (Mar 15, 1996)',
      phone: '+251 912 345 678',
      address: 'Addis Ababa, Ethiopia',
      currentVisit: {
        visitId: 'VIS-2026-1045',
        department: 'Hematology',
        admitted: 'Oct 19, 2026 08:20 AM',
        attendingDoctor: 'Dr. Tesfaye Alemu',
        status: 'In Progress',
      },
      notes: [
        {
          date: 'Oct 19, 2026',
          time: '08:45 AM',
          author: 'Lab Technician',
          content: 'Patient is stable. CBC result is normal.',
        },
        {
          date: 'Oct 12, 2026',
          time: '02:30 PM',
          author: 'Dr. Tesfaye Alemu',
          content: 'Follow up for anemia check.',
        },
        {
          date: 'Sep 28, 2026',
          time: '11:15 AM',
          author: 'Nurse',
          content: 'Patient reported mild dizziness.',
        },
      ],
    },
    messages: [
      {
        id: 'msg-1',
        sender: 'other',
        senderName: 'Aster Mulu',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: 'Hello, I just wanted to ask about my blood test result. Is it ready now?',
        time: '09:12 AM',
      },
      {
        id: 'msg-2',
        sender: 'user',
        senderName: 'Dawit Tadesse',
        senderAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        text: 'Hello Aster, yes your CBC result is ready. Everything looks normal. You can view it in the system or we can print a copy for you.',
        time: '09:15 AM',
        status: 'read',
      },
      {
        id: 'msg-3',
        sender: 'other',
        senderName: 'Aster Mulu',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: "Thank you! That's great news. 🙏",
        time: '09:18 AM',
      },
      {
        id: 'msg-4',
        sender: 'user',
        senderName: 'Dawit Tadesse',
        senderAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        text: "You're welcome! If you need anything else, just let us know.",
        time: '09:20 AM',
        status: 'read',
      },
      {
        id: 'msg-5',
        sender: 'other',
        senderName: 'Aster Mulu',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: 'Can you also tell me when my next appointment is?',
        time: '10:21 AM',
      },
      {
        id: 'msg-6',
        sender: 'user',
        senderName: 'Dawit Tadesse',
        senderAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        text: "Your next appointment is on Oct 26, 2026 at 9:00 AM with Dr. Tesfaye Alemu. We'll also remind you a day before.",
        time: '10:24 AM',
        status: 'read',
      },
      {
        id: 'msg-7',
        sender: 'other',
        senderName: 'Aster Mulu',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: 'Perfect. Thank you so much!',
        time: '10:24 AM',
      },
    ],
  },
  {
    id: 'conv-2',
    name: 'Dr. Tesfaye Alemu',
    role: 'Doctor',
    roleDetails: 'Doctor • Internal Medicine',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Please review the CBC result for patient...',
    time: '09:58 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-2-1',
        sender: 'other',
        senderName: 'Dr. Tesfaye Alemu',
        senderAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
        text: 'Hi Dawit, please review the CBC result for patient Aster Mulu when ready.',
        time: '09:58 AM',
      },
    ],
  },
  {
    id: 'conv-3',
    name: 'Selamawit Getachew',
    role: 'Nurse',
    roleDetails: 'Nurse • Ward 2',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'The sample for BUN is ready for processing.',
    time: '09:42 AM',
    messages: [
      {
        id: 'msg-3-1',
        sender: 'other',
        senderName: 'Selamawit Getachew',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        text: 'The sample for BUN is ready for processing in Ward 2.',
        time: '09:42 AM',
      },
    ],
  },
  {
    id: 'conv-4',
    name: 'Lab Team',
    role: 'Lab Staff',
    roleDetails: 'Lab Staff • Laboratory',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Result for SMP-2026-0018 is ready.',
    time: '09:30 AM',
    unreadCount: 3,
    messages: [
      {
        id: 'msg-4-1',
        sender: 'other',
        senderName: 'Lab Team',
        senderAvatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
        text: 'Result for SMP-2026-0018 is ready for verification.',
        time: '09:30 AM',
      },
    ],
  },
  {
    id: 'conv-5',
    name: 'Tigist Alemu',
    role: 'Reception',
    roleDetails: 'Reception • Front Desk',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    lastMessage: 'New patient registered - 2026-1045',
    time: '08:55 AM',
    messages: [
      {
        id: 'msg-5-1',
        sender: 'other',
        senderName: 'Tigist Alemu',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'New patient registered - 2026-1045. Test order forwarded to Lab.',
        time: '08:55 AM',
      },
    ],
  },
  {
    id: 'conv-6',
    name: 'Pharmacy Team',
    role: 'Pharmacy',
    roleDetails: 'Pharmacy • Dispensary',
    avatar: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Medication for patient 2026-1042 is ready.',
    time: '08:20 AM',
    messages: [
      {
        id: 'msg-6-1',
        sender: 'other',
        senderName: 'Pharmacy Team',
        senderAvatar: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&auto=format&fit=crop&q=80',
        text: 'Medication for patient 2026-1042 is ready at the dispensary.',
        time: '08:20 AM',
      },
    ],
  },
  {
    id: 'conv-7',
    name: 'Mulugeta Alemu',
    role: 'Doctor',
    roleDetails: 'Doctor • Pathology',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Can you confirm the sample collection time?',
    time: '07:45 AM',
    messages: [
      {
        id: 'msg-7-1',
        sender: 'other',
        senderName: 'Mulugeta Alemu',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Can you confirm the sample collection time for biopsy sample?',
        time: '07:45 AM',
      },
    ],
  },
  {
    id: 'conv-8',
    name: 'Abebe Biru',
    role: 'Nurse',
    roleDetails: 'Nurse • Ward 1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Patient 2026-1038 has a critical value.',
    time: '07:32 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-8-1',
        sender: 'other',
        senderName: 'Abebe Biru',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        text: 'Patient 2026-1038 has a critical potassium level reported.',
        time: '07:32 AM',
      },
    ],
  },
  {
    id: 'conv-9',
    name: 'Daniel Wondimu',
    role: 'Lab Staff',
    roleDetails: 'Lab Staff • Hematology',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'The analyzer is back online now.',
    time: '06:50 AM',
    messages: [
      {
        id: 'msg-9-1',
        sender: 'other',
        senderName: 'Daniel Wondimu',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        text: 'The Sysmex analyzer is back online now after calibration.',
        time: '06:50 AM',
      },
    ],
  },
  {
    id: 'conv-10',
    name: 'Fitihwork Tadesse',
    role: 'Patient',
    roleDetails: 'Patient • Room 5',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    lastMessage: 'Good morning, when will my result be ready?',
    time: 'Yesterday',
    messages: [
      {
        id: 'msg-10-1',
        sender: 'other',
        senderName: 'Fitihwork Tadesse',
        senderAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
        text: 'Good morning, when will my result be ready?',
        time: 'Yesterday 04:15 PM',
      },
    ],
  },
];

