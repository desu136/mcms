'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Calendar,
  Plus,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  User,
  ShieldCheck,
  FileText,
  Printer,
  CalendarDays,
  FileEdit,
  FlaskConical,
  Barcode,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  UserCheck,
  Activity,
  Building2,
  Users,
} from 'lucide-react';
import {
  EXACT_CONVERSATIONS,
  ConversationItem,
  ChatMessage,
} from '../../../components/lab/messagesMockData';

type FilterCategory = 'All' | 'Patients' | 'Doctors' | 'Nurses' | 'Lab Staff' | 'Pharmacy';

export default function LabMessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>(EXACT_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0]!;

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeCategory === 'Patients' && c.role !== 'Patient') return false;
    if (activeCategory === 'Doctors' && c.role !== 'Doctor') return false;
    if (activeCategory === 'Nurses' && c.role !== 'Nurse') return false;
    if (activeCategory === 'Lab Staff' && c.role !== 'Lab Staff') return false;
    if (activeCategory === 'Pharmacy' && c.role !== 'Pharmacy') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.roleDetails.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'Dawit Tadesse',
      senderAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConvId) {
          return {
            ...c,
            lastMessage: newMsg.text,
            time: newMsg.time,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText('');
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4 bg-[#F4F7FB]">
      {/* 1. Page Header matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle with MessageSquare Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <MessageSquare className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Messages
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Communicate with patients, doctors, nurses and your team.
            </p>
          </div>
        </div>

        {/* Date Selector & + New Message */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">{calendarDate}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Tuesday</div>
            </div>
            <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setCalendarDate('Oct 18, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCalendarDate('Oct 20, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsNewMessageModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Message</span>
          </button>
        </div>
      </div>

      {/* 2. Three-Pane Messages Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1 min-h-[720px]">
        {/* ================= PANE 1: LEFT CONVERSATION LIST (3 cols) ================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 flex flex-col h-[740px]">
          {/* Category Filter Pills */}
          <div className="space-y-1.5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveCategory('All')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategory === 'All'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All</span>
                <span className={activeCategory === 'All' ? 'text-white' : 'text-slate-500'}>12</span>
              </button>

              <button
                onClick={() => setActiveCategory('Patients')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategory === 'Patients'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Patients</span>
                <span className={activeCategory === 'Patients' ? 'text-white' : 'text-slate-500'}>5</span>
              </button>

              <button
                onClick={() => setActiveCategory('Doctors')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategory === 'Doctors'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Doctors</span>
                <span className={activeCategory === 'Doctors' ? 'text-white' : 'text-slate-500'}>3</span>
              </button>

              <button
                onClick={() => setActiveCategory('Nurses')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategory === 'Nurses'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Nurses</span>
                <span className={activeCategory === 'Nurses' ? 'text-white' : 'text-slate-500'}>2</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveCategory('Lab Staff')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategory === 'Lab Staff'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Lab Staff</span>
                <span className={activeCategory === 'Lab Staff' ? 'text-white' : 'text-slate-500'}>1</span>
              </button>

              <button
                onClick={() => setActiveCategory('Pharmacy')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCategory === 'Pharmacy'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Pharmacy</span>
                <span className={activeCategory === 'Pharmacy' ? 'text-white' : 'text-slate-500'}>1</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative my-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Conversations List Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-2.5 rounded-xl transition cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-50/70 border border-blue-200/80'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-800 text-xs truncate">
                          {conv.name}
                        </span>
                        {conv.isOnline && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {conv.time}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {conv.roleDetails}
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-slate-400 truncate flex-1 pr-2">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= PANE 2: CENTER ACTIVE CHAT (6 cols) ================= */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[740px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {activeConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">{activeConversation.name}</span>
                  {activeConversation.isOnline && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{activeConversation.roleDetails}</span>
                  <button
                    onClick={() => showToast(`Opening details for ${activeConversation.name}`)}
                    className="text-blue-600 font-semibold hover:underline text-[11px]"
                  >
                    View Patient Info
                  </button>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast(`Starting voice call with ${activeConversation.name}...`)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
                title="Voice Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => showToast(`Starting video consultation with ${activeConversation.name}...`)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-blue-50 text-blue-600 flex items-center justify-center transition"
                title="Video Call"
              >
                <Video className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => showToast('Conversation options')}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
                title="More"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFBFD]">
            {/* Date Badge */}
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[11px]">
                Oct 19, 2026
              </span>
            </div>

            {/* Message Bubbles */}
            {activeConversation.messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-50 text-slate-800 border border-blue-100 rounded-tr-xs'
                        : 'bg-white text-slate-700 border border-slate-200/90 shadow-2xs rounded-tl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`flex items-center gap-1.5 mt-1 text-[10px] ${
                        isUser ? 'justify-end text-blue-500' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Attach file or lab image')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                title="Attach"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={() => showToast('Choose emoji')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                title="Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition active:scale-[0.98]"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Buttons under input matching screenshot */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => showToast('Selected quick reply template')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-semibold transition"
              >
                <MessageSquare className="w-3 h-3 text-blue-600" />
                <span>Quick Reply</span>
              </button>

              <button
                onClick={() => showToast(`Opening patient records for ${activeConversation.name}...`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-semibold transition"
              >
                <FileText className="w-3 h-3 text-blue-600" />
                <span>View Patient Record</span>
              </button>

              <button
                onClick={() => showToast('Opening add clinical note dialog...')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-semibold transition"
              >
                <FileEdit className="w-3 h-3 text-blue-600" />
                <span>Add Note</span>
              </button>

              <button
                onClick={() => showToast('More message actions')}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 text-xs transition"
              >
                •••
              </button>
            </div>
          </div>
        </div>

        {/* ================= PANE 3: RIGHT PATIENT INFO & ACTIONS (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Patient Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  className="w-16 h-16 rounded-full object-cover ring-3 ring-blue-500/20"
                />
                {activeConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <h3 className="font-extrabold text-slate-800 text-sm">{activeConversation.name}</h3>
                {activeConversation.isOnline && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-500">
                  {activeConversation.patientInfo?.patientId || 'PID-001024'}
                </span>
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {activeConversation.patientInfo?.status || 'Active'}
                </span>
              </div>

              <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 text-left w-full border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-[11px] font-medium">
                    {activeConversation.patientInfo?.ageDob || '28 years (Mar 15, 1996)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-[11px] font-medium">
                    {activeConversation.patientInfo?.phone || '+251 912 345 678'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-[11px] font-medium">
                    {activeConversation.patientInfo?.address || 'Addis Ababa, Ethiopia'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => showToast(`Navigating to full profile for ${activeConversation.name}...`)}
                className="w-full mt-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-blue-600 font-bold text-xs transition"
              >
                View Full Profile
              </button>
            </div>
          </div>

          {/* Card 2: Current Visit */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Current Visit</span>
            </div>

            <div className="pt-3 space-y-2 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Visit ID</span>
                <span className="font-bold text-slate-800">
                  {activeConversation.patientInfo?.currentVisit.visitId || 'VIS-2026-1045'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-semibold text-slate-700">
                  {activeConversation.patientInfo?.currentVisit.department || 'Hematology'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Admitted</span>
                <span className="font-semibold text-slate-700">
                  {activeConversation.patientInfo?.currentVisit.admitted || 'Oct 19, 2026 08:20 AM'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Attending Doctor</span>
                <span className="font-bold text-blue-600">
                  {activeConversation.patientInfo?.currentVisit.attendingDoctor || 'Dr. Tesfaye Alemu'}
                </span>
              </div>
              <div className="pt-1 flex justify-center">
                <span className="inline-flex px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {activeConversation.patientInfo?.currentVisit.status || 'In Progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions (2x3 Grid) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Quick Actions</span>
            </div>

            <div className="pt-3 grid grid-cols-2 gap-2 text-center">
              {/* 1. View Patient Record */}
              <button
                onClick={() => showToast(`Opening patient records...`)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <UserCheck className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  View Patient Record
                </span>
              </button>

              {/* 2. Add Note */}
              <button
                onClick={() => showToast('Opening note editor...')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <FileEdit className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Add Note
                </span>
              </button>

              {/* 3. Schedule Follow-up */}
              <button
                onClick={() => showToast('Scheduling follow up consultation...')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <CalendarDays className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Schedule Follow-up
                </span>
              </button>

              {/* 4. Print Report */}
              <button
                onClick={() => showToast('Printing patient lab report...')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <Printer className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Print Report
                </span>
              </button>

              {/* 5. Print Label */}
              <button
                onClick={() => showToast('Printing specimen tube barcode label...')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <Barcode className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Print Label
                </span>
              </button>

              {/* 6. View Test Results */}
              <button
                onClick={() => showToast('Navigating to test results view...')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <FlaskConical className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  View Test Results
                </span>
              </button>
            </div>
          </div>

          {/* Card 4: Patient Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Patient Notes</span>
              </div>
              <button
                onClick={() => showToast('Opening all patient clinical notes...')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="pt-3 space-y-3">
              {(activeConversation.patientInfo?.notes || []).map((note, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">{note.date} {note.time}</span>
                    <span className="font-semibold text-blue-600">{note.author}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Start New Conversation</h3>
              </div>
              <button
                onClick={() => setIsNewMessageModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Recipient</label>
                <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option>Aster Mulu (Patient)</option>
                  <option>Dr. Tesfaye Alemu (Doctor)</option>
                  <option>Selamawit Getachew (Nurse)</option>
                  <option>Lab Team (Laboratory)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Message</label>
                <textarea
                  rows={3}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setIsNewMessageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsNewMessageModalOpen(false);
                  showToast('Message sent successfully.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

