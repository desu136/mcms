import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Phone,
  Paperclip,
  CheckCheck,
  Smile,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import {
  MESSAGES_CONVERSATIONS,
  ChatConversation,
  ACTIVE_CHAT_MESSAGES,
  ChatMessageItem,
} from '../../components/receptionist/receptionistMockData';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface MessagesPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function MessagesPage({ onNavigateTab }: MessagesPageProps) {
  const [filterTab, setFilterTab] = useState<'All' | 'Doctors' | 'Nurses' | 'Lab' | 'Admin'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState<ChatConversation>(MESSAGES_CONVERSATIONS[0]!);
  const [messages, setMessages] = useState<ChatMessageItem[]>(ACTIVE_CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');

  const filtered = MESSAGES_CONVERSATIONS.filter((conv) => {
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputMessage,
      isMe: true,
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
  };

  return (
    <ReceptionistPageShell
      banner={
        <ReceptionistBanner
          title="Internal Clinic Communications"
          subtitle="Direct messaging with attending doctors, triage nurses, lab technicians, and clinic administration."
          icon={MessageSquare}
        />
      }
    >
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col md:flex-row h-[560px]">
        {/* Left: Conversations List */}
        <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
              {(['All', 'Doctors', 'Nurses', 'Lab'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-3 cursor-pointer transition-colors flex items-start gap-2.5 ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {conv.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {conv.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{conv.time}</span>
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium">{conv.role}</div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedConv.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedConv.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {selectedConv.role} • {selectedConv.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.isMe
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder={`Reply to ${selectedConv.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

export default React.memo(MessagesPage);
