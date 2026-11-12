import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorReferralModal } from '../../components/doctor/DoctorReferralModal';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { useAuth } from '../../auth/AuthContext';
import { fetchPrescriptions, updatePrescription } from '../../api/clinical';
import { fetchPatients } from '../../api/patients';
import type { PrescriptionDTO } from '@mcms/contracts';

type PrescriptionStatus = 'Active' | 'Completed' | 'Pending Refill' | 'Cancelled';

/** Display shape derived from live PrescriptionDTO */
interface DisplayRx {
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
  status: PrescriptionStatus;
  department: string;
  /** Live patient UUID for linking */
  patientId: string;
}

function mapApiStatus(apiStatus: string): PrescriptionStatus {
  switch (apiStatus.toUpperCase()) {
    case 'ACTIVE': return 'Active';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return 'Active';
  }
}

function mapPrescriptionToDisplay(dto: PrescriptionDTO): DisplayRx {
  const firstItem = dto.items[0];
  return {
    id: dto.id,
    prescriptionId: `RX-${dto.id.slice(0, 8).toUpperCase()}`,
    patient: {
      name: dto.patientName,
      pid: dto.patientPid,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.patientName)}&size=80&background=dbeafe&color=1e40af`,
      age: 0,
      gender: '—',
    },
    medication: firstItem?.medicationName ?? 'See prescription details',
    dosage: firstItem?.dosage ?? '—',
    duration: firstItem?.duration ?? '—',
    prescribedDate: new Date(dto.createdAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    status: mapApiStatus(dto.status),
    department: 'General',
    patientId: dto.patientId,
  };
}

export function PrescriptionsPage() {
  const { accessToken } = useAuth();
  const [rxList, setRxList] = useState<DisplayRx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Pending Refill' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState<DisplayRx | null>(null);

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPatient, setDrawerPatient] = useState<PatientItem | null>(null);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrescriptions(accessToken);
      const mapped = data.map(mapPrescriptionToDisplay);
      setRxList(mapped);
      if (mapped.length > 0 && !selectedRx) {
        setSelectedRx(mapped[0]!);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadPrescriptions();
  }, [loadPrescriptions]);

  const filteredRx = rxList.filter((item) => {
    if (activeTab !== 'All' && item.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.prescriptionId.toLowerCase().includes(q) ||
        item.medication.toLowerCase().includes(q) ||
        item.patient.name.toLowerCase().includes(q) ||
        item.patient.pid.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCancel = async (rx: DisplayRx) => {
    try {
      await updatePrescription(rx.id, { status: 'CANCELLED' }, accessToken);
      void loadPrescriptions();
    } catch {
      // offline fallback
      try {
        await (window as any).electron?.ipcRenderer?.invoke('enqueue-operation', {
          type: 'UPDATE_PRESCRIPTION',
          payload: { id: rx.id, status: 'CANCELLED' },
        });
      } catch { /* ignore */ }
    }
  };

  const handleOpenPatientProfile = async (patientId: string, patientName: string) => {
    try {
      const res = await fetchPatients(accessToken, { search: patientName, limit: 1 });
      const p = res?.data?.[0];
      if (p) {
        const isFemale = (p.gender || '').toLowerCase().startsWith('f');
        const age = p.dateOfBirth ? Math.max(1, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) : 35;
        setDrawerPatient({
          id: p.id,
          name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
          pid: p.pid,
          age,
          gender: isFemale ? 'Female' : 'Male',
          phone: p.phoneNumber || '—',
          email: p.email || '—',
          address: p.address || 'Addis Ababa, Ethiopia',
          department: 'General OPD',
          lastVisit: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          lastVisitReason: 'Prescription Consultation',
          status: p.status === 'INACTIVE' ? 'Inactive' : 'Active',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName || p.firstName)}&size=150&background=dbeafe&color=1e40af`,
          totalVisits: 1,
          conditions: [],
        });
      } else {
        setDrawerPatient(null);
      }
    } catch {
      setDrawerPatient(null);
    }
    setDrawerOpen(true);
  };

  // KPI stats
  const totalRx = rxList.length;
  const activeRx = rxList.filter((r) => r.status === 'Active').length;
  const refillRx = rxList.filter((r) => r.status === 'Pending Refill').length;
  const cancelledRx = rxList.filter((r) => r.status === 'Cancelled').length;

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Pill className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Prescriptions
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Electronic prescription records, medication orders, and dosage management.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => void loadPrescriptions()}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Prescription
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Prescriptions"
        value={loading ? '—' : totalRx}
        icon={Pill}
        color="blue"
        change={{ value: '', trend: 'up', label: 'this month' }}
      />
      <DoctorStatCard
        title="Active Prescriptions"
        value={loading ? '—' : activeRx}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '', trend: 'up', label: 'active records' }}
      />
      <DoctorStatCard
        title="Pending Refills"
        value={loading ? '—' : refillRx}
        icon={Clock}
        color="amber"
        change={{ value: '', trend: 'up', label: 'need renewal' }}
      />
      <DoctorStatCard
        title="Cancelled"
        value={loading ? '—' : cancelledRx}
        icon={XCircle}
        color="rose"
        change={{ value: '', trend: 'down', label: 'discontinued' }}
      />
    </div>
  );

  const rightPanelContent = selectedRx ? (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Prescription Detail</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedRx.status === 'Active'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : selectedRx.status === 'Pending Refill'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : selectedRx.status === 'Cancelled'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {selectedRx.status}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rx ID</div>
            <div className="font-mono font-bold text-blue-600">{selectedRx.prescriptionId}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Medication</div>
            <div className="font-bold text-slate-900">{selectedRx.medication}</div>
            <div className="text-slate-500">{selectedRx.dosage}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</div>
            <div className="font-semibold text-slate-700">{selectedRx.duration}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescribed</div>
            <div className="font-semibold text-slate-700">{selectedRx.prescribedDate}</div>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={() => void handleOpenPatientProfile(selectedRx.patientId, selectedRx.patient.name)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Patient Record
          </button>
          {selectedRx.status === 'Active' && (
            <button
              onClick={() => void handleCancel(selectedRx)}
              className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel Prescription
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center gap-3">
          <img
            src={selectedRx.patient.avatar}
            alt={selectedRx.patient.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div>
            <div className="text-sm font-bold text-slate-800">{selectedRx.patient.name}</div>
            <div className="text-[11px] text-blue-600 font-semibold">{selectedRx.patient.pid}</div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 text-center">
      <p className="text-xs text-slate-400">Select a prescription to inspect</p>
    </div>
  );

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={rightPanelContent}
        rightPanelWidth="lg:w-[300px] xl:w-[340px]"
      >
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Tabs & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['All', 'Active', 'Pending Refill', 'Completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
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
                placeholder="Search medication, Rx ID, patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Loading / Error / Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Loading prescriptions…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-12 text-xs text-rose-600">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          ) : filteredRx.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No prescriptions found. Create a new one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-5">Prescription ID</th>
                    <th className="py-3 px-5">Patient</th>
                    <th className="py-3 px-5">Medication &amp; Dosage</th>
                    <th className="py-3 px-5">Duration</th>
                    <th className="py-3 px-5">Date Prescribed</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRx.map((rx) => {
                    const isSelected = selectedRx?.id === rx.id;
                    return (
                      <tr
                        key={rx.id}
                        onClick={() => setSelectedRx(rx)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-blue-600">{rx.prescriptionId}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={rx.patient.avatar}
                              alt={rx.patient.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{rx.patient.name}</div>
                              <div className="text-[11px] text-slate-400">{rx.patient.pid}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-800">{rx.medication}</div>
                          <div className="text-[11px] text-slate-500 font-semibold">{rx.dosage}</div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">{rx.duration}</td>
                        <td className="py-3.5 px-5 text-slate-500">{rx.prescribedDate}</td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              rx.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : rx.status === 'Pending Refill'
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRx(rx);
                              void handleOpenPatientProfile(rx.patientId, rx.patient.name);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors cursor-pointer"
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
        onOpenPrescriptionModal={() => setModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
        onOpenReferralModal={() => setReferralModalOpen(true)}
      />
      <DoctorPrescriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPatientId={selectedRx?.patientId}
        onSuccess={() => void loadPrescriptions()}
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={selectedRx?.patientId}
        onSuccess={() => void loadPrescriptions()}
      />
      <DoctorReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        patientId={selectedRx?.patientId}
        patientName={selectedRx?.patient.name}
        onSuccess={() => void loadPrescriptions()}
      />
    </>
  );
}
export default PrescriptionsPage;
