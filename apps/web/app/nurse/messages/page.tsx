'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  User,
  Calendar,
  Clock,
  FileText,
  UserCircle,
  Plus,
  Check,
  CheckCheck,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  NURSE_CONVERSATIONS,
  NurseConversation,
  INITIAL_CHAT_MESSAGES,
  ChatMessage,
  NURSE_PATIENTS,
} from '@/components/nurse/nurseMockData';
import NursePatientDetailsModal from '@/components/nurse/NursePatientDetailsModal';
import AddNoteModal from '@/components/nurse/AddNoteModal';

export default function NurseMessagesPage() {
  const [tab, setTab] = useState<'all' | 'patient' | 'staff'>('all');
  const [search, setSearch] = useState('');
  const [activeConv, setActiveConv] = useState<NurseConversation>(NURSE_CONVERSATIONS[0]!);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Filter conversations
  const filteredConvs = NURSE_CONVERSATIONS.filter((c) => {
    if (tab === 'patient' && c.category !== 'patient') return false;
    if (tab === 'staff' && c.category !== 'staff') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentMessages = chatMessages[activeConv.id] || [];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConv.id,
      sender: 'nurse',
      senderName: 'Aster Mulu (Nurse)',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), newMsg],
    }));
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const matchedPatient = NURSE_PATIENTS.find((p) => p.name === activeConv.name) || NURSE_PATIENTS[0]!;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4F7FC] overflow-hidden">
      {/* Page Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 bg-white flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Messages</h1>
            <p className="text-xs text-slate-500">
              Communicate with patients, doctors, and clinic staff.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (filteredConvs[1]) setActiveConv(filteredConvs[1]);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus size={15} />
          <span>New Message</span>
        </button>
      </div>

      {/* 3-Column Messenger Body */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Column 1: Conversations List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 bg-white flex flex-col min-h-0 shrink-0">
          {/* Tabs */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-1 bg-slate-50/60">
            <button
              onClick={() => setTab('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All (12)
            </button>
            <button
              onClick={() => setTab('patient')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'patient'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Patients (8)
            </button>
            <button
              onClick={() => setTab('staff')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'staff'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Staff (4)
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConvs.map((conv) => {
              const isActive = activeConv.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                    isActive ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.avatar ? (
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {conv.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {conv.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">
                      {conv.role}
                    </p>
                    <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                  </div>

                  {conv.unreadCount && (
                    <span className="shrink-0 w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs mt-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Active Conversation Thread */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
          {/* Active Chat Header */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                {activeConv.avatar ? (
                  <img
                    src={activeConv.avatar}
                    alt={activeConv.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {activeConv.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {activeConv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{activeConv.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{activeConv.role}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 hover:text-blue-600 transition-colors"
                title="Voice Call"
              >
                <Phone size={16} />
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 hover:text-blue-600 transition-colors"
                title="Video Call"
              >
                <Video size={17} />
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                title="More Options"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Date divider */}
            <div className="flex items-center justify-center my-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 bg-slate-200/70 uppercase tracking-wider">
                Oct 19, 2026
              </span>
            </div>

            {currentMessages.map((msg) => {
              const isNurse = msg.sender === 'nurse';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isNurse ? 'justify-end' : 'justify-start'}`}
                >
                  {!isNurse && (
                    <img
                      src={activeConv.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160'}
                      alt={activeConv.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white mb-1"
                    />
                  )}

                  <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isNurse ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isNurse
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div
                      className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${
                        isNurse ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isNurse && <CheckCheck size={13} className="text-blue-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Composer Input Bar */}
          <div className="p-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0">
            <button
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />

            <button
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Insert Emoji"
            >
              <Smile size={18} />
            </button>

            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Column 3: Patient Information Details Panel */}
        <aside className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-slate-200/80 bg-white p-4 space-y-5 overflow-y-auto shrink-0">
          {/* Patient Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Patient Information
              </h3>
              <button
                onClick={() => setDetailsModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View Full Profile
              </button>
            </div>

            <div className="flex flex-col items-center text-center p-3 bg-slate-50/70 rounded-2xl border border-slate-200/70">
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-xs mb-2 bg-slate-100">
                <img
                  src={activeConv.avatar || matchedPatient.avatar}
                  alt={activeConv.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{activeConv.name}</h4>
              <p className="text-xs text-slate-500 font-mono">
                {activeConv.pid || 'PID-001024'} • {activeConv.age || 28} years • {activeConv.gender || 'Female'}
              </p>
              <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Active
              </span>

              <div className="w-full border-t border-slate-200/60 my-2.5" />
              <div className="w-full text-left space-y-1 text-xs text-slate-600">
                <p className="truncate">{activeConv.phone || '+251 912 345 678'}</p>
                <p className="truncate">{activeConv.email || 'aster.mulu@email.com'}</p>
                <p className="truncate">{activeConv.address || 'Addis Ababa, Ethiopia'}</p>
              </div>
            </div>
          </div>

          {/* Current Visit */}
          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 text-xs space-y-1">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
              Current Visit
            </h4>
            <p className="font-semibold text-slate-900">
              {activeConv.currentRoom || 'Room 3A-01'} • Oct 19, 2026
            </p>
            <p className="text-slate-500">
              {activeConv.currentDept || 'Cardiology'} • {activeConv.currentDoctor || 'Dr. Fitsum Alemu'}
            </p>
          </div>

          {/* Recent Visits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Recent Visits
              </h4>
              <span className="font-semibold text-blue-600 cursor-pointer hover:underline text-[11px]">
                View All
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Oct 19, 2026</p>
                  <p className="text-[11px] text-slate-500">Cardiology • Room 3A-01</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Current
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="font-bold text-slate-900">Oct 12, 2026</p>
                <p className="text-[11px] text-slate-500">Internal Medicine • Room 5B-02</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="font-bold text-slate-900">Oct 05, 2026</p>
                <p className="text-[11px] text-slate-500">General Checkup • Room 2A-03</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setDetailsModalOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors flex flex-col items-center justify-center text-center gap-1 shadow-2xs"
              >
                <UserCircle size={16} className="text-blue-600" />
                <span className="font-semibold leading-tight">View Patient Record</span>
              </button>

              <button
                onClick={() => setNoteModalOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors flex flex-col items-center justify-center text-center gap-1 shadow-2xs"
              >
                <FileText size={16} className="text-emerald-600" />
                <span className="font-semibold leading-tight">Add Patient Note</span>
              </button>

              <button
                onClick={() => setDetailsModalOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors flex flex-col items-center justify-center text-center gap-1 shadow-2xs"
              >
                <Calendar size={16} className="text-purple-600" />
                <span className="font-semibold leading-tight">Schedule Follow-up</span>
              </button>

              <button
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder="Type a message..."]');
                  input?.focus();
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors flex flex-col items-center justify-center text-center gap-1 shadow-2xs"
              >
                <Send size={16} className="text-indigo-600" />
                <span className="font-semibold leading-tight">Send Message</span>
              </button>
            </div>
          </div>

          {/* Patient Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Patient Notes
              </h4>
              <span className="font-semibold text-blue-600 cursor-pointer hover:underline text-[11px]">
                View All
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
              <p className="font-bold text-slate-900 text-[11px]">
                Oct 19, 2026 • Aster Mulu (Nurse)
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Patient reported mild dizziness. Advised to take medication after meals and increase water intake.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Patient Details Modal */}
      <NursePatientDetailsModal
        patient={matchedPatient}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Add Clinical Note Modal */}
      <AddNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        selectedPatientId={matchedPatient.id}
      />
    </div>
  );
}
