'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { DOCTOR_AVAILABILITY_LIST } from './receptionistMockData';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: NewAppointmentModalProps) {
  const [patientName, setPatientName] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTOR_AVAILABILITY_LIST[0]?.name || '');
  const [date, setDate] = useState('2026-10-19');
  const [time, setTime] = useState('09:00 AM');
  const [type, setType] = useState('General Consultation');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onSuccess?.();
      onClose();
    }, 900);
  };

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

        {isSubmitted ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Appointment Booked!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Appointment for {patientName || 'Patient'} with {selectedDoctor} has been saved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Name or ID *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aster Mulu (P-2026-001245)"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor *</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  {DOCTOR_AVAILABILITY_LIST.map((doc) => (
                    <option key={doc.name} value={doc.name}>
                      {doc.name} ({doc.specialty})
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
                  <option>10:30 AM</option>
                  <option>11:30 AM</option>
                  <option>01:00 PM</option>
                  <option>02:30 PM</option>
                  <option>03:30 PM</option>
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
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
