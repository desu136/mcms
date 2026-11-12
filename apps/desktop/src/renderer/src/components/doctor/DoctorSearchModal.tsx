import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, User, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchAppointments } from '../../api/appointments';
import type { PatientDTO, AppointmentDTO } from '@mcms/contracts';

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
  const { accessToken } = useAuth();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const loadData = useCallback(async () => {
    if (!isOpen || !accessToken) return;
    setIsLoading(true);
    try {
      const [patRes, apptRes] = await Promise.allSettled([
        fetchPatients(accessToken, { limit: 50 }),
        fetchAppointments(accessToken),
      ]);
      if (patRes.status === 'fulfilled' && patRes.value?.data) {
        setPatients(patRes.value.data);
      }
      if (apptRes.status === 'fulfilled' && Array.isArray(apptRes.value)) {
        setAppointments(apptRes.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredPatients = q
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.pid.toLowerCase().includes(q) ||
          (p.phoneNumber && p.phoneNumber.includes(q))
      )
    : patients.slice(0, 4);

  const filteredAppointments = q
    ? appointments.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          (a.reason && a.reason.toLowerCase().includes(q)) ||
          a.status.toLowerCase().includes(q)
      )
    : appointments.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
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
            placeholder="Search patients by name, PID, or appointments..."
            className="flex-1 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Patients Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Patients Directory
              </span>
              <span className="text-[11px] font-normal lowercase">{filteredPatients.length} found</span>
            </div>
            <div className="space-y-1">
              {filteredPatients.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  {isLoading ? 'Loading patient records...' : 'No matching patient records found.'}
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const age = patient.dateOfBirth
                    ? Math.max(0, new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear())
                    : null;
                  return (
                    <div
                      key={patient.id}
                      onClick={() => {
                        onSelectPatient?.(patient.id);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
                          {patient.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {patient.fullName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {patient.pid} {age ? `• ${age} yrs` : ''} • {patient.gender === 'FEMALE' ? 'Female' : 'Male'} • {patient.phoneNumber || '—'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient?.(patient.id);
                          onNavigateTab?.('medical-records');
                          onClose();
                        }}
                        className="text-xs text-blue-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Chart <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Appointments Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Scheduled Consultations
              </span>
              <span className="text-[11px] font-normal lowercase">{filteredAppointments.length} found</span>
            </div>
            <div className="space-y-1">
              {filteredAppointments.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  {isLoading ? 'Loading appointments...' : 'No appointments matching search.'}
                </div>
              ) : (
                filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      onSelectAppointment?.(apt.id);
                      onNavigateTab?.('appointments');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {apt.startTime || '09:00'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {apt.patientName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {apt.reason || apt.type} • {apt.appointmentDate.split('T')[0]}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                      {apt.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  onNavigateTab?.('appointments');
                  onClose();
                }}
                className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" /> My Appointments
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateTab?.('patients');
                  onClose();
                }}
                className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" /> Patients Directory
              </button>
            </div>
            <span>Press Esc to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSearchModal;
