'use client';

import React, { useState } from 'react';
import { X, UserCheck, Printer, CheckCircle2 } from 'lucide-react';
import { DOCTOR_AVAILABILITY_LIST } from './receptionistMockData';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedPatient?: string;
}

export default function CheckInModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedPatient = '',
}: CheckInModalProps) {
  const [patientName, setPatientName] = useState(preselectedPatient || 'Aster Mulu (P-2026-001245)');
  const [department, setDepartment] = useState('General');
  const [doctor, setDoctor] = useState(DOCTOR_AVAILABILITY_LIST[0]?.name || 'Dr. Tadesse');
  const [visitType, setVisitType] = useState('Follow-up');
  const [generatedQueue, setGeneratedQueue] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const nextQueue = `Q-${Math.floor(10 + Math.random() * 89)}`;
    setGeneratedQueue(nextQueue);
    onSuccess?.();
  };

  const handleFinish = () => {
    setGeneratedQueue(null);
    onClose();
  };

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

        {generatedQueue ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-900">Patient Checked In!</h3>
            <p className="text-xs text-slate-500 mb-4">{patientName} is now in queue.</p>

            {/* Ticket Card */}
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 my-3 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Queue Ticket Number
              </div>
              <div className="text-3xl font-black text-blue-600 my-1">{generatedQueue}</div>
              <div className="text-xs text-slate-600 font-medium">
                {department} • {doctor}
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
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Name / ID *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                >
                  <option>General</option>
                  <option>Internal Medicine</option>
                  <option>Gynecology</option>
                  <option>Pediatrics</option>
                  <option>Cardiology</option>
                  <option>Orthopedics</option>
                  <option>Dermatology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor</label>
                <select
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                >
                  {DOCTOR_AVAILABILITY_LIST.map((doc) => (
                    <option key={doc.name} value={doc.name}>
                      {doc.name}
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
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-500/20 transition-colors"
              >
                Issue Ticket & Check In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
