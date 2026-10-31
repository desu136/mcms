import React, { useState } from 'react';
import { X, Clock, User, CheckCircle2, Stethoscope, AlertTriangle, Database } from 'lucide-react';
import { useSync } from '../../context/SyncContext';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCheckedIn?: (entry: any) => void;
}

export default function CheckInModal({
  isOpen,
  onClose,
  onPatientCheckedIn,
}: CheckInModalProps) {
  const { enqueueOperation } = useSync();
  const [patientName, setPatientName] = useState('');
  const [pid, setPid] = useState('P-2026-');
  const [doctor, setDoctor] = useState('Dr. Tadesse');
  const [department, setDepartment] = useState('General OPD');
  const [priority, setPriority] = useState<'Standard' | 'Urgent' | 'Emergency'>('Standard');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    const queueNo = `Q-${Math.floor(100 + Math.random() * 900)}`;
    const entryId = `queue-${Date.now()}`;
    const newEntry = {
      id: entryId,
      queueNo,
      patientName,
      pid: pid || `P-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      doctor,
      department,
      priority,
      notes,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting',
    };

    // Enqueue operation into local SQLite sync queue
    await enqueueOperation('queue_entry', entryId, 'CREATE', newEntry);

    setIsSubmitting(false);
    setSuccess(true);
    onPatientCheckedIn?.(newEntry);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Patient Check-In
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Assigns queue number & enqueues to SQLite
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

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-slate-900">Check-In Successful!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Patient <strong>{patientName}</strong> has been added to <strong>{doctor}</strong> queue.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-800 rounded-full text-[11px] font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>Enqueued to SQLite Workstation</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawit Kebede"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient ID (PID)</label>
                <input
                  type="text"
                  placeholder="P-2026-0012"
                  value={pid}
                  onChange={(e) => setPid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Triage Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Standard">Standard</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attending Doctor</label>
                <select
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Dr. Tadesse">Dr. Tadesse</option>
                  <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                  <option value="Dr. Abebech">Dr. Abebech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="General OPD">General OPD</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Internal Med">Internal Med</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Chief Complaint</label>
              <input
                type="text"
                placeholder="e.g. Mild headache, flu symptoms"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Database className="w-3 h-3 text-cyan-600" />
                <span>Auto-sync enabled</span>
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
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black shadow-md shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Checking in...' : 'Issue Queue Token'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
