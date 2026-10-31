import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, Stethoscope, AlertCircle, Database } from 'lucide-react';
import { useSync } from '../../context/SyncContext';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked?: (appointment: any) => void;
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onAppointmentBooked,
}: NewAppointmentModalProps) {
  const { enqueueOperation } = useSync();
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('+251 ');
  const [doctor, setDoctor] = useState('Dr. Tadesse');
  const [department, setDepartment] = useState('General Medicine');
  const [date, setDate] = useState('2026-10-20');
  const [time, setTime] = useState('09:30 AM');
  const [reason, setReason] = useState('Regular checkup');
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'Follow-up'>('Routine');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    const aptId = `apt-${Date.now()}`;
    const newApt = {
      id: aptId,
      patientName,
      phone,
      doctor,
      department,
      date,
      time,
      reason,
      priority,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    // Enqueue operation into local SQLite sync queue
    await enqueueOperation('appointment', aptId, 'CREATE', newApt);

    setIsSubmitting(false);
    setSuccess(true);
    onAppointmentBooked?.(newApt);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Book New Appointment
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Schedules visit & enqueues to SQLite offline queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-slate-900">Appointment Booked!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Appointment for <strong>{patientName}</strong> with <strong>{doctor}</strong> was recorded and enqueued to SQLite local sync storage.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>Synced Locally in SQLite</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Almaz Bekele"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+251 911 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor *</label>
                <select
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Dr. Tadesse">Dr. Tadesse (General OPD)</option>
                  <option value="Dr. Michael Chen">Dr. Michael Chen (Cardiology)</option>
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Pediatrics)</option>
                  <option value="Dr. Abebech">Dr. Abebech (Internal Med)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="08:30 AM">08:30 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Symptoms</label>
                <input
                  type="text"
                  placeholder="e.g. Follow-up consultation, blood pressure check"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>Auto-enqueued to local sync</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
