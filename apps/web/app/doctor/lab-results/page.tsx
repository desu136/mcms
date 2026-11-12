'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Calendar,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import LabReportModal from '../../../components/doctor/LabReportModal';
import { PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchLabOrders } from '../../../lib/api/clinical';
import { fetchPatients } from '../../../lib/api/patients';
import type { LabOrderDTO, PatientDTO } from '@mcms/contracts';

type LabStatus = 'Completed' | 'Pending' | 'Abnormal';
type ActiveTab = 'All' | 'Completed' | 'Pending' | 'Abnormal';

interface LabRow {
  id: string;
  patient: string;
  pid: string;
  patientId: string;
  avatar: string;
  test: string;
  department: string;
  branchName?: string | undefined;
  result: string;
  reference: string;
  status: LabStatus;
  date: string;
  time: string;
  rawOrder: LabOrderDTO;
}

const statusStyle: Record<LabStatus, string> = {
  Completed: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Pending:   'bg-amber-50 text-amber-600 border border-amber-200',
  Abnormal:  'bg-rose-50 text-rose-600 border border-rose-200',
};

export default function DoctorLabResultsPage() {
  const { accessToken } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('All');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<LabOrderDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [selectedLabForReport, setSelectedLabForReport] = useState<LabOrderDTO | null>(null);
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<PatientItem | null>(null);

  const openDrawerForPatient = (patientId: string, pid: string, patientName: string) => {
    const match = patients.find((p) => p.id === patientId || p.pid === pid || p.fullName === patientName);
    if (match) {
      const age = match.dateOfBirth
        ? Math.max(0, new Date().getFullYear() - new Date(match.dateOfBirth).getFullYear())
        : 30;
      setSelectedPatientForDrawer({
        id: match.id,
        name: match.fullName || `${match.firstName} ${match.lastName}`.trim(),
        pid: match.pid || pid,
        age,
        gender: match.gender === 'FEMALE' ? 'Female' : 'Male',
        phone: match.phoneNumber || '—',
        email: match.email || '—',
        address: match.address || 'Addis Ababa, Ethiopia',
        department: 'Diagnostic Laboratory',
        lastVisit: 'Recent',
        lastVisitReason: 'Laboratory Diagnostics',
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(match.fullName)}`,
        totalVisits: 1,
        conditions: [],
      });
    } else {
      setSelectedPatientForDrawer({
        id: patientId,
        name: patientName,
        pid,
        age: 30,
        gender: 'Female',
        phone: '—',
        email: '—',
        address: 'Addis Ababa, Ethiopia',
        department: 'Diagnostic Laboratory',
        lastVisit: 'Recent',
        lastVisitReason: 'Laboratory Diagnostics',
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patientName)}`,
        totalVisits: 1,
        conditions: [],
      });
    }
  };

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [orderRes, patRes] = await Promise.all([
        fetchLabOrders(accessToken),
        fetchPatients(accessToken).then((r) => r.data).catch(() => []),
      ]);
      setOrders(orderRes);
      setPatients(patRes);
    } catch (err) {
      console.error('Failed to load lab orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeResults: LabRow[] = orders.map((o) => {
    const hasAbnormal = o.results?.some((r) => r.isAbnormal);
    const isCompleted = o.status === 'COMPLETED';
    const status: LabStatus = hasAbnormal ? 'Abnormal' : isCompleted ? 'Completed' : 'Pending';
    const firstResult = o.results?.[0];
    const testName = firstResult?.testName || o.samples?.[0]?.sampleType || 'General Lab Order';
    const department = firstResult?.testCategory || 'General Laboratory';
    const resultText = o.results?.length
      ? o.results.map((r) => `${r.testName}: ${r.value} ${r.unit || ''}`.trim()).join('\n')
      : 'Pending Processing';
    const refText = o.results?.length
      ? o.results.map((r) => r.referenceRange || '-').join('\n')
      : '-';
    const d = new Date(o.orderedAt);
    const dateStr = isNaN(d.getTime())
      ? 'Recent'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = isNaN(d.getTime())
      ? '10:00 AM'
      : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return {
      id: o.id,
      patient: o.patientName,
      pid: o.patientPid || o.patientId.slice(0, 8),
      patientId: o.patientId,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(o.patientName)}`,
      test: testName,
      department,
      ...(o.branchName ? { branchName: o.branchName } : {}),
      result: resultText,
      reference: refText,
      status,
      date: dateStr,
      time: timeStr,
      rawOrder: o,
    };
  });

  const filtered = activeResults.filter((r) => {
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
    All: activeResults.length,
    Completed: activeResults.filter((r) => r.status === 'Completed').length,
    Pending:   activeResults.filter((r) => r.status === 'Pending').length,
    Abnormal:  activeResults.filter((r) => r.status === 'Abnormal').length,
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const highlightedPatient = patients.length > 0 ? patients[0] : null;

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Lab Results</h1>
            <button
              onClick={() => void loadData()}
              disabled={isLoading}
              title="Refresh results"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View and manage laboratory test orders, review diagnostic results, and track patient status.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <div className="leading-tight">
            <div className="font-bold text-slate-800">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Order Lab Test
        </button>
      </div>
    </div>
  );

  const kpis = (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {[
        { label: 'Total Orders',     val: counts.All,       color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100',    icon: FlaskConical },
        { label: 'Completed Tests',  val: counts.Completed, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
        { label: 'Pending Results',  val: counts.Pending,   color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100',   icon: Clock },
        { label: 'Abnormal Findings',val: counts.Abnormal,  color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-100',    icon: AlertTriangle },
      ].map(({ label, val, color, bg, border, icon: Icon }) => (
        <div key={label} className={`p-4 rounded-2xl bg-white border ${border} shadow-2xs flex items-center gap-3.5`}>
          <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {isLoading ? '—' : val}
            </div>
            <div className="text-xs text-slate-500 font-medium">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const rightPanel = (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Highlighted Patient</h3>
          </div>
          {highlightedPatient && (
            <button
              onClick={() => openDrawerForPatient(highlightedPatient.id, highlightedPatient.pid, highlightedPatient.fullName)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View Chart
            </button>
          )}
        </div>

        {highlightedPatient ? (
          <>
            <div className="mt-3 flex items-start gap-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(highlightedPatient.fullName)}`}
                alt={highlightedPatient.fullName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-black text-slate-900">{highlightedPatient.fullName}</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {highlightedPatient.pid}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {highlightedPatient.dateOfBirth
                    ? `${Math.max(0, new Date().getFullYear() - new Date(highlightedPatient.dateOfBirth).getFullYear())} years`
                    : 'Age —'} • {highlightedPatient.gender === 'FEMALE' ? 'Female' : 'Male'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{highlightedPatient.phoneNumber || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{highlightedPatient.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{highlightedPatient.address || 'Addis Ababa, Ethiopia'}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Order New Lab for Patient
              </button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No patient currently loaded.
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800">Quick Diagnostic Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Order Lab Test</span>
          </button>
          <button
            onClick={() => void loadData()}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Sync Lab Feed</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DoctorPageShell header={header} kpis={kpis} rightPanel={rightPanel}>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Top toolbar */}
          <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
              {(['All', 'Completed', 'Pending', 'Abnormal'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[200px] sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, test, or PID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) setCheckedIds(new Set(filtered.map((r) => r.id)));
                        else setCheckedIds(new Set());
                      }}
                      checked={filtered.length > 0 && checkedIds.size === filtered.length}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Test / Order</th>
                  <th className="py-3 px-4">Results</th>
                  <th className="py-3 px-4">Ref Range</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading laboratory test results...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FlaskConical className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">No laboratory test orders found</p>
                        <p className="text-[11px] text-slate-400">Request diagnostic laboratory panels for your patients.</p>
                        <button
                          onClick={() => setModalOpen(true)}
                          className="mt-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
                        >
                          + Order Lab Test
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => openDrawerForPatient(r.patientId, r.pid, r.patient)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checkedIds.has(r.id)}
                          onChange={() => toggleCheck(r.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={r.avatar} alt={r.patient} className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate">
                              {r.patient}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{r.pid}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{r.test}</div>
                        <div className="text-[11px] text-slate-400">{r.department}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-pre-line font-medium text-slate-700">
                        {r.result}
                      </td>

                      <td className="py-3.5 px-4 whitespace-pre-line text-slate-400 font-mono text-[11px]">
                        {r.reference}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle[r.status]}`}>
                          {r.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.date}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="View Full Report"
                            onClick={() => setSelectedLabForReport(r.rawOrder)}
                            className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="View Patient Chart"
                            onClick={() => openDrawerForPatient(r.patientId, r.pid, r.patient)}
                            className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 font-medium">
            <span>
              Showing {filtered.length} of {activeResults.length} test orders
            </span>
          </div>
        </div>
      </DoctorPageShell>

      <DoctorLabOrderModal
        isOpen={modalOpen}
        onClose={() => { void loadData(); setModalOpen(false); }}
        {...(highlightedPatient?.id ? { patientId: highlightedPatient.id } : {})}
      />

      <LabReportModal
        isOpen={Boolean(selectedLabForReport)}
        onClose={() => setSelectedLabForReport(null)}
        order={selectedLabForReport}
      />

      <DoctorPatientDrawer
        isOpen={Boolean(selectedPatientForDrawer)}
        onClose={() => setSelectedPatientForDrawer(null)}
        patient={selectedPatientForDrawer}
        onOpenPrescriptionModal={() => {}}
        onOpenLabModal={() => setModalOpen(true)}
      />
    </>
  );
}
