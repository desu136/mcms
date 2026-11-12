'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, User, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { fetchPatients, fetchAppointments } from '../../lib/api';
import type { PatientDTO, AppointmentDTO } from '@mcms/contracts';

interface ReceptionistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  type: 'patient' | 'appointment';
  title: string;
  subtitle: string;
  href: string;
  tag: string;
  tagColor: string;
}

function ReceptionistSearchModal({
  isOpen,
  onClose,
}: ReceptionistSearchModalProps) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setPatients([]);
      setAppointments([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [patRes, apts] = await Promise.all([
          fetchPatients(accessToken, { search: trimmed, limit: 5 }).catch(() => ({ data: [] })),
          fetchAppointments(accessToken).catch(() => []),
        ]);

        setPatients(patRes.data || []);
        const aptLower = trimmed.toLowerCase();
        const matchedApts = (apts || []).filter(
          (a) =>
            a.patientName.toLowerCase().includes(aptLower) ||
            a.patientPid.toLowerCase().includes(aptLower) ||
            (a.doctorName ?? '').toLowerCase().includes(aptLower),
        ).slice(0, 5);
        setAppointments(matchedApts);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, accessToken, query]);

  const results: SearchResultItem[] = useMemo(() => {
    const list: SearchResultItem[] = [];

    patients.forEach((p) => {
      list.push({
        id: `pat-${p.id}`,
        type: 'patient',
        title: p.fullName,
        subtitle: `PID: ${p.pid} • ${p.phoneNumber ?? 'No phone'} • ${p.city ?? 'Addis Ababa'}`,
        href: '/receptionist/patients',
        tag: p.status,
        tagColor: 'bg-blue-100 text-blue-700',
      });
    });

    appointments.forEach((a) => {
      list.push({
        id: `apt-${a.id}`,
        type: 'appointment',
        title: `${a.patientName} - ${a.startTime}`,
        subtitle: `${a.doctorName ?? 'Doctor'} • ${a.type}`,
        href: '/receptionist/appointments',
        tag: a.status,
        tagColor:
          a.status === 'CONFIRMED' || a.status === 'CHECKED_IN'
            ? 'bg-emerald-100 text-emerald-700'
            : a.status === 'CANCELLED'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-amber-100 text-amber-700',
      });
    });

    return list;
  }, [patients, appointments]);

  if (!isOpen) return null;

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
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients by name, PID, phone, or appointments..."
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
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type a patient name, phone number, PID, or doctor to search...
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    {item.type === 'patient' && <User className="w-4 h-4" />}
                    {item.type === 'appointment' && <Calendar className="w-4 h-4" />}
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
              {loading ? 'Searching live database...' : `No matching records found for "${query}"`}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Live backend search</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ReceptionistSearchModal);
