'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, ClipboardList, CalendarDays, Activity } from 'lucide-react';
import { NURSE_PATIENTS, NURSE_TASKS, NURSE_APPOINTMENTS } from './nurseMockData';

interface NurseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NurseSearchModal({ isOpen, onClose }: NurseSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredPatients = q
    ? NURSE_PATIENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.pid.toLowerCase().includes(q) ||
          p.room.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredTasks = q
    ? NURSE_TASKS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.patientName.toLowerCase().includes(q) ||
          t.patientPid.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredAppointments = q
    ? NURSE_APPOINTMENTS.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPid.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, tasks, vital signs, appointments..."
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
          {!q && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p className="font-semibold text-slate-600">Quick Nurse Search</p>
              <p className="text-xs mt-1 text-slate-400">
                Type a patient name, PID (e.g. PID-001024), room, or medication to jump directly.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setQuery('Aster')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                >
                  Aster Mulu
                </button>
                <button
                  onClick={() => setQuery('Vital')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                >
                  Vital Signs
                </button>
                <button
                  onClick={() => setQuery('Wound')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                >
                  Wound Dressing
                </button>
                <button
                  onClick={() => setQuery('Samuel')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                >
                  Samuel Girma
                </button>
              </div>
            </div>
          )}

          {/* Patients Section */}
          {filteredPatients.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Patients
              </div>
              <div className="space-y-1">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/nurse/patients?pid=${p.pid}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {p.pid} • Room {p.room} • {p.department}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nursing Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
                Tasks
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect('/nurse/tasks')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition text-left group"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                        {t.title} — {t.patientName}
                      </div>
                      <div className="text-xs text-slate-400">
                        Due: {t.dueTime} • {t.room} • {t.type}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'High'
                          ? 'bg-rose-50 text-rose-600'
                          : t.priority === 'Medium'
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
          {filteredAppointments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                Appointments
              </div>
              <div className="space-y-1">
                {filteredAppointments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect('/nurse/appointments')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition text-left group"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {a.patientName} ({a.appointmentTime})
                      </div>
                      <div className="text-xs text-slate-400">
                        {a.reason} • {a.department}
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
