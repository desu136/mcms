import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
  User,
  FlaskConical,
  Mail,
  MapPin,
  Calendar,
  Share2,
  Pill,
  Loader2,
} from 'lucide-react';
import { PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorReferralModal } from '../../components/doctor/DoctorReferralModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchDoctors } from '../../api/staff';
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

export function MessagesPage() {
  const { user, accessToken } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [livePatients, setLivePatients] = useState<PatientDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'All' | 'Patients' | 'Staff' | 'System'>('All');
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Modals & Drawers
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<PatientItem | null>(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const doctorName = user?.displayName || 'Dr. Physician';
  const doctorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=3b82f6&color=fff`;

  const loadConversations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [patRes, docRes] = await Promise.allSettled([
        fetchPatients(accessToken, { limit: 30 }),
        fetchDoctors(accessToken),
      ]);

      const pats = patRes.status === 'fulfilled' && patRes.value?.data ? patRes.value.data : [];
      const docs = docRes.status === 'fulfilled' && Array.isArray(docRes.value) ? docRes.value : [];
      setLivePatients(pats);

      const convs: ConversationItem[] = [];

      // Patient channels
      pats.forEach((p, idx) => {
        const age = p.dateOfBirth
          ? Math.max(1, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear())
          : 30;
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=e0e7ff&color=3730a3`;

        convs.push({
          id: `pat-${p.id}`,
          type: 'Patients',
          name: p.fullName,
          avatar,
          preview: idx === 0 ? 'Thank you doctor for the prescription follow-up instructions.' : 'Consultation follow-up inquiry.',
          time: 'Today',
          ...(idx === 0 ? { unreadCount: 1, hasUnreadDot: true } : {}),
          patientId: p.pid,
          patientDbId: p.id,
          patientDetails: {
            age,
            gender: (p.gender || '').toLowerCase().startsWith('f') ? 'Female' : 'Male',
            phone: p.phoneNumber || '—',
            email: p.email || '—',
            address: p.address || p.city || 'Addis Ababa, Ethiopia',
            recentVisitDate: 'Recent',
            recentVisitTime: '10:00 AM',
            recentDepartment: 'General OPD',
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
            preview: 'Colleague handover: outpatient referral coordinated.',
            time: 'Yesterday',
            messages: [
              {
                id: `dm-${d.id}`,
                sender: 'other',
                senderName: d.displayName,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.displayName)}&background=3b82f6&color=fff`,
                text: 'Colleague handover: Please check clinical notes for outpatient referrals.',
                time: 'Yesterday',
              },
            ],
          });
        }
      });

      // Laboratory channel
      convs.push({
        id: 'staff-lab',
        type: 'Staff',
        name: 'Central Diagnostic Lab',
        iconType: 'lab',
        preview: 'New laboratory test results are verified and available.',
        time: 'Today',
        messages: [
          {
            id: 'm-lab-1',
            sender: 'other',
            senderName: 'Central Diagnostic Lab',
            avatar: 'https://ui-avatars.com/api/?name=Lab+Team&background=ede9fe&color=6d28d9',
            text: 'Automated notification: Pathology results for outpatient panels are available in your portal.',
            time: '08:00 AM',
          },
        ],
      });

      setConversations(convs);
      if (convs.length > 0) {
        setSelectedId(convs[0]!.id);
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    } finally {
      setLoading(false);
    }
  }, [accessToken, user?.id, doctorName]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    if (!activeConv || !activeConv.patientDbId) return;
    const p = livePatients.find((lp) => lp.id === activeConv.patientDbId);
    if (p) {
      const isFemale = (p.gender || '').toLowerCase().startsWith('f');
      const age = p.dateOfBirth ? Math.max(1, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) : 35;
      setSelectedPatientForDrawer({
        id: p.id,
        name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
        pid: p.pid,
        age,
        gender: isFemale ? 'Female' : 'Male',
        phone: p.phoneNumber || '—',
        email: p.email || '—',
        address: p.address || p.city || 'Addis Ababa, Ethiopia',
        department: 'General OPD',
        lastVisit: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastVisitReason: 'Clinical Messaging Follow-up',
        status: p.status === 'INACTIVE' ? 'Inactive' : 'Active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName || p.firstName)}&size=150&background=dbeafe&color=1e40af`,
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
            Direct communication with patients, colleagues, nursing and pathology staff.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DoctorPageShell header={messagesHeader}>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col md:flex-row h-[780px]">
          {/* COLUMN 1: CONVERSATIONS LIST (320px) */}
          <div className="w-full md:w-80 lg:w-[320px] border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/40">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-200/80 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-200/80 bg-white overflow-x-auto scrollbar-none">
              {(['All', 'Patients', 'Staff', 'System'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading communications...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No conversations found.</div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id)}
                      className={`p-3 flex items-start gap-3 cursor-pointer transition-colors relative ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-100/60'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {conv.iconType === 'lab' ? (
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <FlaskConical className="w-5 h-5" />
                          </div>
                        ) : conv.avatar ? (
                          <img
                            src={conv.avatar}
                            alt={conv.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                            {conv.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {conv.hasUnreadDot && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4
                            className={`text-xs truncate ${
                              conv.hasUnreadDot ? 'font-black text-slate-900' : 'font-bold text-slate-800'
                            }`}
                          >
                            {conv.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">{conv.time}</span>
                        </div>
                        <p
                          className={`text-[11px] truncate ${
                            conv.hasUnreadDot ? 'font-semibold text-slate-800' : 'text-slate-500'
                          }`}
                        >
                          {conv.preview}
                        </p>
                      </div>

                      {/* Unread Pill */}
                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <div className="shrink-0 self-center">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: ACTIVE CHAT THREAD */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-200">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-3 px-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    {activeConv.iconType === 'lab' ? (
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                    ) : (
                      <img
                        src={activeConv.avatar}
                        alt={activeConv.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-slate-900">{activeConv.name}</h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {activeConv.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online • Available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Audio Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                  <div className="text-center my-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      Today
                    </span>
                  </div>

                  {activeConv.messages.map((m) => {
                    const isDoctor = m.sender === 'doctor';
                    return (
                      <div
                        key={m.id}
                        className={`flex items-end gap-2 ${isDoctor ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isDoctor && (
                          <img
                            src={m.avatar}
                            alt={m.senderName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mb-0.5"
                          />
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-2xs ${
                            isDoctor
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{m.text}</p>
                          <div
                            className={`text-[9px] mt-1 text-right font-medium ${
                              isDoctor ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {m.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input Footer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your clinical instruction or response..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a conversation to begin chatting
              </div>
            )}
          </div>

          {/* COLUMN 3: PATIENT SUMMARY PANEL (280px) */}
          <div className="hidden lg:flex w-72 flex-col bg-white shrink-0 p-4 overflow-y-auto">
            {activeConv && activeConv.type === 'Patients' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-black text-slate-900">Patient Profile</h3>
                  </div>
                  <button
                    onClick={handleOpenPatientDrawer}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Chart
                  </button>
                </div>

                <div className="text-center">
                  <img
                    src={activeConv.avatar}
                    alt={activeConv.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100 shadow-2xs mx-auto mb-2"
                  />
                  <h4 className="text-sm font-black text-slate-900">{activeConv.name}</h4>
                  <p className="text-xs font-bold text-blue-600">{activeConv.patientId}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeConv.patientDetails?.age} yrs • {activeConv.patientDetails?.gender}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{activeConv.patientDetails?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] truncate">{activeConv.patientDetails?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] truncate">{activeConv.patientDetails?.address}</span>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setRxModalOpen(true)}
                    className="py-2 px-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-bold text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    Rx
                  </button>
                  <button
                    onClick={() => setLabModalOpen(true)}
                    className="py-2 px-2 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-bold text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    Lab
                  </button>
                  <button
                    onClick={() => setReferralModalOpen(true)}
                    className="py-2 px-2 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-bold text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    Refer
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 mt-12">
                Internal staff channel communication
              </div>
            )}
          </div>
        </div>
      </DoctorPageShell>

      {/* Patient Drawer & Modals */}
      <DoctorPatientDrawer
        patient={selectedPatientForDrawer}
        isOpen={Boolean(selectedPatientForDrawer)}
        onClose={() => setSelectedPatientForDrawer(null)}
        onOpenPrescriptionModal={() => setRxModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
        onOpenReferralModal={() => setReferralModalOpen(true)}
      />
      <DoctorPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        defaultPatientId={activeConv?.patientDbId}
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={activeConv?.patientDbId}
      />
      <DoctorReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        patientId={activeConv?.patientDbId}
        patientName={activeConv?.name}
      />
    </>
  );
}

export default MessagesPage;
