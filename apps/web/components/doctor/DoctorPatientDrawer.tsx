'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Heart,
  Shield,
  FileText,
  Clock,
  Pill,
  ExternalLink,
  Plus,
  Building2,
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  Check,
  RefreshCw,
  Thermometer,
  Droplet,
  Share2,
} from 'lucide-react';
import { PatientItem } from './doctorMockData';
import { useAuth } from '../../lib/auth/auth-context';
import {
  fetchPatientVitals,
  recordVitals,
  fetchPrescriptions,
  fetchLabOrders,
} from '../../lib/api/clinical';
import { fetchAppointments } from '../../lib/api/appointments';
import type {
  VitalReadingDTO,
  PrescriptionDTO,
  LabOrderDTO,
  AppointmentDTO,
  CreateVitalReadingRequest,
} from '@mcms/contracts';

interface DoctorPatientDrawerProps {
  patient: PatientItem | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  onOpenPrescriptionModal?: (patientId: string) => void;
  onOpenLabModal?: (patientId: string) => void;
  onOpenReferralModal?: (patientId: string) => void;
}

export default function DoctorPatientDrawer({
  patient,
  isOpen,
  onClose,
  onOpenPrescriptionModal,
  onOpenLabModal,
  onOpenReferralModal,
}: DoctorPatientDrawerProps) {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'medications' | 'labs' | 'appointments'>('overview');

  // Real clinical data states
  const [vitalsList, setVitalsList] = useState<VitalReadingDTO[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrderDTO[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentDTO[]>([]);
  const [isLoadingClinical, setIsLoadingClinical] = useState(false);

  // Quick vital record form modal
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [savingVital, setSavingVital] = useState(false);

  const loadPatientClinicalData = useCallback(async () => {
    if (!isOpen || !patient?.id || !accessToken) return;
    setIsLoadingClinical(true);
    try {
      const [vitalsRes, rxRes, labsRes, apptRes] = await Promise.allSettled([
        fetchPatientVitals(patient.id, accessToken),
        fetchPrescriptions(accessToken, { patientId: patient.id }),
        fetchLabOrders(accessToken, { patientId: patient.id }),
        fetchAppointments(accessToken, { patientId: patient.id }),
      ]);

      if (vitalsRes.status === 'fulfilled') setVitalsList(vitalsRes.value);
      if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value);
      if (labsRes.status === 'fulfilled') setLabOrders(labsRes.value);
      if (apptRes.status === 'fulfilled') setAppointmentHistory(apptRes.value);
    } finally {
      setIsLoadingClinical(false);
    }
  }, [isOpen, patient?.id, accessToken]);

  useEffect(() => {
    void loadPatientClinicalData();
  }, [loadPatientClinicalData]);

  if (!isOpen || !patient) return null;

  const latestVital = vitalsList.length > 0 ? vitalsList[0] : null;

  const handleSaveVital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient.id || !accessToken) return;
    setSavingVital(true);
    try {
      const payload: CreateVitalReadingRequest = {
        patientId: patient.id,
        systolicBp: bpSystolic ? parseInt(bpSystolic, 10) : 120,
        diastolicBp: bpDiastolic ? parseInt(bpDiastolic, 10) : 80,
        heartRate: heartRate ? parseInt(heartRate, 10) : 72,
        temperature: temp ? parseFloat(temp) : 36.8,
        spo2: spo2 ? parseInt(spo2, 10) : 98,
        ...(bloodSugar ? { notes: `Blood sugar: ${bloodSugar} mg/dL` } : {}),
      };
      await recordVitals(payload, accessToken);
      setShowVitalForm(false);
      setBpSystolic('');
      setBpDiastolic('');
      setHeartRate('');
      setTemp('');
      setSpo2('');
      setBloodSugar('');
      void loadPatientClinicalData();
    } catch (err) {
      console.error('Failed to record vitals:', err);
    } finally {
      setSavingVital(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Electronic Health Record
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5" /> All Branches
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">
                {patient.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void loadPatientClinicalData()}
                title="Refresh Record"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingClinical ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Patient Header Card */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-blue-50/30 to-white">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center ring-2 ring-blue-500/20 shadow-md shrink-0">
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{patient.name}</h3>
                </div>
                <div className="text-xs font-bold text-blue-600 mb-1">{patient.pid}</div>
                <div className="text-xs text-slate-500 font-medium">
                  {patient.age} yrs • {patient.gender} • Emergency Contact: {patient.phone}
                </div>
              </div>
            </div>

            {/* Quick Contact Row */}
            <div className="mt-4 pt-3 border-t border-slate-100/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center px-6 border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'vitals', label: `Vitals (${vitalsList.length})` },
                { id: 'medications', label: `Rx (${prescriptions.length})` },
                { id: 'labs', label: `Labs (${labOrders.length})` },
                { id: 'appointments', label: `Visits (${appointmentHistory.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'overview' && (
              <>
                {/* Real Latest Vitals Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Latest Recorded Vitals
                    </span>
                    <button
                      onClick={() => setShowVitalForm(true)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Record Now
                    </button>
                  </div>

                  {latestVital ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                        <div className="text-[11px] font-semibold text-blue-600">Blood Pressure</div>
                        <div className="text-base font-bold text-slate-800">
                          {latestVital.systolicBp && latestVital.diastolicBp
                            ? `${latestVital.systolicBp}/${latestVital.diastolicBp}`
                            : '—'}
                        </div>
                        <span className="text-[9px] text-slate-400">mmHg</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                        <div className="text-[11px] font-semibold text-emerald-600">Heart Rate</div>
                        <div className="text-base font-bold text-slate-800">
                          {latestVital.heartRate ? `${latestVital.heartRate}` : '—'}
                        </div>
                        <span className="text-[9px] text-slate-400">bpm</span>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                        <div className="text-[11px] font-semibold text-purple-600">SpO2 / Oxygen</div>
                        <div className="text-base font-bold text-slate-800">
                          {latestVital.spo2 ? `${latestVital.spo2}%` : '—'}
                        </div>
                        <span className="text-[9px] text-slate-400">pulse ox</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50/40">
                      No vitals recorded for this patient yet.{' '}
                      <button
                        onClick={() => setShowVitalForm(true)}
                        className="text-blue-600 font-bold hover:underline ml-1 cursor-pointer"
                      >
                        Record Vitals
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Clinical Actions */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Direct Orders
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPrescriptionModal?.(patient.id);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
                    >
                      <Pill className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">Prescribe</div>
                      <div className="text-[10px] text-slate-400">Medications</div>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLabModal?.(patient.id);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-left transition-all group cursor-pointer"
                    >
                      <FlaskConical className="w-5 h-5 text-orange-500 mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">Order Labs</div>
                      <div className="text-[10px] text-slate-400">Diagnostic panels</div>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReferralModal?.(patient.id);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group cursor-pointer"
                    >
                      <Share2 className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-slate-800">Refer Patient</div>
                      <div className="text-[10px] text-slate-400">Department / specialist</div>
                    </button>
                  </div>
                </div>

                {/* Active Prescriptions Snapshot */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Active Medications ({prescriptions.filter((p) => p.status === 'ACTIVE').length})
                    </span>
                    <button
                      onClick={() => setActiveTab('medications')}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  {prescriptions.filter((p) => p.status === 'ACTIVE').length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No active prescriptions on file.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {prescriptions
                        .filter((p) => p.status === 'ACTIVE')
                        .slice(0, 3)
                        .map((rx) => (
                          <div key={rx.id} className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs">
                            <div className="font-bold text-slate-800">
                              {rx.items?.map((it) => `${it.medicationName} (${it.dosage})`).join(', ') || 'Medication'}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {rx.diagnosis ? `For: ${rx.diagnosis}` : 'Active'} • Dr: {rx.doctorName || 'Assigned'}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Vitals Measurement History
                  </span>
                  <button
                    onClick={() => setShowVitalForm(true)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Record Vitals
                  </button>
                </div>

                {vitalsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No historical vitals found for this patient.</p>
                ) : (
                  <div className="space-y-2">
                    {vitalsList.map((v) => (
                      <div key={v.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium border-b border-slate-100 pb-1.5">
                          <span>{new Date(v.recordedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <span>Staff: {v.recordedByName || 'Clinical Staff'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">BP</span>
                            <span className="font-bold text-slate-800">
                              {v.systolicBp && v.diastolicBp ? `${v.systolicBp}/${v.diastolicBp}` : '—'}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                            <span className="font-bold text-slate-800">{v.heartRate ? `${v.heartRate} bpm` : '—'}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Temp / SpO2</span>
                            <span className="font-bold text-slate-800">
                              {v.temperature ? `${v.temperature}°C` : '—'} • {v.spo2 ? `${v.spo2}%` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Prescriptions &amp; Medications
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPrescriptionModal?.(patient.id);
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Rx
                  </button>
                </div>

                {prescriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No prescriptions recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {rx.diagnosis ? rx.diagnosis : 'Prescription Order'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rx.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rx.status === 'DISPENSED'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rx.status}
                          </span>
                        </div>
                        <div className="space-y-1 pt-1">
                          {rx.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg">
                              <span className="font-semibold text-slate-800">{it.medicationName}</span>
                              <span>{it.dosage} • {it.frequency}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          Prescribed by {rx.doctorName || 'Doctor'} on {new Date(rx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Laboratory Orders &amp; Results
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLabModal?.(patient.id);
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Order Tests
                  </button>
                </div>

                {labOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No laboratory orders on file.</p>
                ) : (
                  <div className="space-y-2">
                    {labOrders.map((lab) => (
                      <div key={lab.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {lab.results?.[0]?.testName || lab.samples?.[0]?.sampleType || 'Diagnostic Panel'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              lab.status === 'COMPLETED' || lab.status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : lab.status === 'IN_PROGRESS'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {lab.status}
                          </span>
                        </div>
                        {lab.clinicalNotes && (
                          <div className="text-[11px] text-slate-500">Clinical notes: {lab.clinicalNotes}</div>
                        )}
                        {lab.results && lab.results.length > 0 && (
                          <div className="bg-slate-50 p-2 rounded-lg space-y-1 mt-1 text-[11px]">
                            {lab.results.map((res, rIdx) => (
                              <div key={rIdx} className="flex justify-between items-center">
                                <span className="font-semibold text-slate-700">{res.testName}:</span>
                                <span className={`font-bold ${res.isAbnormal ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                                  {res.value} {res.unit || ''} {res.isAbnormal ? '⚠️ (Abnormal)' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Appointment &amp; Consultation History
                </div>
                {appointmentHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No consultation history found.</p>
                ) : (
                  <div className="space-y-2">
                    {appointmentHistory.map((apt) => (
                      <div key={apt.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {apt.appointmentDate} • {apt.startTime}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              apt.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : apt.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {apt.type} — {apt.reason || 'General Visit'}
                        </div>
                        {apt.notes && (
                          <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-700 font-mono mt-1">
                            {apt.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5" /> Write Prescription
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenLabModal?.(patient.id);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" /> Order Labs
            </button>
          </div>
        </div>
      </div>

      {/* Quick Record Vitals Modal */}
      {showVitalForm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-800">Record Vitals</h4>
              </div>
              <button
                onClick={() => setShowVitalForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Systolic BP</label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Diastolic BP</label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="75"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="36.8"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="98"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVitalForm(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVital}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {savingVital ? 'Saving...' : 'Save Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
