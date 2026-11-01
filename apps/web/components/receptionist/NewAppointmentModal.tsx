'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { createAppointment, fetchPatients, fetchDoctors } from '../../lib/api';
import type { PatientDTO, DoctorDTO } from '@mcms/contracts';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedPatient?: { id: string; fullName: string; pid: string } | string | null;
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedPatient,
}: NewAppointmentModalProps) {
  const { accessToken } = useAuth();

  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<PatientDTO[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; fullName: string; pid: string } | null>(null);

  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0] ?? '');
  const [time, setTime] = useState('09:00 AM');
  const [type, setType] = useState('General Consultation');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize preselected patient if given
  useEffect(() => {
    if (preselectedPatient) {
      if (typeof preselectedPatient === 'object' && preselectedPatient.id) {
        setSelectedPatient(preselectedPatient);
        setPatientSearch(`${preselectedPatient.fullName} (${preselectedPatient.pid})`);
      } else if (typeof preselectedPatient === 'string' && preselectedPatient.trim()) {
        setPatientSearch(preselectedPatient);
      }
    }
  }, [preselectedPatient]);

  // Load doctors
  useEffect(() => {
    if (!isOpen || !accessToken) return;
    let isMounted = true;

    async function loadDoctors() {
      try {
        const docs = await fetchDoctors(accessToken);
        if (isMounted) {
          setDoctors(docs);
          if (docs.length > 0 && docs[0]) setSelectedDoctorId(docs[0].id);
        }
      } catch {
        // Fallback gracefully
      }
    }

    void loadDoctors();
    return () => {
      isMounted = false;
    };
  }, [isOpen, accessToken]);

  // Live search patients
  const searchPatients = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2 || !accessToken) {
        setPatientResults([]);
        return;
      }
      setSearchingPatients(true);
      try {
        const res = await fetchPatients(accessToken, { search: query.trim(), limit: 5 });
        setPatientResults(res.data);
      } catch {
        setPatientResults([]);
      } finally {
        setSearchingPatients(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (!isOpen || selectedPatient) return;
    const timer = setTimeout(() => {
      void searchPatients(patientSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch, searchPatients, isOpen, selectedPatient]);

  if (!isOpen) return null;

  const handleSelectPatient = (patient: PatientDTO) => {
    setSelectedPatient({ id: patient.id, fullName: patient.fullName, pid: patient.pid });
    setPatientSearch(`${patient.fullName} (${patient.pid})`);
    setPatientResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPatient) {
      setError('Please select a valid registered patient.');
      return;
    }
    if (!date) {
      setError('Please select an appointment date.');
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment(
        {
          patientId: selectedPatient.id,
          doctorId: selectedDoctorId ? selectedDoctorId : undefined,
          appointmentDate: date,
          startTime: time,
          type,
          notes: notes.trim() ? notes.trim() : undefined,
        },
        accessToken,
      );

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Book New Appointment</h2>
              <p className="text-xs text-slate-500">Schedule a patient with an available doctor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Appointment Booked!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Appointment for {selectedPatient?.fullName ?? 'Patient'} with {selectedDoctorObj?.displayName ?? 'Doctor'} has been saved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Name or ID *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Search registered patient by name or PID..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    if (selectedPatient) setSelectedPatient(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
                {searchingPatients && (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Suggestions */}
              {patientResults.length > 0 && !selectedPatient && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  {patientResults.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-slate-100 last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{p.fullName}</div>
                        <div className="text-[10px] text-slate-400">{p.phoneNumber ?? 'No phone'}</div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {p.pid}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor *</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="">Any Available Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.displayName} {doc.specialty ? `(${doc.specialty})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visit Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>General Consultation</option>
                  <option>Follow-up</option>
                  <option>Check-up</option>
                  <option>Specialist Review</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option>08:30 AM</option>
                  <option>09:00 AM</option>
                  <option>09:30 AM</option>
                  <option>10:00 AM</option>
                  <option>10:30 AM</option>
                  <option>11:00 AM</option>
                  <option>11:30 AM</option>
                  <option>01:00 PM</option>
                  <option>01:30 PM</option>
                  <option>02:00 PM</option>
                  <option>02:30 PM</option>
                  <option>03:00 PM</option>
                  <option>03:30 PM</option>
                  <option>04:00 PM</option>
                  <option>04:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Chief complaints, symptoms, or references..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedPatient}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
