import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar, CreditCard, Clock, ArrowRight } from 'lucide-react';
import { ReceptionistTab } from './ReceptionistSidebar';

interface ReceptionistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ReceptionistTab) => void;
}

const SEARCH_MOCK_RESULTS = [
  {
    type: 'patient',
    title: 'Aster Mulu',
    subtitle: 'PID: P-2026-001245 • +251 912 345 678 • General OPD',
    tab: 'queue' as ReceptionistTab,
    tag: 'In Consultation',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'patient',
    title: 'Tesfaye Worku',
    subtitle: 'PID: P-2026-001244 • +251 911 222 333 • Internal Medicine',
    tab: 'queue' as ReceptionistTab,
    tag: 'Waiting (18 min)',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    type: 'appointment',
    title: 'Appointment: Meron Hailu',
    subtitle: 'Dr. Michael Chen • 10:30 AM • Follow-up',
    tab: 'appointments' as ReceptionistTab,
    tag: 'Scheduled',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    type: 'bill',
    title: 'Invoice: INV-2026-0089',
    subtitle: 'ETB 1,420.00 • Paid • Oct 19, 2026',
    tab: 'billing' as ReceptionistTab,
    tag: 'Paid',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    type: 'registration',
    title: 'Register New Patient',
    subtitle: 'Quick intake form and national ID verification',
    tab: 'registration' as ReceptionistTab,
    tag: 'Action',
    tagColor: 'bg-blue-600 text-white',
  },
];

function ReceptionistSearchModal({
  isOpen,
  onClose,
  onNavigateTab,
}: ReceptionistSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SEARCH_MOCK_RESULTS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search patients, bills, queue..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Actions & Results
          </div>

          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onNavigateTab(item.tab);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.type === 'patient' && <User className="w-4 h-4" />}
                    {item.type === 'appointment' && <Calendar className="w-4 h-4" />}
                    {item.type === 'bill' && <CreditCard className="w-4 h-4" />}
                    {item.type === 'registration' && <Clock className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tagColor}`}
                  >
                    {item.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Use ESC to close</span>
          <span>Click to select</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ReceptionistSearchModal);
