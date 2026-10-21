'use client';

import React, { useState } from 'react';
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
import { INITIAL_PATIENTS, CURRENT_DOCTOR, PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';

interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  patient: {
    name: string;
    pid: string;
    avatar: string;
    age: number;
    gender: string;
  };
  medication: string;
  dosage: string;
  duration: string;
  prescribedDate: string;
  status: 'Active' | 'Completed' | 'Pending Refill' | 'Cancelled';
  department: string;
}

const PRESCRIPTIONS_DATA: PrescriptionItem[] = [
  {
    id: 'rx-1',
    prescriptionId: 'RX-2026-048',
    patient: {
      name: 'Aster Mulu',
      pid: 'PID-001024',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      age: 28,
      gender: 'Female',
    },
    medication: 'Amoxicillin 500mg',
    dosage: '500mg TID',
    duration: '7 days',
    prescribedDate: 'Oct 19, 2026 09:15 AM',
    status: 'Active',
    department: 'Cardiology',
  },
  {
    id: 'rx-2',
    prescriptionId: 'RX-2026-047',
    patient: {
      name: 'Samuel Girma',
      pid: 'PID-001087',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      age: 45,
      gender: 'Male',
    },
    medication: 'Metformin 500mg',
    dosage: '500mg BID',
    duration: '30 days',
    prescribedDate: 'Oct 18, 2026 04:20 PM',
    status: 'Active',
    department: 'Internal Medicine',
  },
  {
    id: 'rx-3',
    prescriptionId: 'RX-2026-046',
    patient: {
      name: 'Lidya Kebede',
      pid: 'PID-001062',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      age: 39,
      gender: 'Female',
    },
    medication: 'Atorvastatin 20mg',
    dosage: '20mg OD',
    duration: '30 days',
    prescribedDate: 'Oct 18, 2026 11:10 AM',
    status: 'Active',
    department: 'Cardiology',
  },
  {
    id: 'rx-4',
    prescriptionId: 'RX-2026-045',
    patient: {
      name: 'Getachew Tadesse',
      pid: 'PID-001076',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      age: 52,
      gender: 'Male',
    },
    medication: 'Lisinopril 10mg',
    dosage: '10mg OD',
    duration: '30 days',
    prescribedDate: 'Oct 17, 2026 03:45 PM',
    status: 'Active',
    department: 'Cardiology',
  },
  {
    id: 'rx-5',
    prescriptionId: 'RX-2026-044',
    patient: {
      name: 'Betlehem Abebe',
      pid: 'PID-001098',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      age: 32,
      gender: 'Female',
    },
    medication: 'Paracetamol 500mg',
    dosage: '500mg TID',
    duration: '5 days',
    prescribedDate: 'Oct 16, 2026 10:30 AM',
    status: 'Completed',
    department: 'Internal Medicine',
  },
  {
    id: 'rx-6',
    prescriptionId: 'RX-2026-043',
    patient: {
      name: 'Daniel Wondimu',
      pid: 'PID-001099',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      age: 41,
      gender: 'Male',
    },
    medication: 'Omeprazole 20mg',
    dosage: '20mg OD',
    duration: '14 days',
    prescribedDate: 'Oct 16, 2026 09:20 AM',
    status: 'Active',
    department: 'Gastroenterology',
  },
  {
    id: 'rx-7',
    prescriptionId: 'RX-2026-042',
    patient: {
      name: 'Tigist Alemu',
      pid: 'PID-001045',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      age: 26,
      gender: 'Female',
    },
    medication: 'Vitamin D3 1000IU',
    dosage: '1000IU OD',
    duration: '30 days',
    prescribedDate: 'Oct 15, 2026 02:15 PM',
    status: 'Active',
    department: 'Endocrinology',
  },
  {
    id: 'rx-8',
    prescriptionId: 'RX-2026-041',
    patient: {
      name: 'Abebe Assefa',
      pid: 'PID-001087',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      age: 48,
      gender: 'Male',
    },
    medication: 'Amlodipine 5mg',
    dosage: '5mg OD',
    duration: '30 days',
    prescribedDate: 'Oct 14, 2026 11:40 AM',
    status: 'Active',
    department: 'Cardiology',
  },
  {
    id: 'rx-9',
    prescriptionId: 'RX-2026-040',
    patient: {
      name: 'Sofiya Mohamed',
      pid: 'PID-001131',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      age: 34,
      gender: 'Female',
    },
    medication: 'Ibuprofen 400mg',
    dosage: '400mg TID',
    duration: '5 days',
    prescribedDate: 'Oct 13, 2026 04:05 PM',
    status: 'Pending Refill',
    department: 'Rheumatology',
  },
  {
    id: 'rx-10',
    prescriptionId: 'RX-2026-039',
    patient: {
      name: 'Yonas Gebre',
      pid: 'PID-001120',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      age: 38,
      gender: 'Male',
    },
    medication: 'Losartan 50mg',
    dosage: '50mg OD',
    duration: '30 days',
    prescribedDate: 'Oct 12, 2026 09:50 AM',
    status: 'Cancelled',
    department: 'Cardiology',
  },
];

export default function DoctorPrescriptionsPage() {
  const [prescriptions] = useState<PrescriptionItem[]>(PRESCRIPTIONS_DATA);
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Pending Refills' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<PatientItem | null>(null);
  const [selectedRightTab, setSelectedRightTab] = useState<'Overview' | 'Medical History' | 'Appointments'>('Overview');

  // Active highlighted patient for the right panel (defaults to Aster Mulu)
  const [activePatient, setActivePatient] = useState({
    name: 'Aster Mulu',
    pid: 'PID-001024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: 28,
    gender: 'Female',
    phone: '+251 912 345 678',
    email: 'aster.mulu@email.com',
    address: 'Addis Ababa, Ethiopia',
    lastVisitDate: 'Oct 18, 2026',
    lastVisitDept: 'Cardiology',
    nextAppointmentDate: 'Oct 25, 2026',
    nextAppointmentTime: '09:00 AM • Cardiology',
  });

  const filteredPrescriptions = prescriptions.filter((item) => {
    if (filterTab === 'Active' && item.status !== 'Active') return false;
    if (filterTab === 'Pending Refills' && item.status !== 'Pending Refill') return false;
    if (filterTab === 'Completed' && item.status !== 'Completed') return false;
    if (filterTab === 'Cancelled' && item.status !== 'Cancelled') return false;

    if (selectedDept !== 'All Departments' && item.department !== selectedDept) return false;
    if (selectedStatus !== 'All Statuses' && item.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.patient.name.toLowerCase().includes(q) ||
        item.medication.toLowerCase().includes(q) ||
        item.prescriptionId.toLowerCase().includes(q)
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

  const openDrawerForPatient = (pid: string) => {
    const p = INITIAL_PATIENTS.find((item) => item.id === pid) ?? INITIAL_PATIENTS[0]!;
    setSelectedPatientForDrawer(p);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs shadow-blue-500/25">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Prescriptions</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              View and manage patient prescriptions, medication details, and refill information.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Oct 19, 2026</span>
            <span className="text-slate-400">Monday</span>
          </div>

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

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Prescriptions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">48</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 12%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Prescriptions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">42</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 16%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Refills Pending</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">6</h3>
            <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
              <span>↑ 2%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Unique Patients</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">28</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 8%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Table (Left) + Side Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* LEFT / CENTER: PRESCRIPTIONS DIRECTORY & TABLE (lg:col-span-9) */}
        {/* ============================================================== */}
        <div className="lg:col-span-9 space-y-3.5">
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
              All Prescriptions (48)
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
              Active (42)
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Pending Refills')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterTab === 'Pending Refills'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Refills (6)
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Completed')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterTab === 'Completed'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed (0)
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
              Cancelled (0)
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient name, medication, or prescription ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-0"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden cursor-pointer"
                >
                  <option>All Departments</option>
                  <option>Cardiology</option>
                  <option>Internal Medicine</option>
                  <option>Gastroenterology</option>
                  <option>Endocrinology</option>
                  <option>Rheumatology</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden cursor-pointer"
                >
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Pending Refill</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Filter
              </button>
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
                    <th className="py-3 px-3">Dosage</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Prescribed Date</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPrescriptions.map((row) => {
                    const isChecked = Boolean(selectedRows[row.id]);
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          isChecked ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRow(row.id)}
                            className="rounded-sm border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700 text-[11px]">
                          {row.prescriptionId}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={row.patient.avatar}
                              alt={row.patient.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-100 shadow-2xs"
                            />
                            <div>
                              <div
                                onClick={() => openDrawerForPatient(row.patient.pid)}
                                className="font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer truncate"
                              >
                                {row.patient.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {row.patient.pid}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {row.medication}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{row.dosage}</td>
                        <td className="py-3 px-3 text-slate-600">{row.duration}</td>
                        <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {row.prescribedDate}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {row.status === 'Active' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Active
                            </span>
                          )}
                          {row.status === 'Completed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                              Completed
                            </span>
                          )}
                          {row.status === 'Pending Refill' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                              Pending Refill
                            </span>
                          )}
                          {row.status === 'Cancelled' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDrawerForPatient(row.patient.pid)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrint(row.prescriptionId)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                              title="Print Prescription"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                              title="More Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>Showing 1-10 of 48 prescriptions</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center"
                >
                  3
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center"
                >
                  4
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center"
                >
                  5
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span>Rows per page:</span>
                <select className="border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-semibold text-slate-700 bg-white">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: PATIENT DETAILS, ACTIONS, SAFE MEDICATION (3 col) */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 space-y-4">
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
                onClick={() => handlePrint('RX-2026-048')}
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
        </div>
      </div>

      {/* Requisition Modal */}
      <DoctorPrescriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPatientId={activePatient.pid}
      />

      {/* Patient EMR Drawer */}
      <DoctorPatientDrawer
        patient={selectedPatientForDrawer}
        isOpen={Boolean(selectedPatientForDrawer)}
        onClose={() => setSelectedPatientForDrawer(null)}
      />
    </div>
  );
}
