'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  History,
  CalendarCheck,
  BarChart2,
} from 'lucide-react';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';

/* ─── Types ─────────────────────────────────────────── */
type LabStatus = 'Completed' | 'Pending' | 'Abnormal';
type ActiveTab = 'All' | 'Completed' | 'Pending' | 'Abnormal';

interface LabRow {
  id: string;
  patient: string;
  pid: string;
  avatar: string;
  test: string;
  department: string;
  result: string;
  reference: string;
  status: LabStatus;
  date: string;
  time: string;
}

/* ─── Mock Data ──────────────────────────────────────── */
const ALL_RESULTS: LabRow[] = [
  {
    id: 'l1', patient: 'Aster Mulu', pid: 'PID-001024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    test: 'Complete Blood Count (CBC)', department: 'Hematology',
    result: 'WBC: 7.8 ×10³/µL\nHgb: 13.2 g/dL', reference: '4.0 - 11.0\n12.0 - 16.0',
    status: 'Completed', date: 'Oct 18, 2026', time: '09:15 AM',
  },
  {
    id: 'l2', patient: 'Samuel Girma', pid: 'PID-001087',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    test: 'Liver Function Test (LFT)', department: 'Biochemistry',
    result: 'ALT: 28 U/L\nAST: 22 U/L', reference: '0 - 40\n0 - 40',
    status: 'Completed', date: 'Oct 18, 2026', time: '08:40 AM',
  },
  {
    id: 'l3', patient: 'Lidya Kebede', pid: 'PID-001062',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&auto=format&fit=crop&q=80',
    test: 'Urinalysis', department: 'Microbiology',
    result: 'Normal\n(No abnormality)', reference: 'Normal\nNormal',
    status: 'Completed', date: 'Oct 17, 2026', time: '03:45 PM',
  },
  {
    id: 'l4', patient: 'Getachew Tadesse', pid: 'PID-001075',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
    test: 'Lipid Profile', department: 'Biochemistry',
    result: 'Chol: 180 mg/dL\nTrig: 120 mg/dL', reference: '< 200\n< 150',
    status: 'Completed', date: 'Oct 17, 2026', time: '10:20 AM',
  },
  {
    id: 'l5', patient: 'Betlehem Abebe', pid: 'PID-001098',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80',
    test: 'Thyroid Function Test (TFT)', department: 'Endocrinology',
    result: 'TSH: 2.36 µU/mL\nT4: 1.2 ng/dL', reference: '0.4 - 4.0\n0.8 - 1.8',
    status: 'Completed', date: 'Oct 16, 2026', time: '04:10 PM',
  },
  {
    id: 'l6', patient: 'Daniel Wondimu', pid: 'PID-001099',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80',
    test: 'Blood Glucose (FBS)', department: 'Biochemistry',
    result: '98 mg/dL', reference: '70 - 110',
    status: 'Completed', date: 'Oct 16, 2026', time: '09:20 AM',
  },
  {
    id: 'l7', patient: 'Tigist Alemu', pid: 'PID-001045',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80',
    test: 'HIV Rapid Test', department: 'Immunology',
    result: 'Negative', reference: 'Negative',
    status: 'Completed', date: 'Oct 15, 2026', time: '02:15 PM',
  },
  {
    id: 'l8', patient: 'Abebe Assefa', pid: 'PID-001087',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=80',
    test: 'COVID-19 Antigen Test', department: 'Virology',
    result: 'Negative', reference: 'Negative',
    status: 'Completed', date: 'Oct 14, 2026', time: '11:40 AM',
  },
  {
    id: 'l9', patient: 'Sefiya Mohamed', pid: 'PID-001131',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80',
    test: 'Vitamin D (25-OH)', department: 'Endocrinology',
    result: '10 ng/mL', reference: '30 - 100',
    status: 'Abnormal', date: 'Oct 13, 2026', time: '04:05 PM',
  },
  {
    id: 'l10', patient: 'Yonas Gebre', pid: 'PID-001129',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
    test: 'Renal Function Test (RFT)', department: 'Nephrology',
    result: 'Creatinine: 1.8 mg/dL\nUrea: 42 mg/dL', reference: '0.6 - 1.2\n10 - 50',
    status: 'Abnormal', date: 'Oct 12, 2026', time: '09:10 AM',
  },
];

/* ─── Status helpers ────────────────────────────────── */
const statusStyle: Record<LabStatus, string> = {
  Completed: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Pending:   'bg-amber-50 text-amber-600 border border-amber-200',
  Abnormal:  'bg-rose-50 text-rose-600 border border-rose-200',
};

/* ─── Page ───────────────────────────────────────────── */
export default function DoctorLabResultsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('All');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  /* filter */
  const filtered = ALL_RESULTS.filter((r) => {
    const matchTab =
      activeTab === 'All' ||
      r.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.patient.toLowerCase().includes(q) ||
      r.test.toLowerCase().includes(q) ||
      r.pid.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {
    All: ALL_RESULTS.length,
    Completed: ALL_RESULTS.filter((r) => r.status === 'Completed').length,
    Pending:   ALL_RESULTS.filter((r) => r.status === 'Pending').length,
    Abnormal:  ALL_RESULTS.filter((r) => r.status === 'Abnormal').length,
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ─── Header ──────────────────────────────────────── */
  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Lab Results</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View and manage laboratory test results, upload new results, and track patient progress.
          </p>
        </div>
      </div>
      {/* Date navigator + Upload */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <div className="leading-tight">
            <div className="font-bold text-slate-800">Oct 19, 2026</div>
            <div className="text-[10px] text-slate-400 font-medium">Monday</div>
          </div>
          <div className="flex items-center ml-1">
            <button className="p-0.5 hover:text-blue-600 transition-colors cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="p-0.5 hover:text-blue-600 transition-colors cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Lab Results
        </button>
      </div>
    </div>
  );

  /* ─── KPI Cards ────────────────────────────────────── */
  const kpis = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Tests */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Total Tests</div>
          <div className="text-2xl font-black text-slate-900 leading-tight">128</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>12%</span>
            <span className="text-slate-400 font-medium">vs. last week</span>
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Completed</div>
          <div className="text-2xl font-black text-slate-900 leading-tight">102</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>18%</span>
            <span className="text-slate-400 font-medium">vs. last week</span>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Pending</div>
          <div className="text-2xl font-black text-slate-900 leading-tight">18</div>
          <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold mt-0.5">
            <TrendingDown className="w-3 h-3" />
            <span>10%</span>
            <span className="text-slate-400 font-medium">vs. last week</span>
          </div>
        </div>
      </div>

      {/* Abnormal */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Abnormal</div>
          <div className="text-2xl font-black text-slate-900 leading-tight">8</div>
          <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold mt-0.5">
            <TrendingDown className="w-3 h-3" />
            <span>20%</span>
            <span className="text-slate-400 font-medium">vs. last week</span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Right Panel ─────────────────────────────────── */
  const rightPanel = (
    <div className="space-y-4">
      {/* Patient Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Patient Details</h3>
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">View All</button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Aster Mulu"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-slate-900">Aster Mulu</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">PID-001024</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>28 years / Female</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>+251 912 345 678</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">aster.mulu@email.com</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-3 grid grid-cols-3 text-center text-[10px] font-bold rounded-xl overflow-hidden border border-slate-200">
          <button className="py-1.5 bg-blue-600 text-white">Overview</button>
          <button className="py-1.5 text-slate-600 hover:bg-slate-50 border-x border-slate-200 transition-colors">Medical History</button>
          <button className="py-1.5 text-slate-600 hover:bg-slate-50 transition-colors">Appointments</button>
        </div>

        {/* Last Visit / Next Appt */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 mb-0.5">Last Visit</div>
            <div className="text-[11px] font-black text-slate-800">Oct 18, 2026</div>
            <div className="text-[10px] text-slate-500">09:15 AM</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="text-[10px] font-bold text-slate-400 mb-0.5">Next Appointment</div>
            <div className="text-[11px] font-black text-slate-800">Oct 25, 2026</div>
            <div className="text-[10px] text-slate-500">09:00 AM • Cardiology</div>
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
            { icon: Eye,         label: 'View Full Results',     color: 'text-blue-600 bg-blue-50' },
            { icon: Download,    label: 'Download Report',        color: 'text-emerald-600 bg-emerald-50' },
            { icon: Plus,        label: 'Add New Order',          color: 'text-amber-600 bg-amber-50' },
            { icon: History,     label: 'View Patient History',   color: 'text-purple-600 bg-purple-50' },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
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

      {/* Recent Lab Results */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Recent Lab Results</h3>
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">View All</button>
        </div>
        <div className="mt-2 space-y-2">
          {[
            { name: 'CBC',             date: 'Oct 18, 2026', status: 'Completed' as LabStatus },
            { name: 'LFT',             date: 'Oct 18, 2026', status: 'Completed' as LabStatus },
            { name: 'Urinalysis',      date: 'Oct 17, 2026', status: 'Completed' as LabStatus },
            { name: 'Lipid Profile',   date: 'Oct 17, 2026', status: 'Completed' as LabStatus },
            { name: 'Vitamin D (25-OH)', date: 'Oct 13, 2026', status: 'Abnormal' as LabStatus },
          ].map(({ name, date, status }) => (
            <div key={name} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
              <div>
                <div className="text-[11px] font-bold text-slate-800">{name}</div>
                <div className="text-[10px] text-slate-400">{date} • {status === 'Abnormal' ? 'Abnormal' : 'Completed'}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusStyle[status]}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lab Result Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BarChart2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800">Lab Result Summary</h3>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              8 abnormal results require follow up.
            </p>
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:underline shrink-0 cursor-pointer">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── Render ──────────────────────────────────────── */
  return (
    <>
      <DoctorPageShell
        header={header}
        kpis={kpis}
        rightPanel={rightPanel}
        rightPanelWidth="lg:w-[300px] xl:w-[320px] 2xl:w-[340px]"
      >
        {/* ── Tab bar ── */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {(['All', 'Completed', 'Pending', 'Abnormal'] as ActiveTab[]).map((tab) => {
            const icons: Record<ActiveTab, React.ReactNode> = {
              All:       <FlaskConical className="w-3.5 h-3.5" />,
              Completed: <CheckCircle2 className="w-3.5 h-3.5" />,
              Pending:   <Clock className="w-3.5 h-3.5" />,
              Abnormal:  <AlertTriangle className="w-3.5 h-3.5" />,
            };
            const tabColors: Record<ActiveTab, string> = {
              All:       'bg-blue-600 text-white shadow-2xs',
              Completed: 'bg-emerald-600 text-white shadow-2xs',
              Pending:   'bg-amber-500 text-white shadow-2xs',
              Abnormal:  'bg-rose-500 text-white shadow-2xs',
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? tabColors[tab]
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {icons[tab]}
                {tab} {tab === 'All' ? `(${counts.All})` : `(${counts[tab]})`}
              </button>
            );
          })}
        </div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-400 shadow-2xs">
            <Search className="w-4 h-4 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, test name, or ID..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>
          {['All Departments', 'All Test Types', 'All Statuses'].map((f) => (
            <select key={f} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 shadow-2xs focus:outline-none cursor-pointer appearance-none">
              <option>{f}</option>
            </select>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Select Date Range
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/60">
                  <th className="py-3 px-3 w-8">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                  </th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Test Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Result</th>
                  <th className="py-3 px-3">Reference Range</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={checkedIds.has(r.id)}
                        onChange={() => toggleCheck(r.id)}
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={r.avatar} alt={r.patient} className="w-8 h-8 rounded-full object-cover ring-1 ring-white shadow-2xs shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">{r.patient}</div>
                          <div className="text-[10px] text-slate-400">{r.pid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{r.test}</td>
                    <td className="py-3 px-3 text-slate-500">{r.department}</td>
                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-pre-line leading-relaxed text-[10px]">{r.result}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-pre-line leading-relaxed text-[10px]">{r.reference}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-700 font-semibold">{r.date}</div>
                      <div className="text-[10px] text-slate-400">{r.time}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="View"
                          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Download"
                          className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/40">
            <span className="text-[11px] text-slate-500 font-medium">
              Showing 1-{filtered.length} of {counts.All} results
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, '...', 13].map((p, i) => (
                <button
                  key={i}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === p
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              Rows per page:
              <select className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </DoctorPageShell>

      <DoctorLabOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
