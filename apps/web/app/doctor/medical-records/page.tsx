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
  Stethoscope,
  Upload,
} from 'lucide-react';
import { INITIAL_PATIENTS } from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';

/* ─── Types ──────────────────────────────────────────── */
type VisitType = 'Follow-up' | 'Consultation' | 'Lab Visit' | 'Imaging' | 'Prescription';
type TabId = 'overview' | 'records' | 'diagnoses' | 'prescriptions' | 'lab' | 'imaging' | 'documents';

interface MedicalRecordRow {
  id: string;
  visitDate: string;
  visitTime: string;
  visitType: VisitType;
  department: string;
  doctor: { name: string; specialty: string; avatar: string };
  diagnosisSummary: string;
  status: 'Completed';
}

/* ─── Mock Data ──────────────────────────────────────── */
const MEDICAL_HISTORY_ROWS: MedicalRecordRow[] = [
  { id: 'rec-1', visitDate: 'Oct 18, 2026', visitTime: '09:40 AM', visitType: 'Follow-up',    department: 'Cardiology',            doctor: { name: 'Dr. Fitsum Alemu', specialty: 'Cardiologist',     avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Hypertension - controlled. Continue current medication...', status: 'Completed' },
  { id: 'rec-2', visitDate: 'Oct 12, 2026', visitTime: '10:15 AM', visitType: 'Consultation', department: 'Internal Medicine',      doctor: { name: 'Dr. Hiwet Desta',  specialty: 'General Physician', avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Common cold. Rest and hydration...',                      status: 'Completed' },
  { id: 'rec-3', visitDate: 'Oct 05, 2026', visitTime: '02:30 PM', visitType: 'Lab Visit',    department: 'Laboratory',            doctor: { name: 'Lab Tech Team',    specialty: 'Laboratory',        avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'CBC - Normal. WBC, RBC, Platelets within range...',        status: 'Completed' },
  { id: 'rec-4', visitDate: 'Sep 28, 2026', visitTime: '11:20 AM', visitType: 'Follow-up',    department: 'Cardiology',            doctor: { name: 'Dr. Fitsum Alemu', specialty: 'Cardiologist',     avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Post-angiogram follow-up. Stable condition...',            status: 'Completed' },
  { id: 'rec-5', visitDate: 'Sep 20, 2026', visitTime: '04:10 PM', visitType: 'Consultation', department: 'Internal Medicine',      doctor: { name: 'Dr. Hiwet Desta',  specialty: 'General Physician', avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Gastritis. Prescribed medication...',                      status: 'Completed' },
  { id: 'rec-6', visitDate: 'Sep 14, 2026', visitTime: '09:00 AM', visitType: 'Consultation', department: 'Obstetrics & Gynecology',doctor: { name: 'Dr. Sara Ahmed',   specialty: 'Gynecologist',      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Routine check-up. All normal...',                         status: 'Completed' },
  { id: 'rec-7', visitDate: 'Sep 07, 2026', visitTime: '01:45 PM', visitType: 'Imaging',      department: 'Radiology',             doctor: { name: 'Dr. Daniel Tesfaye',specialty: 'Radiologist',      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Chest X-ray. No abnormality detected...',                  status: 'Completed' },
  { id: 'rec-8', visitDate: 'Aug 30, 2026', visitTime: '03:20 PM', visitType: 'Prescription', department: 'Pharmacy',              doctor: { name: 'Dr. Fitsum Alemu', specialty: 'Cardiologist',     avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Amlodipine 5mg. Once daily...',                            status: 'Completed' },
  { id: 'rec-9', visitDate: 'Aug 22, 2026', visitTime: '10:30 AM', visitType: 'Consultation', department: 'Internal Medicine',      doctor: { name: 'Dr. Hiwet Desta',  specialty: 'General Physician', avatar: 'https://images.unsplash.com/photo-1594824813576-96b63ca7b567?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Fever and cough. Antibiotics prescribed...',                status: 'Completed' },
  { id: 'rec-10',visitDate: 'Aug 15, 2026', visitTime: '02:00 PM', visitType: 'Lab Visit',    department: 'Laboratory',            doctor: { name: 'Lab Tech Team',    specialty: 'Laboratory',        avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&auto=format&fit=crop&q=80' }, diagnosisSummary: 'Blood glucose - 98 mg/dL. Normal range...',                status: 'Completed' },
];

/* ─── Visit type badge colors ─────────────────────────── */
const visitTypeStyle: Record<VisitType, string> = {
  'Follow-up':    'bg-blue-50 text-blue-700 border-blue-100',
  'Consultation': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Lab Visit':    'bg-purple-50 text-purple-700 border-purple-100',
  'Imaging':      'bg-amber-50 text-amber-700 border-amber-100',
  'Prescription': 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

/* ─── Dept icon map ───────────────────────────────────── */
const deptIconColor: Record<string, string> = {
  'Cardiology':             'text-rose-500',
  'Internal Medicine':      'text-blue-500',
  'Laboratory':             'text-purple-500',
  'Obstetrics & Gynecology':'text-pink-500',
  'Radiology':              'text-amber-500',
  'Pharmacy':               'text-indigo-500',
};

/* ═══════════════════════════════════════════════════════ */
export default function DoctorMedicalRecordsPage() {
  const patient = INITIAL_PATIENTS[0]!;
  const [selectedTab, setSelectedTab] = useState<TabId>('records');
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
      if (!r.diagnosisSummary.toLowerCase().includes(q) && !r.doctor.name.toLowerCase().includes(q)) return false;
    }
    if (visitTypeFilter !== 'All Visit Types' && r.visitType !== visitTypeFilter) return false;
    if (departmentFilter !== 'All Departments' && r.department !== departmentFilter) return false;
    if (doctorFilter !== 'All Doctors' && r.doctor.name !== doctorFilter) return false;
    return true;
  });

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === filteredRecords.length ? [] : filteredRecords.map((r) => r.id));
  const toggleSelectOne = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  /* ── Page Header ─────────────────────────────────────── */
  const header = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-xs text-slate-500 font-medium">
            View and manage patient medical history, diagnoses, prescriptions and test results.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          Oct 01, 2026 – Oct 31, 2026
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </div>
        <button
          onClick={() => alert('New clinical medical record encounter started')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Record
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
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{patient.pid}</p>
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
          <h3 className="text-xs font-bold text-slate-800">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { icon: CalendarDays, label: 'New Appointment',  color: 'text-blue-600 bg-blue-50',    action: () => alert('New appointment') },
            { icon: Pill,         label: 'New Prescription', color: 'text-indigo-600 bg-indigo-50', action: () => setPrescriptionModalOpen(true) },
            { icon: FlaskConical, label: 'Lab Request',      color: 'text-amber-600 bg-amber-50',   action: () => setLabModalOpen(true) },
            { icon: Upload,       label: 'Upload Document',  color: 'text-cyan-600 bg-cyan-50',     action: () => alert('Upload document') },
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

      {/* Medical History Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Medical History Summary</h3>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
            View All
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {[
            { title: 'Hypertension',      diagnosed: '2023-06-12', status: 'Active',    iconBg: 'bg-amber-50',  iconColor: 'text-amber-600',  icon: Heart   },
            { title: 'Type 2 Diabetes',   diagnosed: '2022-11-03', status: 'Active',    iconBg: 'bg-blue-50',   iconColor: 'text-blue-600',   icon: Pill    },
            { title: 'Allergy (Penicillin)',diagnosed:'2021-04-20', status: 'Resolved',  iconBg: 'bg-rose-50',   iconColor: 'text-rose-500',   icon: Shield  },
            { title: 'Gastritis',         diagnosed: '2020-09-15', status: 'Resolved',  iconBg: 'bg-cyan-50',   iconColor: 'text-cyan-600',   icon: Activity},
          ].map(({ title, diagnosed, status, iconBg, iconColor, icon: Icon }) => (
            <div key={title} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">{title}</div>
                  <div className="text-[10px] text-slate-400">Diagnosed: {diagnosed}</div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                status === 'Active'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Recent Documents</h3>
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">View All</button>
        </div>
        <div className="mt-2 space-y-2">
          {[
            { name: 'Lab_Result_CBC_20261005.pdf', date: 'Oct 05, 2026', size: '245 KB' },
            { name: 'Xray_Chest_20260907.pdf',     date: 'Sep 07, 2026', size: '1.2 MB' },
          ].map((doc) => (
            <div key={doc.name} className="flex items-center justify-between gap-2 py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-black text-[9px] shrink-0 border border-rose-100">
                  PDF
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-800 truncate max-w-[140px]">{doc.name}</div>
                  <div className="text-[10px] text-slate-400">{doc.date} • {doc.size}</div>
                </div>
              </div>
              <button
                onClick={() => alert(`Downloading ${doc.name}`)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════ */
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
              { label: 'Total Visits',  value: 5, trend: '↑ 2 vs. last month', up: true,  icon: Layers,      iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
              { label: 'Diagnoses',     value: 4, trend: '↑ 1 vs. last month', up: true,  icon: Activity,    iconBg: 'bg-emerald-50',iconColor: 'text-emerald-600'},
              { label: 'Prescriptions', value: 5, trend: '↑ 1 vs. last month', up: true,  icon: Pill,        iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
              { label: 'Lab Tests',     value: 3, trend: '↑ 0 vs. last month', up: false, icon: FlaskConical,iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
            ].map(({ label, value, trend, up, icon: Icon, iconBg, iconColor }) => (
              <div key={label} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 min-w-[100px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-xl font-black text-slate-800">{value}</div>
                <div className={`text-[10px] font-semibold mt-0.5 ${up ? 'text-emerald-600' : 'text-slate-400'}`}>{trend}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'overview',      label: 'Overview',        icon: Layers      },
            { id: 'records',       label: 'Medical Records', icon: FileText    },
            { id: 'diagnoses',     label: 'Diagnoses',       icon: Activity    },
            { id: 'prescriptions', label: 'Prescriptions',   icon: Pill        },
            { id: 'lab',           label: 'Lab Results',     icon: FlaskConical},
            { id: 'imaging',       label: 'Imaging',         icon: Eye         },
            { id: 'documents',     label: 'Documents',       icon: FileDown    },
          ].map(({ id, label, icon: Icon }) => (
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
              {label}
            </button>
          ))}
        </div>

        {/* ── Filter Bar ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
              <Search className="w-4 h-4 shrink-0" />
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
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
            >
              <option>All Visit Types</option>
              <option>Follow-up</option>
              <option>Consultation</option>
              <option>Lab Visit</option>
              <option>Imaging</option>
              <option>Prescription</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
            >
              <option>All Departments</option>
              <option>Cardiology</option>
              <option>Internal Medicine</option>
              <option>Laboratory</option>
              <option>Obstetrics &amp; Gynecology</option>
              <option>Radiology</option>
            </select>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
            >
              <option>All Doctors</option>
              <option>Dr. Fitsum Alemu</option>
              <option>Dr. Hiwet Desta</option>
              <option>Dr. Sara Ahmed</option>
              <option>Dr. Daniel Tesfaye</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Filter
            </button>
          </div>
        </div>

        {/* ── Medical History Table ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Medical History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/60">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 cursor-pointer"
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
                {filteredRecords.map((row) => (
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
                      <div className="font-bold text-slate-800">{row.visitDate}</div>
                      <div className="text-[10px] text-slate-400">{row.visitTime}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${visitTypeStyle[row.visitType]}`}>
                        {row.visitType}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className={`w-3.5 h-3.5 shrink-0 ${deptIconColor[row.department] ?? 'text-slate-400'}`} />
                        <span className="font-medium text-slate-700">{row.department}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img src={row.doctor.avatar} alt={row.doctor.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-white shadow-2xs" />
                        <div>
                          <div className="font-bold text-slate-800">{row.doctor.name}</div>
                          <div className="text-[10px] text-slate-400">{row.doctor.specialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate text-slate-600 font-medium">
                      {row.diagnosisSummary}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDrawerOpen(true)}
                          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="View Chart"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
            <span>
              Showing <span className="font-bold text-slate-700">1-{filteredRecords.length}</span> of{' '}
              <span className="font-bold text-slate-700">48</span> records
            </span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    p === 1 ? 'bg-blue-600 text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </DoctorPageShell>

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
    </>
  );
}
