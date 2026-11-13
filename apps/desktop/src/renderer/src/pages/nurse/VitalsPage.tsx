import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Heart,
  Thermometer,
  Wind,
  Phone,
  Mail,
  MapPin,
  Pill,
  FlaskConical,
  FileText,
  AlertTriangle,
  Check,
  Scale,
  Ruler,
  RefreshCw,
  Clock,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { NursePageShell } from '../../components/nurse/NursePageShell';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import RecordVitalsModal from '../../components/nurse/RecordVitalsModal';
import AdministerMedModal from '../../components/nurse/AdministerMedModal';
import CollectLabModal from '../../components/nurse/CollectLabModal';
import AddNoteModal from '../../components/nurse/AddNoteModal';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchPatientVitals, recordVitals } from '../../api/clinical';
import type { VitalReadingDTO, PatientDTO, CreateVitalReadingRequest } from '@mcms/contracts';

interface FormattedPatientItem {
  id: string;
  pid: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  avatar: string;
  phone: string;
  email: string;
  address: string;
  room: string;
  bed: string;
  department: string;
  status: string;
  vitalsStatus: string;
  latestVitals?: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
  };
}

export function VitalsPage() {
  const { accessToken } = useAuth();

  // Patient state
  const [patients, setPatients] = useState<FormattedPatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<FormattedPatientItem | null>(null);
  const [liveVitals, setLiveVitals] = useState<VitalReadingDTO[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);

  const [activeMetricTab, setActiveMetricTab] = useState<'temp' | 'bp' | 'hr' | 'spo2'>('temp');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Modals state
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Load live patients
  const loadPatients = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingPatients(true);
    try {
      const res = await fetchPatients(accessToken, { limit: 100 });
      if (res && res.data && res.data.length > 0) {
        const mapped: FormattedPatientItem[] = res.data.map((p, idx) => {
          const name = p.fullName || `${p.firstName} ${p.lastName}`.trim();
          const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear() : 1995;
          const age = Math.max(0, new Date().getFullYear() - birthYear);
          return {
            id: p.id,
            pid: p.pid || `PID-${p.id.slice(0, 6).toUpperCase()}`,
            name,
            age,
            gender: p.gender?.toUpperCase() === 'MALE' ? 'Male' : 'Female',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            phone: p.phoneNumber || '—',
            email: p.email || '—',
            address: p.address || 'Addis Ababa, Ethiopia',
            room: `Ward ${Math.floor(idx / 4) + 1}A`,
            bed: `Bed 0${(idx % 6) + 1}`,
            department: 'General Nursing & Triage',
            status: p.status === 'ACTIVE' ? 'In Care' : 'Completed',
            vitalsStatus: 'Normal',
          };
        });
        setPatients(mapped);
        setSelectedPatient((prev) => {
          if (prev) {
            const found = mapped.find((m) => m.id === prev.id);
            if (found) return found;
          }
          return mapped[0] ?? null;
        });
      } else {
        setPatients([]);
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Failed to load patients for vitals page:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  }, [accessToken]);

  // Load vitals for selected patient
  const loadVitalsForPatient = useCallback(
    async (patientId: string) => {
      if (!accessToken || !patientId) return;
      setIsLoadingVitals(true);
      try {
        const data = await fetchPatientVitals(patientId, accessToken, 20);
        setLiveVitals(data || []);
        if (data && data.length > 0) {
          const latest = data[0]!;
          setSelectedPatient((prev) => {
            if (!prev || prev.id !== patientId) return prev;
            return {
              ...prev,
              latestVitals: {
                bp: `${latest.systolicBp}/${latest.diastolicBp}`,
                hr: latest.heartRate,
                temp: latest.temperature,
                spo2: latest.spo2,
              },
            };
          });
        }
      } catch (err) {
        console.error('Failed to load vitals for patient:', err);
        setLiveVitals([]);
      } finally {
        setIsLoadingVitals(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (selectedPatient?.id) {
      void loadVitalsForPatient(selectedPatient.id);
    }
  }, [selectedPatient?.id, loadVitalsForPatient]);

  const handleActionSuccess = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    if (selectedPatient?.id) {
      void loadVitalsForPatient(selectedPatient.id);
    }
    void loadPatients();
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q) || p.room.toLowerCase().includes(q);
  });

  // Chart telemetry formatting
  const chartData = useMemo(() => {
    if (!liveVitals || liveVitals.length === 0) return [];
    return liveVitals
      .slice()
      .reverse()
      .map((v) => ({
        time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: v.temperature,
        bp: v.systolicBp,
        systolic: v.systolicBp,
        diastolic: v.diastolicBp,
        hr: v.heartRate,
        spo2: v.spo2,
      }));
  }, [liveVitals]);

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Activity size={18} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Vitals Triage & Monitoring</h1>
          <p className="text-xs text-gray-400 mt-0.5">Observe, measure and record live ward biometric trends</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            void loadPatients();
            if (selectedPatient?.id) void loadVitalsForPatient(selectedPatient.id);
          }}
          disabled={isLoadingPatients || isLoadingVitals}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw size={13} className={isLoadingPatients || isLoadingVitals ? 'animate-spin text-blue-600' : ''} />
        </button>
        <button
          onClick={() => setVitalsModalOpen(true)}
          disabled={!selectedPatient}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Activity size={13} />
          <span>New Reading</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      <NurseStatCard
        label="Patients in Ward"
        value={String(patients.length)}
        color="blue"
        trend="Active registry"
        trendUp={true}
        icon={Users}
      />
      <NurseStatCard
        label="Biometric Logs"
        value={String(liveVitals.length)}
        color="green"
        trend="Recorded for patient"
        trendUp={true}
        icon={Check}
      />
      <NurseStatCard
        label="Last Heart Rate"
        value={selectedPatient?.latestVitals ? `${selectedPatient.latestVitals.hr} bpm` : '—'}
        color="purple"
        trend="Resting pulse"
        trendUp={true}
        icon={Heart}
      />
      <NurseStatCard
        label="Last SpO₂"
        value={selectedPatient?.latestVitals ? `${selectedPatient.latestVitals.spo2}%` : '—'}
        color="cyan"
        trend="Oxygen saturation"
        trendUp={true}
        icon={Wind}
      />
    </div>
  );

  const rightPanelContent = (
    <div className="space-y-3">
      {/* Patient Profile Card */}
      {selectedPatient ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Selected Patient</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedPatient.room} · {selectedPatient.bed}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={selectedPatient.avatar}
              alt={selectedPatient.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-gray-900 truncate leading-tight">{selectedPatient.name}</h3>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedPatient.pid}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {selectedPatient.age}y · {selectedPatient.gender} · {selectedPatient.department}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-gray-400" />
              <span className="text-[11px]">{selectedPatient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-[11px] truncate">{selectedPatient.address}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-gray-100">
            <button
              onClick={() => setAdministerModalOpen(true)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Pill size={12} className="text-purple-600" />
              <span>Medication</span>
            </button>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <FileText size={12} className="text-blue-600" />
              <span>Add Note</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 text-center text-gray-400 text-xs">
          Select a patient to inspect biometrics.
        </div>
      )}

      {/* Observation History Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Observation Logs</h4>
        {isLoadingVitals ? (
          <div className="py-6 text-center text-gray-400 text-xs">
            <RefreshCw size={14} className="animate-spin text-blue-600 mx-auto mb-1" />
            Loading vitals history...
          </div>
        ) : liveVitals.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No recorded vitals on file.</p>
        ) : (
          <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto">
            {liveVitals.slice(0, 6).map((r) => (
              <div key={r.id} className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 text-[11px]">
                    {new Date(r.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    {new Date(r.recordedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-700 text-xs">{r.systolicBp}/{r.diastolicBp} mmHg</span>
                  <span className="text-[10px] text-gray-400 block">
                    {r.heartRate} bpm · {r.temperature}°C · {r.spo2}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <NursePageShell header={headerContent} kpis={kpisContent} rightPanel={rightPanelContent}>
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check size={14} className="text-emerald-600" />
          <span>Vitals recorded successfully for {selectedPatient?.name}</span>
        </div>
      )}

      {/* ── Metric Chart Section ── */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-gray-800">Biometric Trend Graph</h3>
            <p className="text-xs text-gray-400">
              {selectedPatient ? `Telemetry observation trend for ${selectedPatient.name}` : 'Select a patient'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100/80 p-0.5 rounded-lg">
            {(['temp', 'bp', 'hr', 'spo2'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetricTab(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeMetricTab === m ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {m === 'temp' ? 'Temperature' : m === 'bp' ? 'Blood Pressure' : m === 'hr' ? 'Heart Rate' : 'SpO₂'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44 sm:h-52 w-full pt-3">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              No trend data available. Record vitals to see chart graph.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={activeMetricTab}
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Active Patients Vitals Table ── */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="font-bold text-sm text-gray-800">Ward Vitals Monitoring Board</h3>
            <p className="text-xs text-gray-400">Click a patient row to inspect biometric telemetry</p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Latest BP</th>
                <th className="py-2.5 px-3">Heart Rate</th>
                <th className="py-2.5 px-3">Temp</th>
                <th className="py-2.5 px-3">SpO₂</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingPatients ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    <RefreshCw size={20} className="animate-spin text-blue-600 mx-auto mb-1" />
                    Loading patients...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No patients found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div>
                            <span className="font-bold text-gray-800 block leading-tight">{p.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{p.pid}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-700">{p.room}</td>
                      <td className="py-2 px-3 font-mono font-bold text-gray-800">
                        {p.latestVitals ? p.latestVitals.bp : '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {p.latestVitals ? `${p.latestVitals.hr} bpm` : '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {p.latestVitals ? `${p.latestVitals.temp}°C` : '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {p.latestVitals ? `${p.latestVitals.spo2}%` : '—'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        onSave={handleActionSuccess}
        selectedPatientId={selectedPatient?.id}
      />
      <AdministerMedModal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
      />
      <CollectLabModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
      />
      <AddNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
      />
    </NursePageShell>
  );
}

export default React.memo(VitalsPage);
