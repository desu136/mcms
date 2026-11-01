'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Printer,
  MoreVertical,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  FileText,
  ShieldCheck,
  AlertCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import type { PrescriptionDTO, PatientDTO } from '@mcms/contracts';
import { INITIAL_PATIENTS, PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import DoctorStatCard from '../../../components/doctor/DoctorStatCard';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchPrescriptions } from '../../../lib/api/clinical';
import { fetchPatients } from '../../../lib/api/patients';

export default function DoctorPrescriptionsPage() {
  const { accessToken } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [selectedRx, setSelectedRx] = useState<PrescriptionDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Dispensed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<PatientItem | null>(null);
  const [selectedRightTab, setSelectedRightTab] = useState<'Overview' | 'Medical History' | 'Appointments'>('Overview');


  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayLabel = now.toLocaleDateString('en-US', { weekday: 'long' });

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [rxRes, patRes] = await Promise.allSettled([
        fetchPrescriptions(accessToken),
        fetchPatients(accessToken, { limit: 50 }),
      ]);
      if (rxRes.status === 'fulfilled') {
        setPrescriptions(rxRes.value);
        if (rxRes.value.length > 0 && !selectedRx) {
          setSelectedRx(rxRes.value[0] || null);
        }
      }
      if (patRes.status === 'fulfilled') {
        setPatients(patRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedRx]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Find patient for the selected prescription
  const matchedPatient = patients.find((p) => p.id === selectedRx?.patientId);

  const activePatient = {
    name: selectedRx?.patientName || matchedPatient?.fullName || 'No patient selected',
    pid: selectedRx?.patientPid || matchedPatient?.pid || '—',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: matchedPatient?.dateOfBirth
      ? Math.max(0, new Date().getFullYear() - new Date(matchedPatient.dateOfBirth).getFullYear())
      : 30,
    gender: matchedPatient?.gender === 'FEMALE' ? 'Female' : 'Male',
    phone: matchedPatient?.phoneNumber || '—',
    email: matchedPatient?.email || '—',
    address: matchedPatient?.address || 'Addis Ababa, Ethiopia',
    lastVisitDate: 'Recent',
    lastVisitDept: 'Cardiology',
    nextAppointmentDate: 'Upcoming',
    nextAppointmentTime: '10:00 AM',
  };

  const activeList = prescriptions.filter((p) => p.status === 'ACTIVE');
  const dispensedList = prescriptions.filter((p) => p.status === 'DISPENSED');
  const cancelledList = prescriptions.filter((p) => p.status === 'CANCELLED');

  const filteredPrescriptions = prescriptions.filter((item) => {
    if (filterTab === 'Active' && item.status !== 'ACTIVE') return false;
    if (filterTab === 'Dispensed' && item.status !== 'DISPENSED') return false;
    if (filterTab === 'Cancelled' && item.status !== 'CANCELLED') return false;

    if (selectedStatus !== 'All Statuses' && item.status !== selectedStatus.toUpperCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const medName = item.items?.map((i) => i.medicationName).join(' ').toLowerCase() || '';
      return (
        item.patientName.toLowerCase().includes(q) ||
        (item.patientPid && item.patientPid.toLowerCase().includes(q)) ||
        medName.includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    if (checked) {
      filteredPrescriptions.forEach((item) => {
        next[item.id] = true;
      });
    }
    setSelectedRows(next);
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = (rxId: string) => {
    window.print();
  };

  const openDrawerForPatient = (patientId: string) => {
    const match = patients.find((p) => p.id === patientId || p.pid === patientId);
    if (match) {
      const age = match.dateOfBirth
        ? Math.max(0, new Date().getFullYear() - new Date(match.dateOfBirth).getFullYear())
        : 30;
      setSelectedPatientForDrawer({
        id: match.id,
        name: match.fullName || `${match.firstName} ${match.lastName}`.trim(),
        pid: match.pid || match.id.slice(0, 8),
        age,
        gender: match.gender === 'FEMALE' ? 'Female' : 'Male',
        phone: match.phoneNumber || '—',
        email: match.email || '—',
        address: match.address || 'Addis Ababa, Ethiopia',
        department: 'General Medicine',
        lastVisit: 'Recent',
        lastVisitReason: 'Prescription Requisition',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        totalVisits: 1,
        conditions: [],
      });
    } else {
      setSelectedPatientForDrawer(INITIAL_PATIENTS[0] ?? null);
    }
  };

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs shadow-blue-500/25">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Prescriptions</h1>
          <p className="text-xs text-slate-500 font-medium">
            View and manage patient prescriptions, medication details, and refill information.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>{dateLabel}</span>
          <span className="text-slate-400">{dayLabel}</span>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          title="Refresh"
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Prescription
        </button>
      </div>
    </div>
  );

  const uniquePatientsCount = new Set(prescriptions.map((p) => p.patientId)).size;

  const kpisContent = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <DoctorStatCard
        title="Total Prescriptions"
        value={isLoading ? '—' : prescriptions.length}
        icon={Pill}
        color="blue"
      />
      <DoctorStatCard
        title="Active Prescriptions"
        value={isLoading ? '—' : activeList.length}
        icon={CheckCircle2}
        color="emerald"
      />
      <DoctorStatCard
        title="Dispensed"
        value={isLoading ? '—' : dispensedList.length}
        icon={Clock}
        color="purple"
      />
      <DoctorStatCard
        title="Unique Patients"
        value={isLoading ? '—' : uniquePatientsCount}
        icon={Users}
        color="amber"
      />
    </div>
  );

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={
          <>
          {/* Patient Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Patient Details</h3>
              </div>
              <button
                type="button"
                onClick={() => openDrawerForPatient(activePatient.pid)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="pt-3 text-center">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-16 h-16 rounded-full object-cover ring-3 ring-blue-100 shadow-2xs mx-auto mb-2"
              />
              <div className="flex items-center justify-center gap-1.5">
                <h4 className="text-sm font-extrabold text-slate-800">{activePatient.name}</h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {activePatient.pid}
              </p>

              <div className="mt-4 space-y-2 text-left text-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">
                    {activePatient.age} years / {activePatient.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">{activePatient.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] truncate">{activePatient.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">{activePatient.address}</span>
                </div>
              </div>

              {/* Sub tabs in patient details */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/80 rounded-xl text-[10px] font-bold mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedRightTab('Overview')}
                  className={`py-1 rounded-lg transition-all ${
                    selectedRightTab === 'Overview'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRightTab('Medical History')}
                  className={`py-1 rounded-lg transition-all ${
                    selectedRightTab === 'Medical History'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Medical History
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRightTab('Appointments')}
                  className={`py-1 rounded-lg transition-all ${
                    selectedRightTab === 'Appointments'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Appointments
                </button>
              </div>

              {/* Last Visit / Next Appointment */}
              <div className="mt-3.5 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Last Visit</div>
                      <div className="text-[11px] font-bold text-slate-800">{activePatient.lastVisitDate}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{activePatient.lastVisitDept}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-[10px] text-blue-500 font-semibold uppercase">Next Appointment</div>
                      <div className="text-[11px] font-bold text-slate-800">{activePatient.nextAppointmentDate}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700">{activePatient.nextAppointmentTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (4 tiles) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Pill className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <Pill className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  New Prescription
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  Refill Request
                </span>
              </button>

              <button
                type="button"
                onClick={() => openDrawerForPatient(activePatient.pid)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  View Medical Record
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePrint(selectedRx?.id ?? '')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <Printer className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  Print Prescription
                </span>
              </button>
            </div>
          </div>

          {/* Recent Prescriptions List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Recent Prescriptions</h3>
              </div>
              <button
                type="button"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Amoxicillin 500mg</div>
                    <div className="text-[10px] text-slate-400">Oct 19, 2026 • 7 days</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Metformin 500mg</div>
                    <div className="text-[10px] text-slate-400">Oct 18, 2026 • 30 days</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Atorvastatin 20mg</div>
                    <div className="text-[10px] text-slate-400">Oct 18, 2026 • 30 days</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Lisinopril 10mg</div>
                    <div className="text-[10px] text-slate-400">Oct 17, 2026 • 30 days</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Paracetamol 500mg</div>
                    <div className="text-[10px] text-slate-400">Oct 16, 2026 • 5 days</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Safe Medication Card */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Safe Medication</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                Always review allergies, interactions, and contraindications before prescribing.
              </p>
            </div>
          </div>
          </>
        }
        rightPanelWidth="lg:w-[350px] xl:w-[380px] 2xl:w-[420px]"
      >
          {/* Sub Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterTab('All')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterTab === 'All'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              All Prescriptions ({prescriptions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Active')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterTab === 'Active'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active ({activeList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Dispensed')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterTab === 'Dispensed'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Dispensed ({dispensedList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Cancelled')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterTab === 'Cancelled'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancelled ({cancelledList.length})
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient name, PID, or medication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-0"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden cursor-pointer"
                >
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Dispensed</option>
                  <option>Cancelled</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="rounded-sm border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Prescription ID</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Medication(s)</th>
                    <th className="py-3 px-3">Dosage / Frequency</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Prescribed Date</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                        Loading prescriptions...
                      </td>
                    </tr>
                  ) : filteredPrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                        No prescriptions found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredPrescriptions.map((row) => {
                      const isChecked = Boolean(selectedRows[row.id]);
                      const isSelected = selectedRx?.id === row.id;
                      const medNames = row.items?.map((i) => i.medicationName).join(', ') || 'Medication';
                      const dosageStr = row.items?.map((i) => `${i.dosage}${i.frequency ? ` (${i.frequency})` : ''}`).join(', ') || '—';
                      const durationStr = row.items?.[0]?.duration || '—';
                      const rxDate = row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedRx(row)}
                          className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/40' : isChecked ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRow(row.id)}
                              className="rounded-sm border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700 text-[11px]">
                            {row.id.slice(0, 10).toUpperCase()}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {row.patientName?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDrawerForPatient(row.patientId);
                                  }}
                                  className="font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer truncate"
                                >
                                  {row.patientName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {row.patientPid || row.patientId.slice(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs truncate">
                            {medNames}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{dosageStr}</td>
                          <td className="py-3 px-3 text-slate-600">{durationStr}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                            {rxDate}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {row.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Active
                              </span>
                            ) : row.status === 'DISPENSED' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                Dispensed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                {row.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openDrawerForPatient(row.patientId)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                title="View Patient Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrint(row.id)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                title="Print Prescription"
                              >
                                <Printer className="w-3.5 h-3.5" />
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

            {/* Pagination footer */}
            <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing {filteredPrescriptions.length > 0 ? 1 : 0}-{filteredPrescriptions.length} of {prescriptions.length} prescriptions
              </div>
            </div>
          </div>
      </DoctorPageShell>

      {/* Requisition Modal */}
      <DoctorPrescriptionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          void loadData();
        }}
        patientId={selectedRx?.patientId || patients[0]?.id}
        patientName={selectedRx?.patientName || patients[0]?.fullName}
      />

      {/* Patient EMR Drawer */}
      <DoctorPatientDrawer
        patient={selectedPatientForDrawer}
        isOpen={Boolean(selectedPatientForDrawer)}
        onClose={() => setSelectedPatientForDrawer(null)}
      />
    </>
  );
}
