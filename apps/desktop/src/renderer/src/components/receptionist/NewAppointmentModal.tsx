import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, Stethoscope, AlertCircle, Database, Loader2 } from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import { createAppointment, fetchPatients, fetchDoctors, fetchDepartments } from '../../api';
import type { PatientDTO, DoctorDTO, ClinicDepartmentDTO } from '@mcms/contracts';

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
  const { accessToken } = useAuth();

  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [pid, setPid] = useState('');
  const [phone, setPhone] = useState('+251 ');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Fitsum Alemu');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [departmentName, setDepartmentName] = useState('General Medicine');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0] || '2026-11-08');
  const [time, setTime] = useState('09:30 AM');
  const [reason, setReason] = useState('Regular checkup');
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'Follow-up'>('Routine');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    void (async () => {
      try {
        const [patRes, docRes, deptRes] = await Promise.allSettled([
          fetchPatients(accessToken, { limit: 50 }),
          fetchDoctors(accessToken),
          fetchDepartments(accessToken),
        ]);

        if (!isMounted) return;

        if (patRes.status === 'fulfilled' && patRes.value?.data?.length > 0) {
          setPatients(patRes.value.data);
          const first = patRes.value.data[0]!;
          setSelectedPatientId(first.id);
          setPatientName(first.fullName || `${first.firstName} ${first.lastName}`.trim());
          setPid(first.pid);
          if (first.phoneNumber) setPhone(first.phoneNumber);
        }

        if (docRes.status === 'fulfilled' && docRes.value?.length > 0) {
          setDoctors(docRes.value);
          const firstDoc = docRes.value[0]!;
          setSelectedDoctorId(firstDoc.id);
          setDoctorName(firstDoc.displayName || 'Doctor');
        }

        if (deptRes.status === 'fulfilled' && deptRes.value?.length > 0) {
          setDepartments(deptRes.value);
          setSelectedDeptId(deptRes.value[0]!.id);
          setDepartmentName(deptRes.value[0]!.name);
        }
      } catch (err) {
        console.warn('Error fetching appointment modal data:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  const handlePatientSelect = (pId: string) => {
    setSelectedPatientId(pId);
    const found = patients.find((p) => p.id === pId);
    if (found) {
      setPatientName(found.fullName || `${found.firstName} ${found.lastName}`.trim());
      setPid(found.pid);
      if (found.phoneNumber) setPhone(found.phoneNumber);
    }
  };

  const handleDoctorSelect = (docId: string) => {
    setSelectedDoctorId(docId);
    const found = doctors.find((d) => d.id === docId);
    if (found) {
      setDoctorName(found.displayName || 'Doctor');
    }
  };

  const handleDeptSelect = (dId: string) => {
    setSelectedDeptId(dId);
    const found = departments.find((d) => d.id === dId);
    if (found) {
      setDepartmentName(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    let aptId = `apt-${Date.now()}`;

    try {
      if (selectedPatientId) {
        const liveRes = await createAppointment(
          {
            patientId: selectedPatientId,
            appointmentDate: date,
            startTime: time,
            ...(selectedDoctorId ? { doctorId: selectedDoctorId } : {}),
            ...(selectedDeptId ? { departmentId: selectedDeptId } : {}),
            ...(reason.trim() ? { reason: reason.trim() } : {}),
            type: priority,
          },
          accessToken,
        );

        if (liveRes && liveRes.id) {
          aptId = liveRes.id;
        }
      }
    } catch (err) {
      console.warn('Live createAppointment failed, enqueuing to local SQLite:', err);
    }

    const newApt = {
      id: aptId,
      patientName,
      pid: pid || `P-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      phone,
      doctor: doctorName,
      department: departmentName,
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
                Schedules visit live & enqueues to SQLite offline queue
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
              Appointment for <strong>{patientName}</strong> with <strong>{doctorName}</strong> was recorded and enqueued to SQLite local sync storage.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>Synced with Workstation</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {patients.length > 0 ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Patient *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName || `${p.firstName} ${p.lastName}`.trim()} ({p.pid})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Type</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Routine">Routine</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor</label>
                {doctors.length > 0 ? (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => handleDoctorSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.displayName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                {departments.length > 0 ? (
                  <select
                    value={selectedDeptId}
                    onChange={(e) => handleDeptSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                <input
                  type="text"
                  placeholder="09:30 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
              <input
                type="text"
                placeholder="e.g. Annual blood pressure review"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Database className="w-3 h-3 text-blue-500" />
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Booking...' : 'Book Appointment'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
