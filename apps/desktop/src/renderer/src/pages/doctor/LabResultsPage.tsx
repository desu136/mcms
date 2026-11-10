import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  User,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { INITIAL_PATIENTS, PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { useAuth } from '../../auth/AuthContext';
import { fetchLabOrders } from '../../api/clinical';
import type { LabOrderDTO } from '@mcms/contracts';

type LabStatus = 'Completed' | 'Pending' | 'Abnormal';
type ActiveTab = 'All' | 'Completed' | 'Pending' | 'Abnormal';

/** Map live LabOrderDTO to the display shape the UI uses */
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
  /** Live patient UUID for linking to real prescription/lab order modals */
  patientId: string;
}

function mapOrderToRows(order: LabOrderDTO): LabRow[] {
  if (order.results.length === 0) {
    // No results yet — represent as pending row
    return [
      {
        id: order.id,
        patient: order.patientName,
        pid: order.patientPid,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(order.patientName)}&size=80&background=e0e7ff&color=3730a3`,
        test: order.samples.map((s) => s.sampleType).join(', ') || 'Lab Order',
        department: 'Laboratory',
        result: 'Processing in Lab',
        reference: '—',
        status: 'Pending',
        date: new Date(order.orderedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date(order.orderedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        patientId: order.patientId,
      },
    ];
  }
  return order.results.map((r) => {
    const labStatus: LabStatus = r.isAbnormal ? 'Abnormal' : r.verifiedAt ? 'Completed' : 'Pending';
    return {
      id: `${order.id}-${r.id}`,
      patient: order.patientName,
      pid: order.patientPid,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(order.patientName)}&size=80&background=e0e7ff&color=3730a3`,
      test: r.testName,
      department: r.testCategory ?? 'Laboratory',
      result: `${r.value}${r.unit ? ` ${r.unit}` : ''}`,
      reference: r.referenceRange ?? '—',
      status: labStatus,
      date: new Date(r.performedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date(r.performedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      patientId: order.patientId,
    };
  });
}

export function LabResultsPage() {
  const { accessToken } = useAuth();
  const [liveRows, setLiveRows] = useState<LabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLab, setSelectedLab] = useState<LabRow | null>(null);

  // Modals & Drawers
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPatient, setDrawerPatient] = useState<PatientItem | null>(null);

  const loadLabOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orders = await fetchLabOrders(accessToken);
      const rows = orders.flatMap(mapOrderToRows);
      setLiveRows(rows);
      if (rows.length > 0 && !selectedLab) {
        setSelectedLab(rows[0]!);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadLabOrders();
  }, [loadLabOrders]);

  // Merge live rows with mock fallback for display
  const displayRows = liveRows.length > 0 ? liveRows : [];
  const selectedDisplay = selectedLab ?? null;

  const filteredLabs = displayRows.filter((row) => {
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

  // KPI counts derived from live data
  const totalCount = displayRows.length;
  const completedCount = displayRows.filter((r) => r.status === 'Completed').length;
  const pendingCount = displayRows.filter((r) => r.status === 'Pending').length;
  const abnormalCount = displayRows.filter((r) => r.status === 'Abnormal').length;

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

      <div className="flex items-center gap-2">
        <button
          onClick={() => void loadLabOrders()}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => setLabModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Order Lab Test
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Lab Tests"
        value={loading ? '—' : totalCount}
        icon={FlaskConical}
        color="orange"
        change={{ value: '', trend: 'up', label: 'this month' }}
      />
      <DoctorStatCard
        title="Completed Results"
        value={loading ? '—' : completedCount}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '', trend: 'up', label: 'verified' }}
      />
      <DoctorStatCard
        title="Pending Analysis"
        value={loading ? '—' : pendingCount}
        icon={Clock}
        color="blue"
        change={{ value: '', trend: 'up', label: 'in process' }}
      />
      <DoctorStatCard
        title="Abnormal Indicators"
        value={loading ? '—' : abnormalCount}
        icon={AlertTriangle}
        color="rose"
        change={{ value: '', trend: 'down', label: 'flagged' }}
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
          {selectedDisplay && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedDisplay.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : selectedDisplay.status === 'Abnormal'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              {selectedDisplay.status}
            </span>
          )}
        </div>

        {selectedDisplay ? (
          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnostic Test</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedDisplay.test}</div>
              <div className="text-[11px] text-slate-500">{selectedDisplay.department}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Test Values:</span>
                <span className="font-bold text-slate-900 whitespace-pre-line text-right">{selectedDisplay.result}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-400 font-semibold">Normal Reference:</span>
                <span className="font-medium text-slate-600 whitespace-pre-line text-right">
                  {selectedDisplay.reference}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sample Date</div>
              <div className="font-semibold text-slate-700">
                {selectedDisplay.date} at {selectedDisplay.time}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleOpenPatientProfile(selectedDisplay.patient)}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View Patient Record
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">Select a row to inspect</p>
        )}
      </div>

      {/* Patient Information Card */}
      {selectedDisplay && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Patient Profile</h3>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <img
              src={selectedDisplay.avatar}
              alt={selectedDisplay.patient}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-100"
            />
            <div>
              <div className="text-sm font-bold text-slate-800">{selectedDisplay.patient}</div>
              <div className="text-[11px] text-orange-600 font-semibold">{selectedDisplay.pid}</div>
              <div className="text-[10px] text-slate-400">Specimen Verified by Pathology Lab</div>
            </div>
          </div>
        </div>
      )}
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

          {/* Loading / Error / Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Loading lab orders…</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-xs text-rose-600">{error}</div>
          ) : filteredLabs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No lab results found. Order a test above.
            </div>
          ) : (
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
                    const isSelected = selectedDisplay?.id === row.id;
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
          )}
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
        onSuccess={() => void loadLabOrders()}
      />
    </>
  );
}
export default LabResultsPage;
