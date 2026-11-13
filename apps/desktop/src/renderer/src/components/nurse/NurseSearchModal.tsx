import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, ClipboardList, CalendarDays, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchNursingTasks } from '../../api/clinical';
import { fetchAppointments } from '../../api/appointments';
import type { PatientDTO, NursingTaskDTO, AppointmentDTO } from '@mcms/contracts';

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
  const { accessToken } = useAuth();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [tasks, setTasks] = useState<NursingTaskDTO[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setPatients([]);
      setTasks([]);
      setAppointments([]);
    }
  }, [isOpen]);

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

  useEffect(() => {
    const q = query.trim();
    if (!q || !accessToken) {
      setPatients([]);
      setTasks([]);
      setAppointments([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [patRes, taskRes, apptRes] = await Promise.allSettled([
          fetchPatients(accessToken, { search: q, limit: 4 }),
          fetchNursingTasks(accessToken),
          fetchAppointments(accessToken),
        ]);

        if (patRes.status === 'fulfilled') {
          setPatients(patRes.value.data || []);
        }
        const lower = q.toLowerCase();
        if (taskRes.status === 'fulfilled') {
          setTasks(
            (taskRes.value || [])
              .filter(
                (t) =>
                  t.title?.toLowerCase().includes(lower) ||
                  t.patientName?.toLowerCase().includes(lower) ||
                  t.taskType?.toLowerCase().includes(lower) ||
                  t.details?.toLowerCase().includes(lower)
              )
              .slice(0, 4)
          );
        }
        if (apptRes.status === 'fulfilled') {
          const data = apptRes.value || [];
          setAppointments(
            data
              .filter(
                (a) =>
                  a.patientName?.toLowerCase().includes(lower) ||
                  a.reason?.toLowerCase().includes(lower) ||
                  a.status?.toLowerCase().includes(lower)
              )
              .slice(0, 3)
          );
        }
      } catch (err) {
        console.error('Search error in NurseSearchModal:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, accessToken]);

  if (!isOpen) return null;

  const handlePatientClick = (pid: string) => {
    onClose();
    if (onSelectPatient) {
      onSelectPatient(pid);
    } else {
      onNavigateTab?.('patients');
    }
  };

  const handleTaskClick = () => {
    onClose();
    onNavigateTab?.('tasks');
  };

  const handleAppointmentClick = (id: string) => {
    onClose();
    if (onSelectAppointment) {
      onSelectAppointment(id);
    } else {
      onNavigateTab?.('appointments');
    }
  };

  const hasResults = patients.length > 0 || tasks.length > 0 || appointments.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients by name or PID, tasks, appointments..."
            className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p className="font-semibold text-slate-600">Quick Nurse Search</p>
              <p className="text-xs mt-1 text-slate-400">
                Type a patient name, PID (e.g. PID-001024), room, or medication to jump directly.
              </p>
            </div>
          )}

          {query.trim() && !isSearching && !hasResults && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p className="font-semibold text-slate-600">No results found</p>
              <p className="text-xs mt-1 text-slate-400">
                No matching records found for &ldquo;{query}&rdquo;.
              </p>
            </div>
          )}

          {/* Patients Section */}
          {patients.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Patients
              </div>
              <div className="space-y-1">
                {patients.map((p) => {
                  const name = p.fullName || `${p.firstName} ${p.lastName}`.trim();
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePatientClick(p.pid)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`}
                          alt={name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {p.pid} • {p.gender || '—'} • {p.phoneNumber || '—'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        View Chart
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nursing Tasks Section */}
          {tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
                Tasks
              </div>
              <div className="space-y-1">
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={handleTaskClick}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition text-left group"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                        {t.title || t.taskType} {t.patientName ? `— ${t.patientName}` : ''}
                      </div>
                      <div className="text-xs text-slate-400">
                        Status: {t.status} • Priority: {t.priority}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'URGENT' || t.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-600'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Section */}
          {appointments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                Appointments
              </div>
              <div className="space-y-1">
                {appointments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleAppointmentClick(a.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition text-left group"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {a.patientName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {a.reason || 'General Consultation'} • {a.status}
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      {a.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default NurseSearchModal;
