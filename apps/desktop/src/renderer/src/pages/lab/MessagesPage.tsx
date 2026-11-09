import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  AlertTriangle,
  User,
  FlaskConical,
} from 'lucide-react';
import {
  EXACT_CONVERSATIONS,
  ConversationItem,
  ChatMessage,
} from '../../components/lab/messagesMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>(EXACT_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(EXACT_CONVERSATIONS[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'Dawit Tadesse (Lab Tech)',
      senderAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
      text: messageText.trim(),
      time: 'Just now',
      status: 'sent',
    };

    setConversations(
      conversations.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: newMsg.text,
              time: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
    setMessageText('');
  };

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Clinical Communications & Critical Value Dispatch
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Instant messaging with attending physicians, ward nurses, and phlebotomy team.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Sending broadcast notice to all ER & ICU doctors: Lab analyzers operational, normal TAT.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Broadcast Notice</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Total Conversations" value={conversations.length} color="blue" />
      <LabStatCard title="Unread Messages" value={conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} color="cyan" />
      <LabStatCard title="Doctor Consults" value="3" color="emerald" />
      <LabStatCard title="Nurse Queries" value="2" color="amber" />
      <LabStatCard title="Critical Panic Calls" value="1" color="rose" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex h-[62vh]">
        {/* Conversations List (Sidebar) */}
        <div className="w-80 border-r border-slate-200/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search messages, staff, patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-50/70 border-l-4 border-cyan-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">{conv.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{conv.time}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-cyan-700">{conv.roleDetails}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Thread */}
        {activeConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-500/30"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">{activeConv.name}</div>
                  <div className="text-[10px] text-slate-500">{activeConv.roleDetails}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => alert(`Calling ${activeConv.name} on clinic VoIP intercom...`)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Voice Intercom"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeConv.messages.map((m) => {
                const isMe = m.sender === 'user';
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div className="leading-relaxed">{m.text}</div>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isMe ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200/80 flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Type clinical message or critical result update..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </LabPageShell>
  );
}

export default MessagesPage;
