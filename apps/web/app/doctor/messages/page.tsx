'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  User,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  ChevronRight,
  StickyNote,
} from 'lucide-react';
import { PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchPatients } from '../../../lib/api/patients';
import { fetchDoctors } from '../../../lib/api/staff';
import type { PatientDTO, DoctorDTO } from '@mcms/contracts';

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
  patientDbId?: string;
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

export default function DoctorMessagesPage() {
  const { user, accessToken } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'All' | 'Patients' | 'Staff' | 'System'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [livePatients, setLivePatients] = useState<PatientDTO[]>([]);

  // Modals & Drawers
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<PatientItem | null>(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const doctorName = user?.displayName ? (user.displayName.startsWith('Dr.') ? user.displayName : `Dr. ${user.displayName}`) : 'Doctor';
  const doctorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=0284c7&color=fff&rounded=true&bold=true`;

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [patRes, docRes] = await Promise.allSettled([
        fetchPatients(accessToken, { limit: 30 }),
        fetchDoctors(accessToken),
      ]);

      const pats = patRes.status === 'fulfilled' ? patRes.value.data : [];
      const docs = docRes.status === 'fulfilled' ? docRes.value : [];
      setLivePatients(pats);

      const convs: ConversationItem[] = [];

      // Patient Conversations
      pats.forEach((p, idx) => {
        const age = p.dateOfBirth
          ? Math.max(0, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear())
          : 30;
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.fullName)}`;

        convs.push({
          id: `pat-${p.id}`,
          type: 'Patients',
          name: p.fullName,
          avatar,
          preview: idx === 0 ? 'Thank you doctor for the prescription follow up.' : 'Looking forward to the next consultation slot.',
          time: 'Today',
          ...(idx === 0 ? { unreadCount: 1, hasUnreadDot: true } : {}),
          patientId: p.pid,
          patientDbId: p.id,
          patientDetails: {
            age,
            gender: p.gender === 'FEMALE' ? 'Female' : 'Male',
            phone: p.phoneNumber || '—',
            email: p.email || '—',
            address: p.address || 'Addis Ababa, Ethiopia',
            recentVisitDate: 'Recent',
            recentVisitTime: '10:00 AM',
            recentDepartment: 'General Practice',
            recentDoctor: doctorName,
            note: 'Active clinical patient chart.',
            noteDate: 'Today',
          },
          messages: [
            {
              id: `m-init-${p.id}`,
              sender: 'other',
              senderName: p.fullName,
              avatar,
              text: `Hello ${doctorName}, I have a question regarding my medication dosage and instructions.`,
              time: '09:30 AM',
            },
          ],
        });
      });

      // Staff channels
      docs.forEach((d) => {
        if (d.id !== user?.id) {
          convs.push({
            id: `doc-${d.id}`,
            type: 'Staff',
            name: `${d.displayName} (${d.specialty || 'Physician'})`,
            iconType: 'nurse',
            preview: 'Patient transfer and department handover coordinated.',
            time: 'Yesterday',
            messages: [
              {
                id: `dm-${d.id}`,
                sender: 'other',
                senderName: d.displayName,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.displayName)}&background=3b82f6&color=fff`,
                text: `Colleague handover: Please check clinical notes for outpatient referrals.`,
                time: 'Yesterday',
              },
            ],
          });
        }
      });

      // Diagnostic Lab channel
      convs.push({
        id: 'staff-lab',
        type: 'Staff',
        name: 'Central Diagnostic Lab',
        iconType: 'lab',
        preview: 'New laboratory test results are verified and available.',
        time: '08:45 AM',
        unreadCount: 1,
        messages: [
          {
            id: 'lm1',
            sender: 'other',
            senderName: 'Central Diagnostic Lab',
            avatar: '',
            text: 'Automated notification: Lab results processed and ready for attending physician review.',
            time: '08:45 AM',
          },
        ],
      });

      // System channel
      convs.push({
        id: 'sys-alerts',
        type: 'System',
        name: 'MCMS Clinical Alerts',
        iconType: 'system',
        preview: 'System online. EHR synchronization running smoothly.',
        time: 'Today',
        messages: [
          {
            id: 'sys-1',
            sender: 'other',
            senderName: 'MCMS System',
            avatar: '',
            text: 'Doctor workstation initialized with real-time EMR and queue synchronization.',
            time: 'Today',
          },
        ],
      });

      setConversations(convs);
      if (convs.length > 0) {
        setSelectedId(convs[0]!.id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, doctorName, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0] || null;

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
    if (!messageInput.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'doctor',
      senderName: doctorName,
      avatar: doctorAvatar,
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
    if (!activeConv) return;
    const matched = livePatients.find(
      (p) => p.id === activeConv.patientDbId || p.pid === activeConv.patientId
    );

    if (matched) {
      const age = matched.dateOfBirth
        ? Math.max(0, new Date().getFullYear() - new Date(matched.dateOfBirth).getFullYear())
        : 30;
      setSelectedPatientForDrawer({
        id: matched.id,
        name: matched.fullName || `${matched.firstName} ${matched.lastName}`.trim(),
        pid: matched.pid,
        age,
        gender: matched.gender === 'FEMALE' ? 'Female' : 'Male',
        phone: matched.phoneNumber || '—',
        email: matched.email || '—',
        address: matched.address || 'Addis Ababa, Ethiopia',
        department: 'General Practice',
        lastVisit: 'Recent',
        lastVisitReason: 'Clinical Checkup',
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(matched.fullName)}`,
        totalVisits: 1,
        conditions: [],
      });
    } else if (activeConv.patientDetails) {
      setSelectedPatientForDrawer({
        id: activeConv.patientDbId || activeConv.patientId || 'patient-1',
        name: activeConv.name,
        pid: activeConv.patientId || 'PID-000000',
        age: activeConv.patientDetails.age,
        gender: activeConv.patientDetails.gender as any,
        phone: activeConv.patientDetails.phone,
        email: activeConv.patientDetails.email,
        address: activeConv.patientDetails.address,
        department: activeConv.patientDetails.recentDepartment,
        lastVisit: activeConv.patientDetails.recentVisitDate,
        lastVisitReason: 'Consultation',
        status: 'Active',
        avatar: activeConv.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeConv.name)}`,
        totalVisits: 1,
        conditions: [],
      });
    }
  };

  const messagesHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Clinical Messages</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Communicate securely with clinical departments, attending staff, and patients.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DoctorPageShell header={messagesHeader} mainClassName="!space-y-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full lg:min-h-0">
        {/* COLUMN 1: CONVERSATION LIST */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[640px] lg:h-full">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
              {(['All', 'Patients', 'Staff', 'System'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative mt-2.5">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading conversation channels...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No active conversations found.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative cursor-pointer ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />
                    )}

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
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: ACTIVE CHAT THREAD */}
        {activeConv ? (
          <div className="lg:col-span-8 xl:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[640px] lg:h-full overflow-hidden">
            <div className="p-3.5 sm:px-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                {activeConv.avatar ? (
                  <img
                    src={activeConv.avatar}
                    alt={activeConv.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-800 truncate">{activeConv.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {activeConv.patientId ? (
                      <>
                        {activeConv.patientId} • {activeConv.patientDetails?.age ?? 30} yrs •{' '}
                        {activeConv.patientDetails?.gender ?? 'Patient'}
                      </>
                    ) : (
                      'Clinical Communication Channel'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {activeConv.patientDbId && (
                  <button
                    type="button"
                    onClick={handleOpenPatientDrawer}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open Chart
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
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
                      <div className={`text-[10px] text-slate-400 mt-1 px-1 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your clinical response or instructions..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : null}

        {/* COLUMN 3: PATIENT / CHANNEL SNAPSHOT */}
        {activeConv?.patientDetails && (
          <div className="hidden xl:block xl:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">Patient Details</h3>
                <button
                  type="button"
                  onClick={handleOpenPatientDrawer}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View Full EMR
                </button>
              </div>

              <div className="pt-3 text-center">
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  className="w-16 h-16 rounded-full object-cover ring-3 ring-blue-100 shadow-2xs mx-auto mb-2"
                />
                <h4 className="text-sm font-extrabold text-slate-800">{activeConv.name}</h4>
                <p className="text-[11px] font-semibold text-blue-600">{activeConv.patientId}</p>

                <div className="mt-4 space-y-2 text-left text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{activeConv.patientDetails.age} years / {activeConv.patientDetails.gender}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{activeConv.patientDetails.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] truncate">{activeConv.patientDetails.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{activeConv.patientDetails.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <StickyNote className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Quick Clinical Actions</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setRxModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                >
                  <Pill className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700">Prescribe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLabModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-orange-500 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700">Order Lab</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DoctorPatientDrawer
        patient={selectedPatientForDrawer}
        isOpen={Boolean(selectedPatientForDrawer)}
        onClose={() => setSelectedPatientForDrawer(null)}
        onOpenPrescriptionModal={() => setRxModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />

      <DoctorPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        patientId={activeConv?.patientDbId}
        patientName={activeConv?.name}
      />

      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        patientId={activeConv?.patientDbId}
        patientName={activeConv?.name}
      />
    </DoctorPageShell>
  );
}
