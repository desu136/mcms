'use client';

import { useState, useEffect, useCallback } from 'react';
import NurseStatCard from '@/components/nurse/NurseStatCard';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchPatients } from '@/lib/api/patients';
import { fetchPatientVitals, fetchMedAdmins } from '@/lib/api/clinical';
import { fetchAppointments } from '@/lib/api/appointments';
import {
  Users,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  FileText,
  Pill,
  FlaskConical,
  UserCircle,
  RefreshCw,
  Clock,
  Calendar,
} from 'lucide-react';
import NursePatientDetailsModal from '@/components/nurse/NursePatientDetailsModal';
import RecordVitalsModal from '@/components/nurse/RecordVitalsModal';
import AdministerMedModal from '@/components/nurse/AdministerMedModal';
import CollectLabModal from '@/components/nurse/CollectLabModal';
import AddNoteModal from '@/components/nurse/AddNoteModal';
import type { PatientDTO, VitalReadingDTO, MedicationAdminDTO, AppointmentDTO } from '@mcms/contracts';

interface FormattedPatient {
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
  visitReason: string;
  status: 'In Care' | 'In Ward' | 'Waiting' | 'Completed' | 'Critical';
  vitalsStatus: 'Normal' | 'High BP' | 'Critical' | 'Low BP' | 'Elevated';
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
  };
  doctor: string;
  admissionDate: string;
}

type RightTab = 'Overview' | 'Vitals History' | 'Medications' | 'Appointments';

export default function NursePatientsPage() {
  const { accessToken } = useAuth();
  const [patients, setPatients] = useState<FormattedPatient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [rightTab, setRightTab] = useState<RightTab>('Overview');
  const [selectedPatient, setSelectedPatient] = useState<FormattedPatient | null>(null);

  // Live sub-records for selected patient
  const [selectedVitals, setSelectedVitals] = useState<VitalReadingDTO[]>([]);
  const [selectedMeds, setSelectedMeds] = useState<MedicationAdminDTO[]>([]);
  const [selectedAppts, setSelectedAppts] = useState<AppointmentDTO[]>([]);
  const [isLoadingSubData, setIsLoadingSubData] = useState(false);

  // Modals state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const rowsPerPage = 10;

  const loadPatients = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const res = await fetchPatients(accessToken, { limit: 100 });
      if (res && res.data && res.data.length > 0) {
        const mapped: FormattedPatient[] = res.data.map((p, idx) => {
          const age = p.dateOfBirth
            ? Math.max(0, new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear())
            : 30;
          return {
            id: p.id,
            pid: p.pid,
            name: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
            age,
            gender: p.gender === 'MALE' ? 'Male' : 'Female',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.firstName)}`,
            phone: p.phoneNumber || '—',
            email: p.email || '—',
            address: p.address || 'Addis Ababa, Ethiopia',
            room: `Ward ${Math.floor(idx / 4) + 1}A`,
            bed: `Bed 0${(idx % 6) + 1}`,
            department: 'Inpatient & Triage',
            visitReason: 'Clinical care & monitoring',
            status: p.status === 'ACTIVE' ? 'In Care' : 'Completed',
            vitalsStatus: 'Normal',
            vitals: { bp: '—', hr: 0, temp: 0, spo2: 0 },
            doctor: 'Attending Physician',
            admissionDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A',
          };
        });
        setPatients(mapped);
        if (!selectedPatient && mapped[0]) {
          setSelectedPatient(mapped[0]);
        }
      } else {
        setPatients([]);
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Failed to load patients for nurse portal:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedPatient]);

  // Load sub-records when selectedPatient changes
  useEffect(() => {
    if (!accessToken || !selectedPatient) return;
    let mounted = true;
    setIsLoadingSubData(true);

    Promise.allSettled([
      fetchPatientVitals(selectedPatient.id, accessToken, 10),
      fetchMedAdmins(accessToken, { patientId: selectedPatient.id }),
      fetchAppointments(accessToken, { patientId: selectedPatient.id }),
    ]).then(([vRes, mRes, aRes]) => {
      if (!mounted) return;
      if (vRes.status === 'fulfilled') setSelectedVitals(vRes.value);
      if (mRes.status === 'fulfilled') setSelectedMeds(mRes.value);
      if (aRes.status === 'fulfilled') setSelectedAppts(aRes.value);
      setIsLoadingSubData(false);
    });

    return () => {
      mounted = false;
    };
  }, [accessToken, selectedPatient]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const filtered = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.pid.toLowerCase().includes(q) ||
      p.visitReason.toLowerCase().includes(q);
    const matchTab =
      activeTab === 'all' ||
      p.status.toLowerCase() === activeTab.toLowerCase() ||
      (activeTab === 'In Care' && (p.status === 'In Ward' || p.status === 'In Care'));
    const matchDept = selectedDept === 'All Departments' || p.department === selectedDept;
    const matchStatus = selectedStatus === 'All Statuses' || p.status === selectedStatus;
    return matchQ && matchTab && matchDept && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleOpenDetails = (patient: FormattedPatient) => {
    setSelectedPatient(patient);
    setDetailsModalOpen(true);
  };

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main content table view */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                My Assigned Patients
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor assigned patients, vital signs history, and administered treatments.
              </p>
            </div>
          </div>
          <button
            onClick={() => void loadPatients()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw size={13} className={`text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Patients</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard
            icon={<Users size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
            label="Total Patients"
            value={isLoading ? '—' : patients.length}
            trend="Active registered list"
            trendUp
          />
          <NurseStatCard
            icon={<Activity size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="In Active Care"
            value={isLoading ? '—' : patients.filter((p) => p.status === 'In Care').length}
            trend="Under clinical monitoring"
            trendUp
          />
          <NurseStatCard
            icon={<CheckCircle2 size={18} className="text-purple-600" />}
            iconBg="bg-purple-50"
            label="Completed Visits"
            value={isLoading ? '—' : patients.filter((p) => p.status === 'Completed').length}
            trend="Discharged & followed up"
            trendUp
          />
          <NurseStatCard
            icon={<AlertCircle size={18} className="text-rose-600" />}
            iconBg="bg-rose-50"
            label="Requiring Triage"
            value={isLoading ? '—' : patients.slice(0, 3).length}
            trend="Scheduled today"
            trendUp={false}
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient by name, PID, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="In Care">In Care</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">PID</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading patient records...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No patients found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((patient) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    return (
                      <tr
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{patient.name}</p>
                              <p className="text-[10px] text-slate-400">{patient.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {patient.pid}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {patient.age}y • {patient.gender}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {patient.room} ({patient.bed})
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              patient.status === 'In Care'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedPatient(patient);
                                setVitalsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition shadow-2xs"
                              title="Record Vitals"
                            >
                              <Heart size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenDetails(patient)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition shadow-2xs"
                              title="View Chart"
                            >
                              <Eye size={13} />
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

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} patients
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                    currentPage === n
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side details drawer for selected patient */}
      <aside className="w-80 xl:w-96 border-l border-slate-200/90 bg-white overflow-y-auto p-4 space-y-4 shrink-0 shadow-2xs">
        {selectedPatient ? (
          <>
            {/* Patient Header Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shadow-2xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {selectedPatient.name}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedPatient.pid} • {selectedPatient.age}y • {selectedPatient.gender}
                  </p>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    {selectedPatient.room} • {selectedPatient.bed}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{selectedPatient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{selectedPatient.address}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/80">
                <button
                  onClick={() => setVitalsModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Heart size={12} />
                  <span>Record Vitals</span>
                </button>
                <button
                  onClick={() => setAdministerModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Pill size={12} className="text-purple-600" />
                  <span>Administer Med</span>
                </button>
                <button
                  onClick={() => setLabModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <FlaskConical size={12} className="text-teal-600" />
                  <span>Collect Lab</span>
                </button>
                <button
                  onClick={() => setNoteModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <FileText size={12} className="text-slate-600" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs: Vitals History, Medications, Appointments */}
            <div className="space-y-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(['Overview', 'Vitals History', 'Medications', 'Appointments'] as RightTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setRightTab(tab)}
                      className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                        rightTab === tab
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>

              {/* Tab: Overview */}
              {rightTab === 'Overview' && (
                <div className="space-y-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity size={14} className="text-blue-600" />
                      <span>Latest Recorded Vitals</span>
                    </h4>
                    {selectedVitals.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No vitals recorded yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                          <span className="font-bold text-slate-800">
                            {selectedVitals[0]!.systolicBp}/{selectedVitals[0]!.diastolicBp} mmHg
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                          <span className="font-bold text-rose-600">
                            {selectedVitals[0]!.heartRate} bpm
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Temperature</span>
                          <span className="font-bold text-amber-600">
                            {selectedVitals[0]!.temperature}°C
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                          <span className="font-bold text-cyan-600">
                            {selectedVitals[0]!.spo2}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Vitals History */}
              {rightTab === 'Vitals History' && (
                <div className="space-y-2">
                  {isLoadingSubData ? (
                    <div className="py-6 text-center text-xs text-slate-400">Loading vitals...</div>
                  ) : selectedVitals.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No vitals history on record.
                    </div>
                  ) : (
                    selectedVitals.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {v.systolicBp}/{v.diastolicBp} mmHg • {v.heartRate} bpm
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.condition === 'CRITICAL'
                                ? 'bg-red-100 text-red-700'
                                : v.condition === 'NORMAL'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {v.condition}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            {v.temperature}°C • SpO2: {v.spo2}%
                          </span>
                          <span>{new Date(v.recordedAt).toLocaleString()}</span>
                        </div>
                        {v.notes && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {v.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Medications */}
              {rightTab === 'Medications' && (
                <div className="space-y-2">
                  {selectedMeds.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No medications administered for this patient.
                    </div>
                  ) : (
                    selectedMeds.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{m.medicationName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                            {m.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          Dose: {m.dose} • Route: {m.route}
                        </p>
                        {m.instructions && (
                          <p className="text-[11px] text-slate-400 italic">{m.instructions}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Appointments */}
              {rightTab === 'Appointments' && (
                <div className="space-y-2">
                  {selectedAppts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No appointment bookings on record.
                    </div>
                  ) : (
                    selectedAppts.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{a.reason || 'Consultation'}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            {a.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {new Date(a.appointmentDate).toLocaleDateString()} at {a.startTime}
                        </p>
                        <p className="text-[11px] text-slate-400">Doctor: {a.doctorName || 'Assigned'}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Select a patient to inspect medical chart.
          </div>
        )}
      </aside>

      {/* Modals */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
        onSave={() => {
          if (selectedPatient) {
            void fetchPatientVitals(selectedPatient.id, accessToken).then((res) =>
              setSelectedVitals(res),
            );
          }
        }}
      />

      <AdministerMedModal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
        selectedPatientId={selectedPatient?.id}
        onAdminister={() => {
          if (selectedPatient) {
            void fetchMedAdmins(accessToken, { patientId: selectedPatient.id }).then((res) =>
              setSelectedMeds(res),
            );
          }
        }}
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

      {selectedPatient && (
        <NursePatientDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          patient={selectedPatient}
          onRecordVitals={() => setVitalsModalOpen(true)}
          onAdministerMed={() => setAdministerModalOpen(true)}
          onCollectSample={() => setLabModalOpen(true)}
        />
      )}
    </div>
  );
}
