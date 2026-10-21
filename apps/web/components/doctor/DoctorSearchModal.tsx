'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar, FileText, Pill, ArrowRight } from 'lucide-react';
import { INITIAL_PATIENTS, TODAY_SCHEDULE } from './doctorMockData';
import Link from 'next/link';

interface DoctorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patientId: string) => void;
}

export default function DoctorSearchModal({ isOpen, onClose, onSelectPatient }: DoctorSearchModalProps) {
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
            placeholder="Search patients, appointments, medical records, or prescriptions..."
            className="flex-1 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                Patients
              </span>
              <span className="text-[11px] font-normal lowercase">{filteredPatients.length} found</span>
            </div>
            <div className="space-y-1">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient?.(patient.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {patient.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {patient.pid} • {patient.age} yrs • {patient.gender} • {patient.phone}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Today's Appointments
              </span>
              <span className="text-[11px] font-normal lowercase">{filteredAppointments.length} found</span>
            </div>
            <div className="space-y-1">
              {filteredAppointments.map((apt) => (
                <Link
                  key={apt.id}
                  href="/doctor/appointments"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs shrink-0">
                      {apt.time.split(' ')[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {apt.patientName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {apt.reason} • {apt.time}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                    {apt.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center gap-4">
              <Link href="/doctor/appointments" onClick={onClose} className="hover:text-blue-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> My Appointments
              </Link>
              <Link href="/doctor/patients" onClick={onClose} className="hover:text-blue-600 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Patients Directory
              </Link>
            </div>
            <span>Press Esc to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
