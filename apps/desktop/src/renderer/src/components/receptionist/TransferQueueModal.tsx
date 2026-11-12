import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { updateQueueEntry, fetchDoctors, fetchDepartments, fetchRooms } from '../../api';
import type { DoctorDTO, ClinicDepartmentDTO, ClinicRoomDTO } from '@mcms/contracts';

export interface QueueTransferTarget {
  id: string;
  ticketNumber: string;
  patientName: string;
  patientPid: string;
  departmentId?: string | null | undefined;
  assignedDoctorId?: string | null | undefined;
  roomId?: string | null | undefined;
  priority?: string | null | undefined;
}

interface TransferQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  target: QueueTransferTarget | null;
}

export default function TransferQueueModal({
  isOpen,
  onClose,
  onSuccess,
  target,
}: TransferQueueModalProps) {
  const { accessToken } = useAuth();

  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [rooms, setRooms] = useState<ClinicRoomDTO[]>([]);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('NORMAL');

  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    let isMounted = true;

    async function loadData() {
      setLoadingMetadata(true);
      try {
        const [docs, depts, roomList] = await Promise.all([
          fetchDoctors(accessToken),
          fetchDepartments(accessToken),
          fetchRooms(accessToken),
        ]);
        if (isMounted) {
          setDoctors(docs);
          setDepartments(depts);
          setRooms(roomList);

          if (target) {
            setSelectedDeptId(target.departmentId || (depts[0]?.id ?? ''));
            setSelectedDoctorId(target.assignedDoctorId || '');
            setSelectedRoomId(target.roomId || '');
            setSelectedPriority(target.priority || 'NORMAL');
          }
        }
      } catch {
        // Ignore
      } finally {
        if (isMounted) setLoadingMetadata(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, accessToken, target]);

  if (!isOpen || !target) return null;

  const availableRooms = selectedDeptId
    ? rooms.filter((r) => !r.departmentId || r.departmentId === selectedDeptId)
    : rooms;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    setSubmitting(true);

    try {
      await updateQueueEntry(
        target.id,
        {
          departmentId: selectedDeptId || undefined,
          assignedDoctorId: selectedDoctorId || undefined,
          roomId: selectedRoomId || undefined,
          priority: selectedPriority || undefined,
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
      setError(err instanceof Error ? err.message : 'Failed to transfer patient in queue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Transfer Queued Patient</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ticket <span className="font-bold text-blue-600">{target.ticketNumber}</span> • {target.patientName} ({target.patientPid})
              </p>
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
            Patient successfully transferred! Updating live queue...
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleTransfer} className="p-6 space-y-4">
          {loadingMetadata ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Loading clinic facilities...
            </div>
          ) : (
            <>
              {/* Target Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Department *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  required
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Doctor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Doctor (Optional)
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">General Duty / Any Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.displayName} — {doc.specialty || doc.departmentName || 'Medical Doctor'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consultation Room */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consultation / Examination Room
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">Unassigned Room</option>
                  {availableRooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      Room {rm.roomNumber} — {rm.name} ({rm.roomType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Routine (Normal)', val: 'NORMAL', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
                    { label: 'Urgent', val: 'URGENT', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                    { label: 'Emergency', val: 'EMERGENCY', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
                  ].map((p) => {
                    const active = selectedPriority === p.val;
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setSelectedPriority(p.val)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          active
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                            : `${p.border} ${p.bg} ${p.text} hover:opacity-90`
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={submitting || !selectedDeptId}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Transfer
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

