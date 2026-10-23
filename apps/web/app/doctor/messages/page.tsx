'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
  User,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  ChevronRight,
  ShieldAlert,
  StickyNote,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';
import { INITIAL_PATIENTS, CURRENT_DOCTOR, PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'other';
  senderName: string;
  avatar: string;
  text: string;
  time: string;
}

interface ConversationItem {
  id: string;
  type: 'Patients' | 'Staff' | 'System';
  name: string;
  avatar?: string;
  iconType?: 'lab' | 'nurse' | 'system';
  preview: string;
  time: string;
  unreadCount?: number;
  hasUnreadDot?: boolean;
  patientId?: string;
  patientDetails?: {
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
    recentVisitDate: string;
    recentVisitTime: string;
    recentDepartment: string;
    recentDoctor: string;
    note: string;
    noteDate: string;
  };
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    type: 'Patients',
    name: 'Aster Mulu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    preview: 'Thank you doctor. I will follow your...',
    time: '10:24 AM',
    unreadCount: 2,
    patientId: 'PID-001024',
    patientDetails: {
      age: 28,
      gender: 'Female',
      phone: '+251 912 345 678',
      email: 'aster.mulu@email.com',
      address: 'Addis Ababa, Ethiopia',
      recentVisitDate: 'Oct 18, 2026',
      recentVisitTime: '09:15 AM',
      recentDepartment: 'Cardiology',
      recentDoctor: 'Dr. Fitsum Alemu',
      note: 'Patient is responding well to medication. No current complaints.',
      noteDate: 'Oct 18, 2026',
    },
    messages: [
      {
        id: 'm1',
        sender: 'other',
        senderName: 'Aster Mulu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Good morning doctor. I have a small concern about my medication. Should I take it with food or on an empty stomach?',
        time: '09:42 AM',
      },
      {
        id: 'm2',
        sender: 'doctor',
        senderName: 'Dr. Fitsum Alemu',
        avatar: CURRENT_DOCTOR.avatar,
        text: 'Good morning Aster. Most of your medications can be taken with food to reduce stomach upset. The only exception is Metformin, which is better on an empty stomach.',
        time: '09:48 AM',
      },
      {
        id: 'm3',
        sender: 'other',
        senderName: 'Aster Mulu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Thank you for the clarification. Also, I wanted to ask if my next follow-up is still on October 25, 2026?',
        time: '10:05 AM',
      },
      {
        id: 'm4',
        sender: 'doctor',
        senderName: 'Dr. Fitsum Alemu',
        avatar: CURRENT_DOCTOR.avatar,
        text: 'Yes, your next appointment is scheduled for Oct 25, 2026 at 09:00 AM. Please come 10 minutes early. If you have any symptoms before then, feel free to message me.',
        time: '10:14 AM',
      },
      {
        id: 'm5',
        sender: 'other',
        senderName: 'Aster Mulu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Thank you doctor. I will follow your advice and be there on the 25th. 😊',
        time: '10:24 AM',
      },
    ],
  },
  {
    id: 'conv-2',
    type: 'Patients',
    name: 'Samuel Girma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    preview: 'Can you please review my test results...',
    time: '09:17 AM',
    unreadCount: 1,
    patientId: 'PID-001087',
    patientDetails: {
      age: 45,
      gender: 'Male',
      phone: '+251 911 234 567',
      email: 'samuel.g@email.com',
      address: 'Bole, Addis Ababa',
      recentVisitDate: 'Oct 18, 2026',
      recentVisitTime: '04:20 PM',
      recentDepartment: 'Cardiology',
      recentDoctor: 'Dr. Fitsum Alemu',
      note: 'Type 2 Diabetes well maintained on Metformin 500mg BID.',
      noteDate: 'Oct 18, 2026',
    },
    messages: [
      {
        id: 'sm1',
        sender: 'other',
        senderName: 'Samuel Girma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Good morning Dr. Fitsum. Can you please review my test results from yesterday?',
        time: '09:17 AM',
      },
    ],
  },
  {
    id: 'conv-3',
    type: 'Staff',
    name: 'Lab Department',
    iconType: 'lab',
    preview: 'New lab results are available for...',
    time: '08:52 AM',
    unreadCount: 3,
    messages: [
      {
        id: 'lm1',
        sender: 'other',
        senderName: 'Lab Department',
        avatar: '',
        text: 'New lab results are available for Aster Mulu (CBC, Lipid Panel) and Samuel Girma (HbA1c). Verified by Lab Tech Lead.',
        time: '08:52 AM',
      },
    ],
  },
  {
    id: 'conv-4',
    type: 'Staff',
    name: 'Nurse Station',
    iconType: 'nurse',
    preview: 'Room 12 is ready for the next patient.',
    time: '08:30 AM',
    messages: [
      {
        id: 'nm1',
        sender: 'other',
        senderName: 'Nurse Station',
        avatar: '',
        text: 'Room 12 is ready for the next patient. Vitals recorded for morning consultations.',
        time: '08:30 AM',
      },
    ],
  },
  {
    id: 'conv-5',
    type: 'Patients',
    name: 'Betlehem Abebe',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    preview: 'The prescription is ready for pickup.',
    time: 'Yesterday',
    patientId: 'PID-001098',
    patientDetails: {
      age: 32,
      gender: 'Female',
      phone: '+251 922 456 789',
      email: 'betlehem.a@email.com',
      address: 'Addis Ababa',
      recentVisitDate: 'Oct 16, 2026',
      recentVisitTime: '10:30 AM',
      recentDepartment: 'Cardiology',
      recentDoctor: 'Dr. Fitsum Alemu',
      note: 'Recovery post prescription completed.',
      noteDate: 'Oct 16, 2026',
    },
    messages: [
      {
        id: 'bm1',
        sender: 'other',
        senderName: 'Betlehem Abebe',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        text: 'Hello doctor, the pharmacy informed me the prescription is ready for pickup.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'conv-6',
    type: 'Patients',
    name: 'Tigist Alemu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    preview: 'Thank you for your support.',
    time: 'Yesterday',
    patientId: 'PID-001045',
    patientDetails: {
      age: 26,
      gender: 'Female',
      phone: '+251 933 567 890',
      email: 'tigist.alemu@email.com',
      address: 'Addis Ababa',
      recentVisitDate: 'Oct 15, 2026',
      recentVisitTime: '02:15 PM',
      recentDepartment: 'Cardiology',
      recentDoctor: 'Dr. Fitsum Alemu',
      note: 'Routine cardiology wellness visit.',
      noteDate: 'Oct 15, 2026',
    },
    messages: [
      {
        id: 'tm1',
        sender: 'other',
        senderName: 'Tigist Alemu',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: 'Thank you for your support during yesterday consultation.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'conv-7',
    type: 'Patients',
    name: 'Getachew Tadesse',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    preview: 'Yes, I will be there tomorrow morning.',
    time: 'Oct 17',
    patientId: 'PID-001076',
    patientDetails: {
      age: 52,
      gender: 'Male',
      phone: '+251 944 678 901',
      email: 'getachew.t@email.com',
      address: 'Addis Ababa',
      recentVisitDate: 'Oct 17, 2026',
      recentVisitTime: '03:45 PM',
      recentDepartment: 'Cardiology',
      recentDoctor: 'Dr. Fitsum Alemu',
      note: 'Hypertension check scheduled.',
      noteDate: 'Oct 17, 2026',
    },
    messages: [
      {
        id: 'gm1',
        sender: 'other',
        senderName: 'Getachew Tadesse',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        text: 'Yes, I will be there tomorrow morning.',
        time: 'Oct 17',
      },
    ],
  },
  {
    id: 'conv-8',
    type: 'Patients',
    name: 'Lidya Kebede',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    preview: 'My blood pressure is better now.',
    time: 'Oct 17',
    hasUnreadDot: true,
    patientId: 'PID-001062',
    patientDetails: {
      age: 39,
      gender: 'Female',
      phone: '+251 955 789 012',
      email: 'lidya.k@email.com',
      address: 'Addis Ababa',
      recentVisitDate: 'Oct 17, 2026',
      recentVisitTime: '11:10 AM',
      recentDepartment: 'Cardiology',
      recentDoctor: 'Dr. Fitsum Alemu',
      note: 'Blood pressure stabilised on beta-blockers.',
      noteDate: 'Oct 17, 2026',
    },
    messages: [
      {
        id: 'lk1',
        sender: 'other',
        senderName: 'Lidya Kebede',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
        text: 'My blood pressure is better now after starting the new dose.',
        time: 'Oct 17',
      },
    ],
  },
  {
    id: 'conv-9',
    type: 'Patients',
    name: 'Daniel Wondimu',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    preview: 'The report looks good. Thank you!',
    time: 'Oct 16',
    patientId: 'PID-001099',
    messages: [
      {
        id: 'dw1',
        sender: 'other',
        senderName: 'Daniel Wondimu',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
        text: 'The report looks good. Thank you!',
        time: 'Oct 16',
      },
    ],
  },
  {
    id: 'conv-10',
    type: 'Patients',
    name: 'Yonas Gebre',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    preview: 'Schedule for next week please.',
    time: 'Oct 15',
    patientId: 'PID-001120',
    messages: [
      {
        id: 'yg1',
        sender: 'other',
        senderName: 'Yonas Gebre',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        text: 'Schedule for next week please.',
        time: 'Oct 15',
      },
    ],
  },
];

export default function DoctorMessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>('conv-1');
  const [activeTab, setActiveTab] = useState<'All' | 'Patients' | 'Staff' | 'System'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Modals & Drawers
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<PatientItem | null>(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const activeConv = conversations.find((c) => c.id === selectedId) ?? conversations[0]!;

  const filteredConversations = conversations.filter((c) => {
    if (activeTab === 'Patients' && c.type !== 'Patients') return false;
    if (activeTab === 'Staff' && c.type !== 'Staff') return false;
    if (activeTab === 'System' && c.type !== 'System') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'doctor',
      senderName: CURRENT_DOCTOR.name,
      avatar: CURRENT_DOCTOR.avatar,
      text: messageInput.trim(),
      time: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedId) {
          return {
            ...c,
            preview: messageInput.trim(),
            time: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setMessageInput('');
  };

  const handleOpenPatientDrawer = () => {
    const patient = INITIAL_PATIENTS.find((p) => p.id === activeConv.patientId) ?? INITIAL_PATIENTS[0]!;
    setSelectedPatientForDrawer(patient);
  };

  const messagesHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Messages</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Communicate with patients, colleagues and staff.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DoctorPageShell header={messagesHeader} mainClassName="!space-y-0">
      {/* 3-Column Layout — fills the shell's scrollable area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full lg:min-h-0">
        {/* ============================================================== */}
        {/* COLUMN 1: CONVERSATION LIST (lg:col-span-3 or 4)               */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[640px] lg:h-full">
          {/* Category Tabs */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('All')}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  activeTab === 'All'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (14)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Patients')}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  activeTab === 'Patients'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patients (10)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Staff')}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  activeTab === 'Staff'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('System')}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  activeTab === 'System'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                System (1)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-2.5">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative ${
                    isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  {/* Left Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />
                  )}

                  {/* Avatar or Icon */}
                  <div className="relative shrink-0">
                    {conv.avatar ? (
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs"
                      />
                    ) : conv.iconType === 'lab' ? (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    {conv.hasUnreadDot && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-blue-900' : 'text-slate-800'
                        }`}
                      >
                        {conv.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                        {conv.preview}
                      </p>
                      {conv.unreadCount && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer count */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center text-[11px] text-slate-400 font-medium">
            Showing 1-{filteredConversations.length} of 14 conversations
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: ACTIVE CHAT CONVERSATION (lg:col-span-5 or 6)        */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 xl:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[640px] lg:h-full">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              {activeConv.avatar ? (
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-800 truncate">{activeConv.name}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {activeConv.patientId ? (
                    <>
                      {activeConv.patientId} • {activeConv.patientDetails?.age ?? 28} years •{' '}
                      {activeConv.patientDetails?.gender ?? 'Female'}
                    </>
                  ) : (
                    'Medical Staff Communication'
                  )}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
            {/* Date Badge */}
            <div className="flex justify-center my-1">
              <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[11px] font-bold shadow-2xs">
                Oct 19, 2026
              </span>
            </div>

            {activeConv.messages.map((msg) => {
              const isMe = msg.sender === 'doctor';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={msg.avatar || activeConv.avatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white shadow-2xs mb-4"
                    />
                  )}

                  <div className={`max-w-[80%] sm:max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div
                      className={`text-[10px] text-slate-400 mt-1 px-1 font-medium ${
                        isMe ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>

                  {isMe && (
                    <img
                      src={msg.avatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white shadow-2xs mb-4"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
          >
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-2xs shadow-blue-500/25 transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: PATIENT DETAILS & QUICK ACTIONS (lg:col-span-3)      */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Patient Details</h3>
              </div>
              <button
                type="button"
                onClick={handleOpenPatientDrawer}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                View Full Profile
              </button>
            </div>

            <div className="pt-3 text-center">
              <div className="relative inline-block mx-auto mb-2">
                <img
                  src={
                    activeConv.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={activeConv.name}
                  className="w-16 h-16 rounded-full object-cover ring-3 ring-blue-100 shadow-2xs mx-auto"
                />
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <h4 className="text-sm font-extrabold text-slate-800">{activeConv.name}</h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {activeConv.patientId ?? 'PID-001024'}
              </p>

              <div className="mt-4 space-y-2 text-left text-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">
                    {activeConv.patientDetails?.age ?? 28} years /{' '}
                    {activeConv.patientDetails?.gender ?? 'Female'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">
                    {activeConv.patientDetails?.phone ?? '+251 912 345 678'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] truncate">
                    {activeConv.patientDetails?.email ?? 'aster.mulu@email.com'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">
                    {activeConv.patientDetails?.address ?? 'Addis Ababa, Ethiopia'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Visit Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-800">
                    {activeConv.patientDetails?.recentVisitDate ?? 'Oct 18, 2026'} •{' '}
                    {activeConv.patientDetails?.recentVisitTime ?? '09:15 AM'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {activeConv.patientDetails?.recentDepartment ?? 'Cardiology'} •{' '}
                    {activeConv.patientDetails?.recentDoctor ?? 'Dr. Fitsum Alemu'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Quick Actions (6 Tiles) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <StickyNote className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={handleOpenPatientDrawer}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  View Medical Record
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRxModalOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <Pill className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  New Prescription
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLabModalOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  View Lab Results
                </span>
              </button>

              <button
                type="button"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Schedule Appointment
                </span>
              </button>

              <button
                type="button"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Send Message
                </span>
              </button>

              <button
                type="button"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Call Patient
                </span>
              </button>
            </div>
          </div>

          {/* Patient Notes Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Patient Notes</h3>
              </div>
              <button
                type="button"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/80 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <StickyNote className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  {activeConv.patientDetails?.note ??
                    'Patient is responding well to medication. No current complaints.'}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5">
                  Dr. Fitsum Alemu • {activeConv.patientDetails?.noteDate ?? 'Oct 18, 2026'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Drawer */}
      <DoctorPatientDrawer
        patient={selectedPatientForDrawer}
        isOpen={Boolean(selectedPatientForDrawer)}
        onClose={() => setSelectedPatientForDrawer(null)}
      />

      {/* Prescriptions Requisition Modal */}
      <DoctorPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        defaultPatientId={activeConv.patientId}
      />

      {/* Lab Order Requisition Modal */}
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={activeConv.patientId}
      />
    </DoctorPageShell>
  );
}
