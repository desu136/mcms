import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar, FileText, Pill, ArrowRight } from 'lucide-react';
import { INITIAL_PATIENTS, TODAY_SCHEDULE } from './doctorMockData';

export interface DoctorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patientId: string) => void;
  onSelectAppointment?: (aptId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function DoctorSearchModal({
  isOpen,
  onClose,
  onSelectPatient,
  onSelectAppointment,
  onNavigateTab,
}: DoctorSearchModalProps) {
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
    ? INITIAL_PATIENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.pid.toLowerCase().includes(query.toLowerCase()) ||
          p.phone.includes(query)
      )
    : INITIAL_PATIENTS.slice(0, 3);

  const filteredAppointments = query.trim()
    ? TODAY_SCHEDULE.filter(
        (a) =>
          a.patientName.toLowerCase().includes(query.toLowerCase()) ||
          a.reason.toLowerCase().includes(query.toLowerCase())
      )
    : TODAY_SCHEDULE.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, medical records, appointments, prescriptions..."
            className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-md">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Categories */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
              Patients ({filteredPatients.length})
            </div>
            <div className="space-y-1">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient?.(patient.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {patient.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {patient.pid} • {patient.age} yrs • {patient.gender} • {patient.department}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-1">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
              Today&apos;s Appointments ({filteredAppointments.length})
            </div>
            <div className="space-y-1">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => {
                    onSelectAppointment?.(apt.id);
                    onNavigateTab?.('appointments');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{apt.patientName}</div>
                      <div className="text-xs text-slate-400">
                        {apt.time} • {apt.reason} • {apt.status}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-1">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
              Quick Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onNavigateTab?.('patients');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 flex items-center gap-2 text-slate-700 font-semibold text-left"
              >
                <User className="w-4 h-4 text-blue-600" /> Patients Registry
              </button>
              <button
                onClick={() => {
                  onNavigateTab?.('appointments');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 flex items-center gap-2 text-slate-700 font-semibold text-left"
              >
                <Calendar className="w-4 h-4 text-blue-600" /> Today&apos;s Appointments
              </button>
              <button
                onClick={() => {
                  onNavigateTab?.('prescriptions');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 flex items-center gap-2 text-slate-700 font-semibold text-left"
              >
                <Pill className="w-4 h-4 text-blue-600" /> Prescriptions Queue
              </button>
              <button
                onClick={() => {
                  onNavigateTab?.('medical-records');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 flex items-center gap-2 text-slate-700 font-semibold text-left"
              >
                <FileText className="w-4 h-4 text-blue-600" /> Medical Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DoctorSearchModal;
