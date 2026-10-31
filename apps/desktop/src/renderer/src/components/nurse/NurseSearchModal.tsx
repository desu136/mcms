import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar, ClipboardList, Pill, ArrowRight, HeartPulse } from 'lucide-react';
import { NURSE_PATIENTS, NURSE_APPOINTMENTS, NURSE_TASKS, NURSE_MEDICATIONS } from './nurseMockData';

export interface NurseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (pid: string) => void;
  onSelectAppointment?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function NurseSearchModal({
  isOpen,
  onClose,
  onSelectPatient,
  onSelectAppointment,
  onNavigateTab,
}: NurseSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = query.trim()
    ? NURSE_PATIENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.pid.toLowerCase().includes(query.toLowerCase()) ||
          p.room.toLowerCase().includes(query.toLowerCase())
      )
    : NURSE_PATIENTS.slice(0, 3);

  const filteredAppointments = query.trim()
    ? NURSE_APPOINTMENTS.filter(
        (a) =>
          a.patientName.toLowerCase().includes(query.toLowerCase()) ||
          a.reason.toLowerCase().includes(query.toLowerCase())
      )
    : NURSE_APPOINTMENTS.slice(0, 3);

  const filteredTasks = query.trim()
    ? NURSE_TASKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.patientName.toLowerCase().includes(query.toLowerCase())
      )
    : NURSE_TASKS.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search patients, vitals, beds, tasks, or eMAR..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-slate-800 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Patients Section */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span>Ward Patients ({filteredPatients.length})</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab?.('patients');
                }}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onClose();
                    onSelectPatient?.(p.pid);
                  }}
                  className="p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.pid} · Room {p.room} · Bed {p.bed}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {p.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">BP: {p.vitals.bp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nursing Tasks Section */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span>Tasks & Care Plan</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab?.('tasks');
                }}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onClose();
                    onNavigateTab?.('tasks');
                  }}
                  className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{t.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {t.patientName} · {t.room}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{t.dueTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with arrow keys</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NurseSearchModal);
