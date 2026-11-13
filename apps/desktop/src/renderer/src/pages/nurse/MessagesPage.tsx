import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  Send,
  User,
  Calendar,
  Clock,
  FileText,
  UserCircle,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { NurseConversation, ChatMessage, NursePatient } from '../../components/nurse/nurseMockData';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchDoctors } from '../../api/staff';

const FALLBACK_CONV: NurseConversation = {
  id: 'conv-triage',
  name: 'Triage Coordination Desk',
  role: 'Nurse',
  category: 'staff',
  avatar: 'https://images.unsplash.com/photo-1594824813575-d143c683b7b2?auto=format&fit=crop&q=80&w=256',
  isOnline: true,
  lastMessage: 'Station online and ready for incoming patients.',
  time: 'Just now',
  unreadCount: 0,
  currentDept: 'Emergency & Triage',
  currentDoctor: 'Staff Coordination',
};

const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-triage': [
    {
      id: 'msg-init-1',
      conversationId: 'conv-triage',
      sender: 'other',
      senderName: 'Clinical Desk',
      text: 'Welcome to Nursing Messages. Patient triage inquiries and doctor consultation handoffs will appear here.',
      time: '08:00 AM',
      read: true,
    },
  ],
};

export function MessagesPage() {
  const { accessToken, user } = useAuth();
  const [tab, setTab] = useState<'all' | 'patient' | 'staff'>('all');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<NurseConversation[]>([FALLBACK_CONV]);
  const [activeConv, setActiveConv] = useState<NurseConversation>(FALLBACK_CONV);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDirectory = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [patRes, docRes] = await Promise.allSettled([
        fetchPatients(accessToken, { limit: 20 }),
        fetchDoctors(accessToken),
      ]);

      const convList: NurseConversation[] = [];

      if (patRes.status === 'fulfilled' && patRes.value.data) {
        patRes.value.data.forEach((p) => {
          const name = p.fullName || `${p.firstName} ${p.lastName}`.trim();
          convList.push({
            id: `conv-p-${p.id}`,
            name,
            role: 'Patient',
            category: 'patient',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            isOnline: true,
            lastMessage: `Checked in for assessment. PID: ${p.pid}`,
            time: 'Active',
            unreadCount: 0,
            currentDept: 'General Nursing & Triage',
            currentDoctor: 'Attending Physician',
          });
        });
      }

      if (docRes.status === 'fulfilled' && Array.isArray(docRes.value)) {
        docRes.value.forEach((d) => {
          const name = d.displayName;
          convList.push({
            id: `conv-d-${d.id}`,
            name,
            role: 'Doctor',
            category: 'staff',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            isOnline: true,
            lastMessage: `Consultation on call for ${d.departmentName || 'Clinic'}.`,
            time: 'Available',
            unreadCount: 0,
            currentDept: d.departmentName || 'Clinical OPD',
            currentDoctor: name,
          });
        });
      }

      if (convList.length > 0) {
        setConversations(convList);
        setActiveConv((prev) => {
          const found = convList.find((c) => c.id === prev.id);
          return found || convList[0]!;
        });
      }
    } catch (e) {
      console.error('Failed to load message directory:', e);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const filteredConvs = useMemo(() => {
    return conversations.filter((c) => {
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
  }, [conversations, tab, search]);

  const currentMessages = chatMessages[activeConv.id] || [
    {
      id: `msg-auto-${activeConv.id}`,
      conversationId: activeConv.id,
      sender: 'other',
      senderName: activeConv.name,
      text: `Hello, this is ${activeConv.name}. Handover and telemetry notes for this encounter will be synchronized here.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    },
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const nurseName = user?.displayName || 'Staff Nurse';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConv.id,
      sender: 'nurse',
      senderName: nurseName,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || currentMessages), newMsg],
    }));
    setInputText('');
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F7FC]">
      {/* ── Left: Conversations List ── */}
      <div className="w-72 xl:w-80 border-r border-gray-200/90 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <h2 className="font-bold text-sm text-gray-900">Clinical Messages</h2>
          </div>
          <button
            onClick={() => void loadDirectory()}
            disabled={loading}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>

        <div className="p-2.5 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat, doctor or patient..."
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
                {activeConv.role} · {activeConv.currentDept || 'Ward Triage'}
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
                  <img src={activeConv.avatar} alt={msg.senderName} className="w-6 h-6 rounded-full object-cover shrink-0" />
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

      {/* ── Right: Participant Context Sidebar ── */}
      <aside className="w-72 border-l border-gray-200 bg-white p-3 space-y-3 shrink-0 hidden lg:block overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs text-xs">
          <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-500 mb-2">Participant Details</h4>
          <div className="text-center py-2">
            <img src={activeConv.avatar} alt={activeConv.name} className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-blue-100" />
            <h3 className="font-bold text-sm text-gray-900 mt-2">{activeConv.name}</h3>
            <p className="text-[11px] text-gray-400">{activeConv.role}</p>
          </div>
          <div className="pt-2 border-t border-gray-100 space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">Department:</span>
              <span className="font-medium">{activeConv.currentDept || 'Ward Triage'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Category:</span>
              <span className="font-semibold capitalize text-blue-600">{activeConv.category}</span>
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
