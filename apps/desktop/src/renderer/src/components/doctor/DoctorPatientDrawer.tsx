import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Activity,
  Heart,
  Shield,
  FileText,
  Pill,
} from 'lucide-react';
import { PatientItem } from './doctorMockData';

export interface DoctorPatientDrawerProps {
  patient: PatientItem | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  onOpenPrescriptionModal?: (patientId: string) => void;
  onOpenLabModal?: (patientId: string) => void;
}

export function DoctorPatientDrawer({
  patient,
  isOpen,
  onClose,
  onOpenPrescriptionModal,
  onOpenLabModal,
}: DoctorPatientDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'appointments'>('overview');

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Patient Electronic Record
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">
                {patient.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Patient Header Card */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-blue-50/30 to-white">
            <div className="flex items-start gap-4">
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{patient.name}</h3>
                </div>
                <div className="text-xs font-semibold text-blue-600 mb-1">{patient.pid}</div>
                <div className="text-xs text-slate-500">
                  {patient.age} yrs • {patient.gender} • Blood: A+
                </div>
              </div>
            </div>

            {/* Quick Contact Row */}
            <div className="mt-4 pt-3 border-t border-slate-100/80 grid grid-cols-1 gap-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{patient.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center px-6 border-b border-slate-200 bg-slate-50/50">
            {(['overview', 'medical', 'appointments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3 text-xs font-bold capitalize border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'medical' ? 'Medical History' : 'Appointments'}
              </button>
            ))}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'overview' && (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                    <div className="text-[11px] font-semibold text-blue-600">Visits</div>
                    <div className="text-lg font-bold text-slate-800">{patient.totalVisits}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                    <div className="text-[11px] font-semibold text-emerald-600">Blood Pressure</div>
                    <div className="text-lg font-bold text-slate-800">120/80</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                    <div className="text-[11px] font-semibold text-purple-600">Heart Rate</div>
                    <div className="text-lg font-bold text-slate-800">72 bpm</div>
                  </div>
                </div>

                {/* Visit summary */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="text-xs font-bold text-slate-700">Last Clinical Visit</div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">{patient.lastVisit}</span> — {patient.department} (
                    {patient.lastVisitReason})
                  </div>
                  {patient.nextAppointment && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-blue-700 font-medium">
                      Next: {patient.nextAppointment}
                    </div>
                  )}
                </div>

                {/* Quick actions row */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPrescriptionModal?.(patient.id);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
                    >
                      <Pill className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">Add Prescription</div>
                      <div className="text-[10px] text-slate-400">Order medication</div>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLabModal?.(patient.id);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-left transition-all group"
                    >
                      <Activity className="w-4 h-4 text-orange-500 mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">Order Lab Test</div>
                      <div className="text-[10px] text-slate-400">Cardiac, blood, lipid</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'medical' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Documented Diagnoses & Allergies
                  </div>
                  <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                    + Add Condition
                  </span>
                </div>
                <div className="space-y-2">
                  {patient.conditions.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all flex items-start justify-between shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            c.type === 'cardio'
                              ? 'bg-orange-100 text-orange-600'
                              : c.type === 'diabetes'
                              ? 'bg-blue-100 text-blue-600'
                              : c.type === 'cholesterol'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-indigo-100 text-indigo-600'
                          }`}
                        >
                          {c.type === 'cardio' ? (
                            <Shield className="w-3.5 h-3.5" />
                          ) : c.type === 'diabetes' ? (
                            <Pill className="w-3.5 h-3.5" />
                          ) : c.type === 'cholesterol' ? (
                            <Heart className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{c.title}</div>
                          <div className="text-[11px] text-slate-400">Diagnosed: {c.diagnosedDate}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Past & Upcoming Consultations
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1">
                      <span>Oct 25, 2026 • 09:00 AM</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                        Upcoming
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">Cardiology Follow-up with Dr. Fitsum Alemu</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Oct 18, 2026 • 08:00 AM</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
                        Completed
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">Prescription refill & routine BP assessment</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Sep 12, 2026 • 10:30 AM</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
                        Completed
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">Initial Cardiology Consultation</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenPrescriptionModal?.(patient.id);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Pill className="w-3.5 h-3.5" /> Fast Rx Order
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DoctorPatientDrawer;
