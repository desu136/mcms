import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Building2,
  DoorOpen,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { fetchDepartments, fetchRooms, fetchDoctors } from '../../api/staff';
import { addToQueue, updateQueueEntry, createAppointment } from '../../api/appointments';
import { fetchPatients } from '../../api/patients';
import type {
  ClinicDepartmentDTO,
  ClinicRoomDTO,
  DoctorDTO,
  PatientDTO,
  QueueEntryDTO,
} from '@mcms/contracts';

export interface DoctorReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string | undefined;
  patientName?: string | undefined;
  activeQueueEntry?: QueueEntryDTO | undefined;
  onSuccess?: () => void;
}

export function DoctorReferralModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  activeQueueEntry,
  onSuccess,
}: DoctorReferralModalProps) {
  const { accessToken, user } = useAuth();

  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [rooms, setRooms] = useState<ClinicRoomDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || '');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [priority, setPriority] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ROUTINE');
  const [referralType, setReferralType] = useState<'queue_transfer' | 'new_appointment'>('queue_transfer');
  const [reason, setReason] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]!
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00 AM');

  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId);
    }
  }, [patientId]);

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    let mounted = true;
    setIsLoadingMetadata(true);
    setError(null);

    Promise.allSettled([
      fetchDepartments(accessToken),
      fetchDoctors(accessToken),
      patientId ? Promise.resolve([]) : fetchPatients(accessToken, { limit: 100 }).then((r) => r.data),
    ])
      .then(([deptRes, docRes, patRes]) => {
        if (!mounted) return;
        if (deptRes.status === 'fulfilled') {
          setDepartments(deptRes.value);
          if (deptRes.value.length > 0 && !selectedDepartmentId) {
            setSelectedDepartmentId(deptRes.value[0]!.id);
          }
        }
        if (docRes.status === 'fulfilled') {
          setDoctors(docRes.value);
        }
        if (patRes.status === 'fulfilled' && (patRes.value as any[]).length > 0 && !selectedPatientId) {
          setPatients(patRes.value as PatientDTO[]);
          setSelectedPatientId((patRes.value as PatientDTO[])[0]!.id);
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingMetadata(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, accessToken, patientId, selectedDepartmentId, selectedPatientId]);

  // Load rooms when department changes
  useEffect(() => {
    if (!isOpen || !accessToken || !selectedDepartmentId) return;

    fetchRooms(accessToken, selectedDepartmentId)
      .then((data) => {
        setRooms(data);
        if (data.length > 0) {
          setSelectedRoomId(data[0]!.id);
        } else {
          setSelectedRoomId('');
        }
      })
      .catch((err) => {
        console.error('Failed to load rooms for department:', err);
        setRooms([]);
        setSelectedRoomId('');
      });
  }, [isOpen, accessToken, selectedDepartmentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const finalPatientId = selectedPatientId || patientId;
    if (!finalPatientId) {
      setError('Please select a patient to refer.');
      return;
    }
    if (!selectedDepartmentId) {
      setError('Please select a receiving department.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedDept = departments.find((d) => d.id === selectedDepartmentId);
      const selectedDoc = doctors.find((d) => d.id === selectedDoctorId);
      const referralSummary = [
        `Referral from Dr. ${user?.displayName || 'Physician'} to ${selectedDept?.name || 'Department'}${selectedDoc ? ` (${selectedDoc.displayName})` : ''}`,
        reason.trim() ? `Reason: ${reason.trim()}` : '',
        clinicalNotes.trim() ? `Notes: ${clinicalNotes.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      if (referralType === 'queue_transfer') {
        if (activeQueueEntry) {
          // Update active queue ticket to new department / doctor
          await updateQueueEntry(
            activeQueueEntry.id,
            {
              departmentId: selectedDepartmentId,
              roomId: selectedRoomId || undefined,
              assignedDoctorId: selectedDoctorId || undefined,
              priority,
              status: 'WAITING',
            },
            accessToken
          );
        } else {
          // Issue a new queue ticket in target department
          await addToQueue(
            {
              patientId: finalPatientId,
              departmentId: selectedDepartmentId,
              roomId: selectedRoomId || undefined,
              assignedDoctorId: selectedDoctorId || undefined,
              priority,
            },
            accessToken
          );
        }
      } else {
        // Schedule Referral Appointment
        await createAppointment(
          {
            patientId: finalPatientId,
            departmentId: selectedDepartmentId,
            roomId: selectedRoomId || undefined,
            doctorId: selectedDoctorId || undefined,
            appointmentDate,
            startTime: appointmentTime,
            type: 'OUTPATIENT',
            reason: reason || `Referral to ${selectedDept?.name || 'Department'}`,
            notes: referralSummary,
          },
          accessToken
        );
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete patient referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = patientName || patients.find((p) => p.id === selectedPatientId)?.fullName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Refer Patient</h3>
              <p className="text-xs text-slate-500">
                Transfer patient to another department, clinical room, or medical specialist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Patient Referral Dispatched</h4>
            <p className="text-xs text-slate-500">
              The patient has been successfully referred and routed to the destination department.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Patient banner or selector */}
            {displayName ? (
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-900">{displayName}</div>
                  <div className="text-[10px] text-blue-600 font-medium">Active Patient for Referral</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Patient Selected
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.pid})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Referral Method Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Referral Routing</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReferralType('queue_transfer')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    referralType === 'queue_transfer'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live Queue Transfer</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Route patient directly to department triage
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReferralType('new_appointment')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    referralType === 'new_appointment'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Specialist Appointment</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Book upcoming consultation slot
                  </span>
                </button>
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination Department *
              </label>
              <div className="relative">
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room & Specialist Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Room (Optional)
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">Any Available Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.roomType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specialist Doctor (Optional)
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">Next Available Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.displayName} ({doc.specialty || 'Physician'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ROUTINE', label: 'Routine', color: 'text-slate-700 border-slate-200 bg-slate-50' },
                  { id: 'URGENT', label: 'Urgent', color: 'text-amber-700 border-amber-300 bg-amber-50' },
                  { id: 'EMERGENCY', label: 'Emergency', color: 'text-rose-700 border-rose-300 bg-rose-50' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      priority === p.id ? `${p.color} ring-2 ring-blue-500/30` : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If Referral Appointment, show Date and Time */}
            {referralType === 'new_appointment' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Referral Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>
            )}

            {/* Reason for referral */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Reason *</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Needs echocardiography and cardiology consult"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            {/* Clinical Notes / Findings */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Handover Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Document current vitals, provisional diagnosis, treatment provided so far..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingMetadata}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Referral...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Dispatch Referral</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default DoctorReferralModal;
