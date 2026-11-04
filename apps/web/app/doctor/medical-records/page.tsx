'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Heart,
  FlaskConical,
  Activity,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Pill,
  Download,
  CalendarDays,
  FileDown,
  Layers,
  Stethoscope,
  RefreshCw,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import { INITIAL_PATIENTS, PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import PrescriptionSlipModal from '../../../components/doctor/PrescriptionSlipModal';
import LabReportModal from '../../../components/doctor/LabReportModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchPatients } from '../../../lib/api/patients';
import { fetchAppointments } from '../../../lib/api/appointments';
import { fetchPrescriptions, fetchLabOrders, fetchPatientVitals } from '../../../lib/api/clinical';
import type {
  PatientDTO,
  AppointmentDTO,
  PrescriptionDTO,
  LabOrderDTO,
  VitalReadingDTO,
} from '@mcms/contracts';

/* ─── Types ──────────────────────────────────────────── */
type TabId = 'overview' | 'records' | 'diagnoses' | 'prescriptions' | 'lab' | 'documents';

export default function DoctorMedicalRecordsPage() {
  const { accessToken } = useAuth();
  const [livePatients, setLivePatients] = useState<PatientDTO[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Patient Clinical Data
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrderDTO[]>([]);
  const [vitals, setVitals] = useState<VitalReadingDTO[]>([]);

  // Navigation & Filters
  const [selectedTab, setSelectedTab] = useState<TabId>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [selectedRxForSlip, setSelectedRxForSlip] = useState<PrescriptionDTO | null>(null);
  const [selectedLabForReport, setSelectedLabForReport] = useState<LabOrderDTO | null>(null);

  // Load Patients list
  const loadPatients = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingPatients(true);
    try {
      const res = await fetchPatients(accessToken, { limit: 100 });
      const data = res.data;
      setLivePatients(data);
      if (data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(data[0]!.id);
      }
    } catch (err) {
      console.error('Failed to load patients for medical records:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  }, [accessToken, selectedPatientId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Load Patient-specific Medical Records
  const loadPatientRecords = useCallback(async (patientId: string) => {
    if (!accessToken || !patientId) return;
    setIsLoadingData(true);
    try {
      const [aptRes, rxRes, labRes, vitRes] = await Promise.allSettled([
        fetchAppointments(accessToken, { patientId }),
        fetchPrescriptions(accessToken, { patientId }),
        fetchLabOrders(accessToken, { patientId }),
        fetchPatientVitals(patientId, accessToken, 10),
      ]);

      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value);
      if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value);
      if (labRes.status === 'fulfilled') setLabOrders(labRes.value);
      if (vitRes.status === 'fulfilled') setVitals(vitRes.value);
    } catch (err) {
      console.error('Failed to load patient clinical history:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientRecords(selectedPatientId);
    }
  }, [selectedPatientId, loadPatientRecords]);

  const activeLivePatient = livePatients.find((p) => p.id === selectedPatientId) || livePatients[0];
  const patient: PatientItem = activeLivePatient
    ? {
        id: activeLivePatient.id,
        name: activeLivePatient.fullName || `${activeLivePatient.firstName} ${activeLivePatient.lastName}`,
        pid: activeLivePatient.pid,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeLivePatient.fullName || activeLivePatient.firstName)}`,
        age: activeLivePatient.dateOfBirth
          ? Math.max(0, new Date().getFullYear() - new Date(activeLivePatient.dateOfBirth).getFullYear())
          : 30,
        gender: (activeLivePatient.gender as 'Male' | 'Female') || 'Male',
        phone: activeLivePatient.phoneNumber || '—',
        email: activeLivePatient.email || '—',
        address: activeLivePatient.address || 'Addis Ababa, Ethiopia',
        status: 'Active',
        lastVisit: appointments[0]?.appointmentDate?.split('T')[0] || 'Recent',
        lastVisitReason: appointments[0]?.reason || 'General consultation',
        department: 'General',
        totalVisits: appointments.length,
        conditions: [],
      }
    : INITIAL_PATIENTS[0]!;

  // Extract diagnoses from appointments notes and prescriptions
  const extractedDiagnoses = useMemo(() => {
    const list: Array<{ id: string; title: string; date: string; doctor: string; status: 'Active' | 'Resolved' }> = [];
    
    // From completed appointments
    appointments.forEach((apt) => {
      if (apt.notes && apt.notes.includes('Primary Diagnosis:')) {
        const match = apt.notes.match(/Primary Diagnosis:\s*([^\n\r]+)/);
        if (match && match[1]) {
          list.push({
            id: `diag-${apt.id}`,
            title: match[1].trim(),
            date: apt.appointmentDate.split('T')[0] || 'Recent',
            doctor: apt.doctorName || 'Attending Physician',
            status: apt.status === 'COMPLETED' ? 'Resolved' : 'Active',
          });
        }
      }
    });

    // From prescriptions
    prescriptions.forEach((rx) => {
      if (rx.diagnosis) {
        list.push({
          id: `diag-rx-${rx.id}`,
          title: rx.diagnosis,
          date: rx.createdAt.split('T')[0] || 'Recent',
          doctor: rx.doctorName || 'Prescribing Doctor',
          status: rx.status === 'ACTIVE' ? 'Active' : 'Resolved',
        });
      }
    });

    return list;
  }, [appointments, prescriptions]);

  // Latest Vital Sign
  const latestVitals = vitals.length > 0 ? vitals[0] : null;

  /* ── Page Header ─────────────────────────────────────── */
  const header = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Medical Records (EHR)</h1>
            <button
              onClick={() => {
                void loadPatients();
                if (selectedPatientId) void loadPatientRecords(selectedPatientId);
              }}
              disabled={isLoadingPatients || isLoadingData}
              title="Refresh Records"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPatients || isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Central Electronic Health Record (EHR) covering clinical encounters, diagnoses, vitals, prescriptions, and diagnostics.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        {livePatients.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Patient:</span>
            <select
              value={patient.id}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700 focus:outline-none cursor-pointer hover:border-blue-300"
            >
              {livePatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName || `${p.firstName} ${p.lastName}`} ({p.pid})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Open Full EMR Chart
        </button>
      </div>
    </div>
  );

  /* ── Right Panel ─────────────────────────────────────── */
  const rightPanel = (
    <div className="space-y-4">
      {/* Patient Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Patient Details</h3>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
            View All
          </button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-slate-900">{patient.name}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-blue-600 font-bold mt-0.5">{patient.pid}</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{patient.age} years / {patient.gender}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{patient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{patient.address}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800">Quick Clinical Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            {
              icon: Pill,
              label: 'New Prescription',
              color: 'text-indigo-600 bg-indigo-50',
              action: () => setPrescriptionModalOpen(true),
            },
            {
              icon: FlaskConical,
              label: 'Lab Request',
              color: 'text-purple-600 bg-purple-50',
              action: () => setLabModalOpen(true),
            },
            {
              icon: Activity,
              label: 'Measure Vitals',
              color: 'text-emerald-600 bg-emerald-50',
              action: () => setDrawerOpen(true),
            },
            {
              icon: FileText,
              label: 'Clinical Notes',
              color: 'text-blue-600 bg-blue-50',
              action: () => setDrawerOpen(true),
            },
          ].map(({ icon: Icon, label, color, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-center cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Medical History & Vitals Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Latest Vitals Summary</h3>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
            Record New
          </button>
        </div>

        {latestVitals ? (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {latestVitals.systolicBp}/{latestVitals.diastolicBp} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {latestVitals.heartRate} <span className="text-[10px] font-normal text-slate-500">bpm</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Temperature</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {latestVitals.temperature}°C
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Oxygen (SpO2)</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {latestVitals.spo2}%
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No vitals recorded yet for this patient.
          </div>
        )}
      </div>

      {/* Recent Printable Documents */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Printable Documents</h3>
          </div>
          <button onClick={() => setSelectedTab('documents')} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
            View All
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {prescriptions.length > 0 && (
            <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px] shrink-0 border border-indigo-100">
                  Rx
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-800 truncate">Prescription Slip</div>
                  <div className="text-[10px] text-slate-400">{prescriptions[0]?.createdAt.split('T')[0]}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRxForSlip(prescriptions[0] || null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                title="Print Prescription Slip"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {labOrders.length > 0 && (
            <div className="flex items-center justify-between gap-2 py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-[9px] shrink-0 border border-purple-100">
                  LAB
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-800 truncate">Laboratory Report</div>
                  <div className="text-[10px] text-slate-400">{labOrders[0]?.orderedAt.split('T')[0]}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLabForReport(labOrders[0] || null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer shrink-0"
                title="Print Lab Report"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {prescriptions.length === 0 && labOrders.length === 0 && (
            <p className="text-[11px] text-slate-400 italic py-2">No documents generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  /* ── Filtered Encounters ──────────────────────────────── */
  const filteredAppointments = appointments.filter((apt) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReason = apt.reason?.toLowerCase().includes(q);
      const matchNotes = apt.notes?.toLowerCase().includes(q);
      const matchDoctor = apt.doctorName?.toLowerCase().includes(q);
      if (!matchReason && !matchNotes && !matchDoctor) return false;
    }
    if (typeFilter !== 'All Types' && apt.type !== typeFilter) return false;
    return true;
  });

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === filteredAppointments.length ? [] : filteredAppointments.map((r) => r.id));
  const toggleSelectOne = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  return (
    <>
      <DoctorPageShell
        header={header}
        rightPanel={rightPanel}
        rightPanelWidth="lg:w-[300px] xl:w-[320px] 2xl:w-[340px]"
      >
        {/* ── Patient Banner + KPI Cards ─────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col xl:flex-row xl:items-center gap-4">
          {/* Patient Identity */}
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={patient.avatar}
              alt={patient.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-800">{patient.name}</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                <span className="font-bold text-blue-600">{patient.pid}</span> • {patient.age} years • {patient.gender}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {patient.phone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {patient.email}</span>
              </div>
            </div>
          </div>

          {/* 4 Mini KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 xl:ml-auto shrink-0">
            {[
              {
                label: 'Encounters',
                value: appointments.length,
                trend: 'Consultations & visits',
                icon: Layers,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
              },
              {
                label: 'Diagnoses',
                value: extractedDiagnoses.length,
                trend: 'Recorded conditions',
                icon: Activity,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
              },
              {
                label: 'Prescriptions',
                value: prescriptions.length,
                trend: 'Issued scripts',
                icon: Pill,
                iconBg: 'bg-indigo-50',
                iconColor: 'text-indigo-600',
              },
              {
                label: 'Lab Orders',
                value: labOrders.length,
                trend: 'Diagnostics & panels',
                icon: FlaskConical,
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-600',
              },
            ].map(({ label, value, trend, icon: Icon, iconBg, iconColor }) => (
              <div key={label} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 min-w-[105px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-black text-slate-800">{isLoadingData ? '—' : value}</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">{trend}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'records',       label: 'Clinical Encounters', icon: FileText,    count: appointments.length },
            { id: 'diagnoses',     label: 'Diagnoses',           icon: Activity,    count: extractedDiagnoses.length },
            { id: 'prescriptions', label: 'Prescriptions',       icon: Pill,        count: prescriptions.length },
            { id: 'lab',           label: 'Lab Diagnostics',     icon: FlaskConical,count: labOrders.length },
            { id: 'documents',     label: 'Reports & Slips',     icon: FileDown,    count: prescriptions.length + labOrders.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as TabId)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedTab === id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label} <span className="text-[10px] opacity-80">({count})</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        {selectedTab === 'records' && (
          <div className="space-y-3">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
                  <Search className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by reason, doctor, or clinical notes..."
                    className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
                >
                  <option>All Types</option>
                  <option>CONSULTATION</option>
                  <option>FOLLOW_UP</option>
                  <option>EMERGENCY</option>
                  <option>ROUTINE</option>
                </select>
              </div>
            </div>

            {/* Encounters Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Encounter History</h3>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredAppointments.length} record(s) found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/60">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredAppointments.length && filteredAppointments.length > 0}
                          onChange={toggleSelectAll}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Encounter Type</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Chief Complaint / Summary</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {isLoadingData ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          Loading encounter history...
                        </td>
                      </tr>
                    ) : filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          No clinical encounters recorded yet for this patient.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((row) => {
                        const dateFormatted = row.appointmentDate?.split('T')[0] || '—';
                        return (
                          <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(row.id)}
                                onChange={() => toggleSelectOne(row.id)}
                                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-800">{dateFormatted}</div>
                              <div className="text-[10px] text-slate-400">{row.startTime || '10:00 AM'}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                                {row.type || 'Consultation'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {row.branchName || 'Main Hospital'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-800">{row.doctorName || 'Dr. Attending'}</div>
                              <div className="text-[10px] text-slate-400">General Physician</div>
                            </td>
                            <td className="py-3 px-4 max-w-[200px] truncate text-slate-600 font-medium">
                              {row.notes ? row.notes.replace(/\n/g, ' ') : row.reason || 'General clinical review'}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  row.status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : row.status === 'IN_PROGRESS' || row.status === 'IN_CONSULTATION'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setDrawerOpen(true)}
                                  className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="View Full EMR Chart"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Diagnoses Tab ───────────────────────────────── */}
        {selectedTab === 'diagnoses' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recorded Diagnoses & Conditions</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronic and acute clinical diagnoses documented during medical encounters.
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Encounter Note
              </button>
            </div>

            {extractedDiagnoses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active or historical diagnoses recorded for {patient.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {extractedDiagnoses.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{d.title}</h4>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Diagnosed on {d.date} • {d.doctor}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        d.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Prescriptions Tab ───────────────────────────── */}
        {selectedTab === 'prescriptions' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Prescription Records</h3>
                <p className="text-xs text-slate-400">All medications prescribed to {patient.name}.</p>
              </div>
              <button
                onClick={() => setPrescriptionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Prescription
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/70 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Rx Ref</th>
                    <th className="py-3 px-4">Prescribed Medication(s)</th>
                    <th className="py-3 px-4">Dosage & Frequency</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Print Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No prescriptions recorded for this patient.
                      </td>
                    </tr>
                  ) : (
                    prescriptions.map((rx) => {
                      const medNames = rx.items?.map((i) => i.medicationName).join(', ') || 'Medication';
                      const dosageStr = rx.items?.map((i) => `${i.dosage} (${i.frequency || 'Daily'})`).join(', ') || '—';
                      const rxDate = rx.createdAt ? rx.createdAt.split('T')[0] : '—';
                      return (
                        <tr key={rx.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 text-[11px]">
                            {rx.id.slice(0, 10).toUpperCase()}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            {medNames}
                            {rx.diagnosis && (
                              <div className="text-[10px] font-normal text-slate-400">Indication: {rx.diagnosis}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{dosageStr}</td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{rxDate}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rx.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : rx.status === 'DISPENSED'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                  : 'bg-rose-50 text-rose-600 border border-rose-200'
                              }`}
                            >
                              {rx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedRxForSlip(rx)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 transition-colors cursor-pointer"
                              title="Print Prescription Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Lab Diagnostics Tab ─────────────────────────── */}
        {selectedTab === 'lab' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Diagnostic Laboratory Results</h3>
                <p className="text-xs text-slate-400">Pathology and diagnostic orders for {patient.name}.</p>
              </div>
              <button
                onClick={() => setLabModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Lab Order
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/70 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Test(s) Ordered</th>
                    <th className="py-3 px-4">Specimen</th>
                    <th className="py-3 px-4">Result Findings</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No laboratory orders recorded for this patient.
                      </td>
                    </tr>
                  ) : (
                    labOrders.map((order) => {
                      const hasAbnormal = order.results?.some((r) => r.isAbnormal);
                      const testSummary = order.results?.length
                        ? order.results.map((r) => `${r.testName}: ${r.value} ${r.unit || ''}`).join(', ')
                        : 'Specimen in analysis';
                      const dateStr = order.orderedAt?.split('T')[0] || '—';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 text-[11px]">
                            {order.id.slice(0, 10).toUpperCase()}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            {order.results?.[0]?.testName || order.samples?.[0]?.sampleType || 'Diagnostic Order'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {order.samples?.[0]?.sampleType || 'BLOOD'}
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs truncate font-mono text-[11px]">
                            {testSummary}
                          </td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{dateStr}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                hasAbnormal
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                  : order.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}
                            >
                              {hasAbnormal ? 'ABNORMAL' : order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedLabForReport(order)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-purple-600 transition-colors cursor-pointer"
                              title="View & Print Official Report"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Documents Tab ───────────────────────────────── */}
        {selectedTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Printable Clinical Documents</h3>
              <p className="text-xs text-slate-400">
                Official medical documentation including prescription slips, laboratory pathology reports, and encounter records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prescriptions.map((rx, idx) => (
                <div
                  key={rx.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100 group-hover:scale-105 transition-transform">
                      Rx
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        Prescription Slip #{idx + 1}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Issued: {rx.createdAt.split('T')[0]} • Status: {rx.status}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1 truncate">
                        {rx.items?.map((i) => i.medicationName).join(', ') || 'Medication'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRxForSlip(rx)}
                    className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Prescription Slip
                  </button>
                </div>
              ))}

              {labOrders.map((lab, idx) => (
                <div
                  key={lab.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                      LAB
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        Diagnostic Report #{idx + 1}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Ordered: {lab.orderedAt.split('T')[0]} • Status: {lab.status}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1 truncate">
                        {lab.results?.[0]?.testName || lab.samples?.[0]?.sampleType || 'Diagnostic Panel'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLabForReport(lab)}
                    className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Diagnostic Report
                  </button>
                </div>
              ))}
            </div>

            {prescriptions.length === 0 && labOrders.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No printable clinical documents available for this patient.
              </div>
            )}
          </div>
        )}
      </DoctorPageShell>

      {/* Modals & Drawers */}
      <DoctorPatientDrawer
        patient={patient}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          if (selectedPatientId) void loadPatientRecords(selectedPatientId);
        }}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />

      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => {
          setPrescriptionModalOpen(false);
          if (selectedPatientId) void loadPatientRecords(selectedPatientId);
        }}
        patientId={patient.id}
        patientName={patient.name}
      />

      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => {
          setLabModalOpen(false);
          if (selectedPatientId) void loadPatientRecords(selectedPatientId);
        }}
        patientId={patient.id}
        patientName={patient.name}
      />

      {/* Printable Slip Modals */}
      <PrescriptionSlipModal
        isOpen={Boolean(selectedRxForSlip)}
        onClose={() => setSelectedRxForSlip(null)}
        prescription={selectedRxForSlip}
      />

      <LabReportModal
        isOpen={Boolean(selectedLabForReport)}
        onClose={() => setSelectedLabForReport(null)}
        order={selectedLabForReport}
      />
    </>
  );
}
