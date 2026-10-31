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
} from '../../components/nurse/nurseMockData';
import NursePatientDetailsModal from '../../components/nurse/NursePatientDetailsModal';
import AddNoteModal from '../../components/nurse/AddNoteModal';

export function MessagesPage() {
  const [tab, setTab] = useState<'all' | 'patient' | 'staff'>('all');
  const [search, setSearch] = useState('');
  const [activeConv, setActiveConv] = useState<NurseConversation>(NURSE_CONVERSATIONS[0]!);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

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

  const patientForDetails = NURSE_PATIENTS.find((p) => p.name === activeConv.name) || NURSE_PATIENTS[0]!;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F7FC]">
      {/* ── Left: Conversations List ── */}
      <div className="w-72 xl:w-80 border-r border-gray-200/90 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <h2 className="font-bold text-sm text-gray-900">Clinical Messages</h2>
          </div>
          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {NURSE_CONVERSATIONS.length} Threads
          </span>
        </div>

        <div className="p-2.5 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat or staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1">
            {(['all', 'patient', 'staff'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                  tab === t ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredConvs.map((conv) => {
            const isSelected = activeConv.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/60 border-l-3 border-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={conv.avatar} alt={conv.name} className="w-9 h-9 rounded-full object-cover" />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      conv.isOnline ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-gray-800 truncate">{conv.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{conv.time}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 block">{conv.role}</span>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Middle: Active Chat Window ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat Header */}
        <div className="h-14 px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src={activeConv.avatar} alt={activeConv.name} className="w-8 h-8 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-xs text-gray-800 leading-tight">{activeConv.name}</h3>
              <p className="text-[10px] text-gray-400">
                {activeConv.role} · {activeConv.isOnline ? 'Active Now' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer" title="Call">
              <Phone size={14} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer" title="Video">
              <Video size={14} />
            </button>
          </div>
        </div>

        {/* Message Flow */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40">
          {currentMessages.map((msg) => {
            const isOutgoing = msg.sender === 'nurse';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}
              >
                {!isOutgoing && (
                  <img src={activeConv.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160'} alt={msg.senderName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                )}
                <div
                  className={`max-w-[70%] p-2.5 rounded-2xl text-xs ${
                    isOutgoing
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div
                    className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                      isOutgoing ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isOutgoing && <CheckCheck size={11} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Type message or clinical update..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 text-xs py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* ── Right: Patient Context Sidebar ── */}
      <aside className="w-72 border-l border-gray-200 bg-white p-3 space-y-3 shrink-0 hidden lg:block overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs text-xs">
          <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-500 mb-2">Participant Info</h4>
          <div className="text-center py-2">
            <img src={activeConv.avatar} alt={activeConv.name} className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-blue-100" />
            <h3 className="font-bold text-sm text-gray-900 mt-2">{activeConv.name}</h3>
            <p className="text-[11px] text-gray-400">{activeConv.role}</p>
          </div>
          <div className="pt-2 border-t border-gray-100 space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">Department:</span>
              <span className="font-medium">Cardiology Ward 3A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="font-bold text-emerald-600">{activeConv.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default React.memo(MessagesPage);
