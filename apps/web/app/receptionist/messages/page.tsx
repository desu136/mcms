'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  Download,
  PhoneCall,
  FileUp,
} from 'lucide-react';
import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import {
  MESSAGES_CONVERSATIONS,
  ChatConversation,
  ACTIVE_CHAT_MESSAGES,
  ChatMessageItem,
  SHARED_FILES_LIST,
} from '../../../components/receptionist/receptionistMockData';

export default function ReceptionistMessagesPage() {
  const [filterTab, setFilterTab] = useState<'All' | 'Doctors' | 'Nurses' | 'Lab' | 'Admin'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState<ChatConversation>(MESSAGES_CONVERSATIONS[0]!);
  const [messages, setMessages] = useState<ChatMessageItem[]>(ACTIVE_CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');

  const filteredConversations = MESSAGES_CONVERSATIONS.filter((conv) => {
    const matchesFilter = filterTab === 'All' || conv.category === filterTab;
    const matchesSearch =
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'Selamawit Alemu',
      time: '10:32 AM',
      text: inputMessage,
      isMe: true,
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
  };

  return (
    <div className="h-full overflow-hidden flex flex-col p-4 sm:p-6 gap-4">
      {/* ─── Top Banner ─── */}
      <ReceptionistBanner
        title="Messages"
        subtitle="Communicate with doctors, nurses, laboratory staff and clinic administrators."
        icon={MessageSquare}
        actionElement={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Message
          </button>
        }
      />

      {/* ─── 3 Column Messaging Grid ─── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ─── LEFT COLUMN: Conversations List (3.5 cols) ─── */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'All', label: 'All', count: 3 },
                { id: 'Doctors', label: 'Doctors' },
                { id: 'Nurses', label: 'Nurses' },
                { id: 'Lab', label: 'Lab' },
                { id: 'Admin', label: 'Admin' },
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                    {tab.count ? ` ${tab.count}` : ''}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-slate-100 pr-1">
              {filteredConversations.map((conv) => {
                const isSelected = selectedConv.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors pt-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      {conv.status === 'Online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {conv.time}
                        </span>
                      </div>
                      <div className="text-[10px] text-blue-600 font-semibold truncate">
                        {conv.role}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unreadCount && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 self-center shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── MIDDLE COLUMN: Chat Window (5 cols) ─── */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedConv.avatar}
                  alt={selectedConv.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {selectedConv.name}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {selectedConv.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {!msg.isMe && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedConv.avatar}
                      alt={msg.sender}
                      className="w-6 h-6 rounded-full object-cover mb-1 shrink-0"
                    />
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                  <span>{msg.time}</span>
                  {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 bg-white">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs focus:outline-hidden text-slate-800"
              />
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Insert emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all shrink-0"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ─── RIGHT COLUMN: Contact Info & Quick Actions & Shared Files (3.5 cols) ─── */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-center">
            <div className="text-left text-xs font-bold text-slate-800 mb-2">
              Contact Information
            </div>

            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedConv.avatar}
                alt={selectedConv.name}
                className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-blue-500/20"
              />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900">{selectedConv.name}</div>
              <div className="text-[11px] text-slate-500">{selectedConv.role}</div>
            </div>

            <div className="pt-2 text-left space-y-1.5 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedConv.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{selectedConv.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-emerald-600 font-semibold">{selectedConv.status}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-800 mb-1">Quick Actions</div>

            <button
              type="button"
              className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>View Profile</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>Call (Internal)</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <FileUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Send File</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Schedule Meeting</span>
            </button>
          </div>

          {/* Shared Files */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Shared Files</span>
              <span className="text-[11px] font-bold text-blue-600 cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="space-y-2">
              {SHARED_FILES_LIST.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-800 text-[11px] truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{file.size} • {file.date}</div>
                    </div>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-blue-600 rounded">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Details */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <div className="text-xs font-bold text-slate-800 mb-1">Conversation Details</div>

            <div className="flex justify-between text-slate-500">
              <span>Messages</span>
              <span className="font-bold text-slate-800">12</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Last Message</span>
              <span className="font-medium text-slate-800">Oct 19, 2026 10:30 AM</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Conversation Type</span>
              <span className="font-semibold text-blue-600">Clinical Discussion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
