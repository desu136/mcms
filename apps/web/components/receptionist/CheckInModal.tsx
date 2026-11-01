'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, UserCheck, Printer, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { addToQueue, fetchPatients, fetchDoctors, fetchDepartments } from '../../lib/api';
import type { PatientDTO, DoctorDTO, ClinicDepartmentDTO } from '@mcms/contracts';

export interface PreselectedPatientInfo {
  id: string;
  fullName: string;
  pid: string;
}

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedPatient?: PreselectedPatientInfo | string | null;
}

export default function CheckInModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedPatient,
}: CheckInModalProps) {
  const { accessToken } = useAuth();

  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<PatientDTO[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; fullName: string; pid: string } | null>(null);

  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [visitType, setVisitType] = useState('Follow-up');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<{ ticketNumber: string; patientName: string } | null>(null);

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

  // Load doctors & departments
  useEffect(() => {
    if (!isOpen || !accessToken) return;
    let isMounted = true;

    async function loadMetadata() {
      try {
        const [docs, depts] = await Promise.all([
          fetchDoctors(accessToken),
          fetchDepartments(accessToken),
        ]);
        if (isMounted) {
          setDoctors(docs);
          setDepartments(depts);
          if (docs.length > 0 && docs[0]) setSelectedDoctorId(docs[0].id);
          if (depts.length > 0 && depts[0]) setSelectedDeptId(depts[0].id);
        }
      } catch {
        // Fallback gracefully
      }
    }

    void loadMetadata();
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

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPatient) {
      setError('Please select a valid registered patient from the list.');
      return;
    }

    setSubmitting(true);
    try {
      const priority = visitType === 'Emergency' ? 'HIGH' : 'NORMAL';
      const res = await addToQueue(
        {
          patientId: selectedPatient.id,
          assignedDoctorId: selectedDoctorId ? selectedDoctorId : undefined,
          departmentId: selectedDeptId ? selectedDeptId : undefined,
          priority,
        },
        accessToken,
      );

      setGeneratedTicket({
        ticketNumber: res.ticketNumber,
        patientName: res.patientName || selectedPatient.fullName,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue ticket and check in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    setGeneratedTicket(null);
    setSelectedPatient(null);
    setPatientSearch('');
    onClose();
  };

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctorId);
  const selectedDeptObj = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Check In Patient</h2>
              <p className="text-xs text-slate-500">Queue patient for triage and doctor visit</p>
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

        {generatedTicket ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-900">Patient Checked In!</h3>
            <p className="text-xs text-slate-500 mb-4">{generatedTicket.patientName} is now in queue.</p>

            {/* Ticket Card */}
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 my-3 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Queue Ticket Number
              </div>
              <div className="text-3xl font-black text-blue-600 my-1">{generatedTicket.ticketNumber}</div>
              <div className="text-xs text-slate-600 font-medium">
                {selectedDeptObj?.name ?? 'General'} • {selectedDoctorObj?.displayName ?? 'Assigned Doctor'}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Estimated waiting time: ~15 mins
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Ticket
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckIn} className="p-6 space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Name / ID *
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Type name or PID to search..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    if (selectedPatient) setSelectedPatient(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500"
                />
                {searchingPatients && (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Patient suggestions dropdown */}
              {patientResults.length > 0 && !selectedPatient && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  {patientResults.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-slate-100 last:border-0 flex items-center justify-between"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                >
                  <option value="">General</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                >
                  <option value="">Any Available Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.displayName} {doc.specialty ? `(${doc.specialty})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visit Type</label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
              >
                <option>Follow-up</option>
                <option>Consultation</option>
                <option>Check-up</option>
                <option>Emergency</option>
              </select>
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
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-500/20 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Issue Ticket & Check In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
