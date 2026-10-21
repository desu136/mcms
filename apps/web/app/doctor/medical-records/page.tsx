'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
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
  ExternalLink,
  Download,
  CalendarDays,
  FileDown,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { INITIAL_PATIENTS, PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';

interface MedicalRecordRow {
  id: string;
  visitDate: string;
  visitTime: string;
  visitType: 'Follow-up' | 'Consultation' | 'Lab Visit' | 'Imaging' | 'Prescription';
  department: string;
  doctor: {
    name: string;
    specialty: string;
    avatar: string;
  };
  diagnosisSummary: string;
  status: 'Completed';
}

const MEDICAL_HISTORY_ROWS: MedicalRecordRow[] = [
  {
    id: 'rec-1',
    visitDate: 'Oct 18, 2026',
    visitTime: '09:40 AM',
    visitType: 'Follow-up',
    department: 'Cardiology',
    doctor: {
      name: 'Dr. Fitsum Alemu',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Hypertension - controlled. Continue current medication...',
    status: 'Completed',
  },
  {
    id: 'rec-2',
    visitDate: 'Oct 12, 2026',
    visitTime: '10:15 AM',
    visitType: 'Consultation',
    department: 'Internal Medicine',
    doctor: {
      name: 'Dr. Hiwet Desta',
      specialty: 'General Physician',
      avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Common cold. Rest and hydration...',
    status: 'Completed',
  },
  {
    id: 'rec-3',
    visitDate: 'Oct 05, 2026',
    visitTime: '02:30 PM',
    visitType: 'Lab Visit',
    department: 'Laboratory',
    doctor: {
      name: 'Lab Tech Team',
      specialty: 'Laboratory',
      avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'CBC - Normal. WBC, RBC, Platelets within range...',
    status: 'Completed',
  },
  {
    id: 'rec-4',
    visitDate: 'Sep 28, 2026',
    visitTime: '11:20 AM',
    visitType: 'Follow-up',
    department: 'Cardiology',
    doctor: {
      name: 'Dr. Fitsum Alemu',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Post-angiogram follow-up. Stable condition...',
    status: 'Completed',
  },
  {
    id: 'rec-5',
    visitDate: 'Sep 20, 2026',
    visitTime: '04:10 PM',
    visitType: 'Consultation',
    department: 'Internal Medicine',
    doctor: {
      name: 'Dr. Hiwet Desta',
      specialty: 'General Physician',
      avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Gastritis. Prescribed medication...',
    status: 'Completed',
  },
  {
    id: 'rec-6',
    visitDate: 'Sep 14, 2026',
    visitTime: '09:00 AM',
    visitType: 'Consultation',
    department: 'Obstetrics & Gynecology',
    doctor: {
      name: 'Dr. Sara Ahmed',
      specialty: 'Gynecologist',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Routine check-up. All normal...',
    status: 'Completed',
  },
  {
    id: 'rec-7',
    visitDate: 'Sep 07, 2026',
    visitTime: '01:45 PM',
    visitType: 'Imaging',
    department: 'Radiology',
    doctor: {
      name: 'Dr. Daniel Tesfaye',
      specialty: 'Radiologist',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Chest X-ray. No abnormality detected...',
    status: 'Completed',
  },
  {
    id: 'rec-8',
    visitDate: 'Aug 30, 2026',
    visitTime: '03:20 PM',
    visitType: 'Prescription',
    department: 'Pharmacy',
    doctor: {
      name: 'Dr. Fitsum Alemu',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Amlodipine 5mg. Once daily...',
    status: 'Completed',
  },
  {
    id: 'rec-9',
    visitDate: 'Aug 22, 2026',
    visitTime: '10:30 AM',
    visitType: 'Consultation',
    department: 'Internal Medicine',
    doctor: {
      name: 'Dr. Hiwet Desta',
      specialty: 'General Physician',
      avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Fever and cough. Antibiotics prescribed...',
    status: 'Completed',
  },
  {
    id: 'rec-10',
    visitDate: 'Aug 15, 2026',
    visitTime: '02:00 PM',
    visitType: 'Lab Visit',
    department: 'Laboratory',
    doctor: {
      name: 'Lab Tech Team',
      specialty: 'Laboratory',
      avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80',
    },
    diagnosisSummary: 'Blood glucose - 98 mg/dL. Normal range...',
    status: 'Completed',
  },
];

export default function DoctorMedicalRecordsPage() {
  const patient = INITIAL_PATIENTS[0]!; // Aster Mulu
  const [selectedTab, setSelectedTab] = useState<'records' | 'overview' | 'diagnoses' | 'prescriptions' | 'lab' | 'imaging' | 'documents'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [visitTypeFilter, setVisitTypeFilter] = useState('All Visit Types');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const filteredRecords = MEDICAL_HISTORY_ROWS.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!r.diagnosisSummary.toLowerCase().includes(q) && !r.doctor.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (visitTypeFilter !== 'All Visit Types' && r.visitType !== visitTypeFilter) return false;
    if (departmentFilter !== 'All Departments' && r.department !== departmentFilter) return false;
    if (doctorFilter !== 'All Doctors' && r.doctor.name !== doctorFilter) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Header & New Record Action ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Medical Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              View and manage patient medical history, diagnoses, prescriptions and test results.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Oct 01, 2026 – Oct 31, 2026</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          <button
            onClick={() => alert('New clinical medical record encounter started')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Record</span>
          </button>
        </div>
      </div>

      {/* ─── Patient Profile Header Card (Aster Mulu Banner) ──────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Patient Identity */}
        <div className="flex items-center gap-4">
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{patient.name}</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                ● Active
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              <span className="font-semibold text-blue-600">{patient.pid}</span> • {patient.age} years • {patient.gender}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {patient.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {patient.email}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Mini Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 min-w-[120px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Total Visits</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-800">5</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 2 vs. last month</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 min-w-[120px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Diagnoses</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-800">4</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 1 vs. last month</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 min-w-[120px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Prescriptions</span>
              <Pill className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-800">5</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 1 vs. last month</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 min-w-[120px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Lab Tests</span>
              <FlaskConical className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-800">3</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">↑ 0 vs. last month</div>
          </div>
        </div>
      </div>

      {/* ─── Record Sub-Tabs ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'records', label: 'Medical Records', icon: FileText },
          { id: 'diagnoses', label: 'Diagnoses', icon: Activity },
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
          { id: 'lab', label: 'Lab Results', icon: FlaskConical },
          { id: 'imaging', label: 'Imaging', icon: Eye },
          { id: 'documents', label: 'Documents', icon: FileDown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Two-Column Grid: History Table (7 cols) + Right Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Search, Filter & Medical History Table */}
        <div className="lg:col-span-7 space-y-5">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2.5">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by diagnosis, doctor, or visit type..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            <select
              value={visitTypeFilter}
              onChange={(e) => setVisitTypeFilter(e.target.value)}
              className="text-xs font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
            >
              <option value="All Visit Types">All Visit Types</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Consultation">Consultation</option>
              <option value="Lab Visit">Lab Visit</option>
              <option value="Imaging">Imaging</option>
              <option value="Prescription">Prescription</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
            >
              <option value="All Departments">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
              <option value="Radiology">Radiology</option>
            </select>

            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="text-xs font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
            >
              <option value="All Doctors">All Doctors</option>
              <option value="Dr. Fitsum Alemu">Dr. Fitsum Alemu</option>
              <option value="Dr. Hiwet Desta">Dr. Hiwet Desta</option>
              <option value="Dr. Sara Ahmed">Dr. Sara Ahmed</option>
              <option value="Dr. Daniel Tesfaye">Dr. Daniel Tesfaye</option>
            </select>

            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 px-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Medical History</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-3 px-4">Visit Date</th>
                    <th className="py-3 px-4">Visit Type</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Diagnosis Summary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRecords.map((row) => {
                    const isChecked = selectedIds.includes(row.id);
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectOne(row.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{row.visitDate}</div>
                          <div className="text-[10px] text-slate-400">{row.visitTime}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              row.visitType === 'Follow-up'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : row.visitType === 'Consultation'
                                ? 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                                : row.visitType === 'Lab Visit'
                                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                : row.visitType === 'Imaging'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}
                          >
                            {row.visitType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                          {row.department}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={row.doctor.avatar}
                              alt={row.doctor.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{row.doctor.name}</div>
                              <div className="text-[10px] text-slate-400">{row.doctor.specialty}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600">
                          {row.diagnosisSummary}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDrawerOpen(true)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                              title="View Chart"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded text-slate-400 hover:text-slate-600">
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

            {/* Pagination Controls */}
            <div className="p-4 px-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-700">1-10</span> of{' '}
                <span className="font-bold text-slate-700">48</span> records
              </div>

              <div className="flex items-center gap-1">
                <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  1
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  2
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  3
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  4
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center text-xs">
                  5
                </button>
                <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs font-semibold text-slate-700 focus:outline-none">
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Panel: Details, Actions, Summary, Documents (5 cols) ──────── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Patient Details</h3>
              </div>
              <button onClick={() => setDrawerOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-800">{patient.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    ● Active
                  </span>
                </div>
                <div className="text-xs font-semibold text-blue-600">{patient.pid}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {patient.age} years / {patient.gender}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {patient.phone}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {patient.email}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {patient.address}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => alert(`Creating new appointment for ${patient.name}`)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-center transition-all group"
              >
                <CalendarDays className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">New Appointment</div>
              </button>
              <button
                onClick={() => setPrescriptionModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-center transition-all group"
              >
                <Pill className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">New Prescription</div>
              </button>
              <button
                onClick={() => setLabModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-center transition-all group"
              >
                <FlaskConical className="w-5 h-5 text-orange-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Lab Request</div>
              </button>
              <button
                onClick={() => alert('Uploading clinical PDF or imaging scan')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-center transition-all group"
              >
                <FileDown className="w-5 h-5 text-cyan-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Upload Document</div>
              </button>
            </div>
          </div>

          {/* Medical History Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Medical History Summary</h3>
              </div>
              <button onClick={() => setDrawerOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Hypertension', diagnosed: '2023-06-12', status: 'Active', color: 'orange', icon: Shield },
                { title: 'Type 2 Diabetes', diagnosed: '2022-11-03', status: 'Active', color: 'blue', icon: Pill },
                { title: 'Allergy (Penicillin)', diagnosed: '2021-04-20', status: 'Resolved', color: 'rose', icon: Shield },
                { title: 'Gastritis', diagnosed: '2020-09-15', status: 'Resolved', color: 'cyan', icon: Activity },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.color === 'orange'
                            ? 'bg-orange-100 text-orange-600'
                            : item.color === 'blue'
                            ? 'bg-blue-100 text-blue-600'
                            : item.color === 'rose'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-cyan-100 text-cyan-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.title}</div>
                        <div className="text-[10px] text-slate-400">Diagnosed: {item.diagnosed}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Documents Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Recent Documents</h3>
              </div>
              <button onClick={() => setDrawerOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Lab_Result_CBC_20261005.pdf', date: 'Oct 05, 2026', size: '245 KB' },
                { name: 'Xray_Chest_20260907.pdf', date: 'Sep 07, 2026', size: '1.2 MB' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between shadow-2xs hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{doc.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {doc.date} • {doc.size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${doc.name}`)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Patient Drawer */}
      <DoctorPatientDrawer
        patient={patient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />

      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        defaultPatientId={patient.id}
      />

      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={patient.id}
      />
    </div>
  );
}
