'use client';

import React, { useState } from 'react';
import { Search, X, User, Calendar, CreditCard, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReceptionistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_MOCK_RESULTS = [
  {
    type: 'patient',
    title: 'Aster Mulu',
    subtitle: 'PID: P-2026-001245 • +251 912 345 678 • General',
    href: '/receptionist/queue',
    tag: 'In Consultation',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'patient',
    title: 'Tesfaye Worku',
    subtitle: 'PID: P-2026-001244 • +251 911 222 333 • Internal Medicine',
    href: '/receptionist/queue',
    tag: 'In Consultation',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'appointment',
    title: 'Lidya Kebede - 09:00 AM',
    subtitle: 'Dr. Mekonnen • Gynecology • Consultation',
    href: '/receptionist/appointments',
    tag: 'Waiting',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    type: 'invoice',
    title: 'INV-2026-1087 - Aster Mulu',
    subtitle: 'ETB 1,420.00 • Paid • Oct 19, 2026',
    href: '/receptionist/billing',
    tag: 'Paid',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
];

function ReceptionistSearchModal({
  isOpen,
  onClose,
}: ReceptionistSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = SEARCH_MOCK_RESULTS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, appointments, invoices, or MRN..."
            className="flex-1 bg-transparent border-0 focus:outline-hidden text-sm text-slate-800 placeholder:text-slate-400 font-medium"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item.href)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    {item.type === 'patient' && <User className="w-4 h-4" />}
                    {item.type === 'appointment' && <Calendar className="w-4 h-4" />}
                    {item.type === 'invoice' && <CreditCard className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 truncate">
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
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
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
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ReceptionistSearchModal);
