import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  User,
  Phone,
  Mail,
  Activity,
} from 'lucide-react';
import { INITIAL_PATIENTS, PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';

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

const ALL_RESULTS: LabRow[] = [
  {
    id: 'l1',
    patient: 'Aster Mulu',
    pid: 'PID-001024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    test: 'Complete Blood Count (CBC)',
    department: 'Hematology',
    result: 'WBC: 7.8 ×10³/µL\nHgb: 13.2 g/dL',
    reference: '4.0 - 11.0\n12.0 - 16.0',
    status: 'Completed',
    date: 'Oct 18, 2026',
    time: '09:15 AM',
  },
  {
    id: 'l2',
    patient: 'Samuel Girma',
    pid: 'PID-001087',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    test: 'Liver Function Test (LFT)',
    department: 'Biochemistry',
    result: 'ALT: 28 U/L\nAST: 22 U/L',
    reference: '0 - 40\n0 - 40',
    status: 'Completed',
    date: 'Oct 18, 2026',
    time: '08:40 AM',
  },
  {
    id: 'l3',
    patient: 'Lidya Kebede',
    pid: 'PID-001062',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&auto=format&fit=crop&q=80',
    test: 'Cardiac Troponin I',
    department: 'Cardiology',
    result: '0.08 ng/mL (Slightly Elevated)',
    reference: '< 0.04 ng/mL',
    status: 'Abnormal',
    date: 'Oct 17, 2026',
    time: '11:20 AM',
  },
  {
    id: 'l4',
    patient: 'Betlehem Abebe',
    pid: 'PID-001098',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80',
    test: 'Comprehensive Lipid Panel',
    department: 'Biochemistry',
    result: 'Processing in Central Lab',
    reference: 'Standard Adult Range',
    status: 'Pending',
    date: 'Oct 19, 2026',
    time: '08:10 AM',
  },
];

export function LabResultsPage() {
  const [labList, setLabList] = useState<LabRow[]>(ALL_RESULTS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLab, setSelectedLab] = useState<LabRow>(ALL_RESULTS[0]!);

  // Modals & Drawers
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPatient, setDrawerPatient] = useState<PatientItem | null>(null);

  const filteredLabs = labList.filter((row) => {
    if (activeTab !== 'All' && row.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        row.test.toLowerCase().includes(q) ||
        row.patient.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.pid.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenPatientProfile = (patientName: string) => {
    const match = INITIAL_PATIENTS.find((p) => p.name === patientName) || INITIAL_PATIENTS[0]!;
    setDrawerPatient(match);
    setDrawerOpen(true);
  };

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
          <FlaskConical className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Laboratory Results
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Clinical diagnostics, pathology reports, reference thresholds, and abnormal indicators.
          </p>
        </div>
      </div>

      <button
        onClick={() => setLabModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all self-start md:self-auto cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Order Lab Test
      </button>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Lab Tests"
        value={142}
        icon={FlaskConical}
        color="orange"
        change={{ value: '+14', trend: 'up', label: 'this month' }}
      />
      <DoctorStatCard
        title="Completed Results"
        value={126}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '+10', trend: 'up', label: 'verified' }}
      />
      <DoctorStatCard
        title="Pending Analysis"
        value={10}
        icon={Clock}
        color="blue"
        change={{ value: '+2', trend: 'up', label: 'in process' }}
      />
      <DoctorStatCard
        title="Abnormal Indicators"
        value={6}
        icon={AlertTriangle}
        color="rose"
        change={{ value: '-1', trend: 'down', label: 'flagged' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Selected Lab Test Deep Dive */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-slate-800">Test Inspection</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedLab.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : selectedLab.status === 'Abnormal'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {selectedLab.status}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnostic Test</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedLab.test}</div>
            <div className="text-[11px] text-slate-500">{selectedLab.department}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Test Values:</span>
              <span className="font-bold text-slate-900 whitespace-pre-line text-right">{selectedLab.result}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="text-slate-400 font-semibold">Normal Reference:</span>
              <span className="font-medium text-slate-600 whitespace-pre-line text-right">
                {selectedLab.reference}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sample Date</div>
            <div className="font-semibold text-slate-700">
              {selectedLab.date} at {selectedLab.time}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => handleOpenPatientProfile(selectedLab.patient)}
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Patient Record
          </button>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Patient Profile</h3>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <img
            src={selectedLab.avatar}
            alt={selectedLab.patient}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-100"
          />
          <div>
            <div className="text-sm font-bold text-slate-800">{selectedLab.patient}</div>
            <div className="text-[11px] text-orange-600 font-semibold">{selectedLab.pid}</div>
            <div className="text-[10px] text-slate-400">Specimen Verified by Pathology Lab</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={rightPanelContent}
        rightPanelWidth="lg:w-[320px] xl:w-[360px]"
      >
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Tabs & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['All', 'Completed', 'Pending', 'Abnormal'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lab test, patient, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-5">Patient</th>
                  <th className="py-3 px-5">Diagnostic Test</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Results</th>
                  <th className="py-3 px-5">Reference Range</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLabs.map((row) => {
                  const isSelected = selectedLab.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedLab(row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-orange-50/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.avatar}
                            alt={row.patient}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{row.patient}</div>
                            <div className="text-[11px] text-slate-400">{row.pid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">{row.test}</td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{row.department}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800 whitespace-pre-line">
                        {row.result}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 whitespace-pre-line">{row.reference}</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            row.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : row.status === 'Abnormal'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLab(row);
                            handleOpenPatientProfile(row.patient);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DoctorPageShell>

      <DoctorPatientDrawer
        patient={drawerPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId="p-1"
      />
    </>
  );
}
export default LabResultsPage;
