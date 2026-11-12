import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { updateAppointment, fetchDoctors } from '../../api';
import type { AppointmentDTO, DoctorDTO } from '@mcms/contracts';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  appointment: AppointmentDTO | any | null;
  doctors?: DoctorDTO[];
}

export default function RescheduleAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  doctors: initialDoctors,
}: RescheduleAppointmentModalProps) {
  const { accessToken } = useAuth();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');

  const [doctors, setDoctors] = useState<DoctorDTO[]>(initialDoctors || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !appointment) return;
    const initialDate = appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : (appointment.date || '');
    setDate(initialDate || new Date().toISOString().split('T')[0] || '');
    setStartTime(appointment.startTime || appointment.time || '09:00');
    setEndTime(appointment.endTime || '09:30');
    setDoctorId(appointment.doctorId || '');
    setReason(appointment.reason || '');
    setError(null);
    setSuccess(false);

    if (initialDoctors && initialDoctors.length > 0) {
      setDoctors(initialDoctors);
    } else if (accessToken) {
      void fetchDoctors(accessToken).then((docs) => setDoctors(docs)).catch(() => {});
    }
  }, [isOpen, appointment, accessToken, initialDoctors]);

  if (!isOpen || !appointment) return null;

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    setSubmitting(true);

    try {
      await updateAppointment(
        appointment.id,
        {
          appointmentDate: date,
          startTime,
          endTime,
          doctorId: doctorId || undefined,
          reason: reason.trim() ? reason.trim() : undefined,
          status: 'SCHEDULED',
        },
        accessToken,
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Reschedule Appointment</h2>
              <p className="text-xs text-slate-500 mt-0.5">{appointment.patientName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Appointment rescheduled successfully!
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleReschedule} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Appointment Date *
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Doctor
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="">Keep current / Any available doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.displayName} ({d.specialty || d.departmentName || 'Medical Doctor'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Notes (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Patient requested morning slot"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !date || !startTime}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save New Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

