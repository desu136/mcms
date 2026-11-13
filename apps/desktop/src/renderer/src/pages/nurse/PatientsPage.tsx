import React, { useState, useEffect, useCallback } from 'react';
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
  Droplets,
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
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import { NursePatient } from '../../components/nurse/nurseMockData';
import NursePatientDetailsModal from '../../components/nurse/NursePatientDetailsModal';
import RecordVitalsModal from '../../components/nurse/RecordVitalsModal';
import AdministerMedModal from '../../components/nurse/AdministerMedModal';
import CollectLabModal from '../../components/nurse/CollectLabModal';
import AddNoteModal from '../../components/nurse/AddNoteModal';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchPatientVitals, fetchMedAdmins } from '../../api/clinical';
import { fetchAppointments } from '../../api/appointments';
import type { PatientDTO, VitalReadingDTO, MedicationAdminDTO, AppointmentDTO } from '@mcms/contracts';

const STATUS_STYLES: Record<string, string> = {
  'In Ward': 'bg-blue-100 text-blue-700',
  'In Care': 'bg-green-100 text-green-700',
  Waiting: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Discharged: 'bg-purple-100 text-purple-700',
  Critical: 'bg-red-100 text-red-700',
};

type RightTab = 'Overview' | 'Vitals History' | 'Medications' | 'Appointments';

function mapPatientDtoToNursePatient(p: PatientDTO, idx: number): NursePatient {
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
    visitReason: p.allergies ? `Allergies: ${p.allergies}` : 'Clinical observation & triage',
    status: p.status === 'ACTIVE' ? 'In Care' : 'Completed',
    vitalsStatus: 'Normal',
    vitals: {
      bp: '—',
      hr: 0,
      temp: 0,
      spo2: 0,
    },
    doctor: 'Attending Physician',
    admissionDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Today',
  };
}

export function PatientsPage() {
  const { accessToken } = useAuth();
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [rightTab, setRightTab] = useState<RightTab>('Overview');
  const [selectedPatient, setSelectedPatient] = useState<NursePatient | null>(null);

  // Sub-records for selected patient
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
        const mapped = res.data.map(mapPatientDtoToNursePatient);
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
      console.error('Failed to load patients for nurse desktop:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Load live sub-records when selectedPatient changes
  useEffect(() => {
    if (!accessToken || !selectedPatient) {
      setSelectedVitals([]);
      setSelectedMeds([]);
      setSelectedAppts([]);
      return;
    }
    let mounted = true;
    setIsLoadingSubData(true);

    Promise.allSettled([
      fetchPatientVitals(selectedPatient.id, accessToken, 10),
      fetchMedAdmins(accessToken, { patientId: selectedPatient.id }),
      fetchAppointments(accessToken, { patientId: selectedPatient.id }),
    ]).then(([vRes, mRes, aRes]) => {
      if (!mounted) return;
      if (vRes.status === 'fulfilled') {
        setSelectedVitals(vRes.value);
        if (vRes.value.length > 0) {
          const latest = vRes.value[0]!;
          setSelectedPatient((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              vitals: {
                bp: `${latest.systolicBp}/${latest.diastolicBp}`,
                hr: latest.heartRate,
                temp: latest.temperature,
                spo2: latest.spo2,
              },
            };
          });
        }
      }
      if (mRes.status === 'fulfilled') setSelectedMeds(mRes.value);
      if (aRes.status === 'fulfilled') setSelectedAppts(aRes.value);
      setIsLoadingSubData(false);
    });

    return () => {
      mounted = false;
    };
  }, [accessToken, selectedPatient?.id]);

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
      p.status === activeTab ||
      (activeTab === 'In Care' && (p.status === 'In Ward' || p.status === 'In Care'));
    const matchDept = selectedDept === 'All Departments' || p.department === selectedDept;
    const matchStatus = selectedStatus === 'All Statuses' || p.status === selectedStatus;
    return matchQ && matchTab && matchDept && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Dynamic counts for tabs & stat cards
  const totalAssigned = patients.length;
  const inCareCount = patients.filter((p) => p.status === 'In Care' || p.status === 'In Ward').length;
  const dischargedCount = patients.filter((p) => p.status === 'Discharged' || p.status === 'Completed').length;
  const criticalCount = patients.filter((p) => p.status === 'Critical').length;

  const tabs = [
    { key: 'all', label: 'All Patients', count: totalAssigned },
    { key: 'In Care', label: 'In Care', count: inCareCount },
    { key: 'Discharged', label: 'Discharged / Done', count: dischargedCount },
    { key: 'Critical', label: 'Critical', count: criticalCount },
  ];

  const handleOpenDetails = (patient: NursePatient) => {
    setSelectedPatient(patient);
    setDetailsModalOpen(true);
  };

  const handleActionSuccess = () => {
    void loadPatients();
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F7FC]">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">My Patients</h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage and monitor all assigned patients in your ward.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadPatients()}
              disabled={isLoading}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Patients"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            </button>
            {selectedPatient && (
              <button
                onClick={() => handleOpenDetails(selectedPatient)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all hover:scale-[1.01] cursor-pointer"
              >
                View Patient Details
              </button>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard icon={Users} label="Total Assigned" value={String(totalAssigned)} trend="Current ward registry" trendUp={true} color="blue" />
          <NurseStatCard icon={Activity} label="In Active Care" value={String(inCareCount)} trend="Under continuous care" trendUp={true} color="green" />
          <NurseStatCard icon={CheckCircle2} label="Discharged / Done" value={String(dischargedCount)} trend="Completed treatments" trendUp={true} color="purple" />
          <NurseStatCard icon={AlertCircle} label="Critical Attention" value={String(criticalCount)} trend={criticalCount > 0 ? 'Requires observation' : 'All vitals stable'} trendUp={criticalCount === 0} color="amber" />
        </div>

        {/* Tab pills */}
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient name, PID, or condition..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 bg-gray-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Departments</option>
              <option>General Nursing & Triage</option>
              <option>Cardiology</option>
              <option>Internal Medicine</option>
              <option>Orthopedics</option>
              <option>Surgery</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Statuses</option>
              <option>In Care</option>
              <option>In Ward</option>
              <option>Waiting</option>
              <option>Completed</option>
              <option>Discharged</option>
              <option>Critical</option>
            </select>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
              <Filter size={13} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-2.5 px-3 w-8">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0" />
                  </th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">Age / Gender</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Reason / Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Admission</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                      Loading patients registry...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      No patients found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((patient) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    return (
                      <tr
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0" />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white shadow-2xs"
                            />
                            <div>
                              <p className="font-bold text-gray-800 leading-tight">{patient.name}</p>
                              <p className="text-[10px] text-gray-400">{patient.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-gray-600 font-mono font-medium text-[11px]">{patient.pid}</td>
                        <td className="py-2 px-3 text-gray-600">
                          {patient.age} / {patient.gender}
                        </td>
                        <td className="py-2 px-3 text-gray-600">{patient.department}</td>
                        <td className="py-2 px-3 text-gray-600 truncate max-w-[140px]">{patient.visitReason}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              STATUS_STYLES[patient.status] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-[11px]">{patient.admissionDate || '—'}</td>
                        <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenDetails(patient)}
                              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
                              title="View Patient Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPatient(patient);
                                setNoteModalOpen(true);
                              }}
                              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                              title="Add Note"
                            >
                              <FileText size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenDetails(patient)}
                              className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                              title="More Options"
                            >
                              <MoreVertical size={13} />
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

          <div className="px-3.5 py-2.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} patients
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    currentPage === n ? 'bg-blue-600 text-white shadow-2xs' : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      {selectedPatient ? (
        <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3 shrink-0">
          {/* Patient Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <UserCircle size={15} className="text-blue-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Patient Details</h3>
              </div>
              <button
                onClick={() => handleOpenDetails(selectedPatient)}
                className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                View Full
              </button>
            </div>
            <div className="flex items-start gap-2.5 mb-2.5">
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-blue-100 shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-gray-800 text-xs sm:text-sm">{selectedPatient.name}</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-[9px] text-green-700 font-semibold">{selectedPatient.status}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {selectedPatient.pid} · {selectedPatient.age}y · {selectedPatient.gender}
                </p>
                <p className="text-[11px] text-blue-600 font-medium">Room {selectedPatient.room}</p>
              </div>
            </div>
            <div className="space-y-1 text-[11px] text-gray-500 mb-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Phone size={11} className="text-gray-400" />
                <span>{selectedPatient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={11} className="text-gray-400" />
                <span>{selectedPatient.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={11} className="text-gray-400" />
                <span>{selectedPatient.address}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-100 mb-2.5 overflow-x-auto">
              {(['Overview', 'Vitals History', 'Medications', 'Appointments'] as RightTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={`text-[11px] px-2 py-1 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    rightTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {isLoadingSubData ? (
              <div className="py-4 text-center text-gray-400 text-xs">
                <RefreshCw size={14} className="animate-spin text-blue-600 mx-auto mb-1" />
                Loading records...
              </div>
            ) : (
              <>
                {rightTab === 'Overview' && (
                  <div className="bg-blue-50/70 rounded-lg p-2.5 border border-blue-100 text-xs">
                    <p className="font-bold text-gray-800">Admitted: {selectedPatient.admissionDate}</p>
                    <p className="text-gray-500 mt-0.5">
                      {selectedPatient.department} · {selectedPatient.doctor}
                    </p>
                    <p className="text-gray-600 mt-1 font-medium">Reason: {selectedPatient.visitReason}</p>
                  </div>
                )}
                {rightTab === 'Vitals History' && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedVitals.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">No recorded vitals yet.</p>
                    ) : (
                      selectedVitals.map((v) => (
                        <div key={v.id} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-gray-800">
                            <span>{v.systolicBp}/{v.diastolicBp} mmHg</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[10px]">
                            HR: {v.heartRate} bpm · Temp: {v.temperature}°C · SpO₂: {v.spo2}%
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {rightTab === 'Medications' && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedMeds.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">No active medications.</p>
                    ) : (
                      selectedMeds.map((m) => (
                        <div key={m.id} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-gray-800">
                            <span>{m.medicationName}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                              {m.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[10px]">{m.dose} · {m.route} · {m.schedule}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {rightTab === 'Appointments' && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedAppts.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">No upcoming appointments.</p>
                    ) : (
                      selectedAppts.map((a) => (
                        <div key={a.id} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-gray-800">
                            <span>{new Date(a.appointmentDate).toLocaleDateString()}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                              {a.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[10px]">
                            {a.startTime} · {a.type}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Latest Vitals */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Activity size={15} className="text-blue-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Latest Vitals</h3>
              </div>
              <button
                onClick={() => setVitalsModalOpen(true)}
                className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Update
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <Heart size={11} className="text-red-500 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.bp}</p>
                <p className="text-[9px] text-gray-400">BP (mmHg)</p>
                <p className="text-[9px] text-green-600 font-semibold">Recorded</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <Activity size={11} className="text-blue-500 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.hr || '—'} bpm</p>
                <p className="text-[9px] text-gray-400">Heart Rate</p>
                <p className="text-[9px] text-green-600 font-semibold">Recorded</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <Thermometer size={11} className="text-orange-500 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.temp ? `${selectedPatient.vitals.temp}°C` : '—'}</p>
                <p className="text-[9px] text-gray-400">Body Temp</p>
                <p className="text-[9px] text-green-600 font-semibold">Recorded</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <Droplets size={11} className="text-cyan-500 mx-auto mb-0.5" />
                <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.spo2 ? `${selectedPatient.vitals.spo2}%` : '—'}</p>
                <p className="text-[9px] text-gray-400">SpO₂</p>
                <p className="text-[9px] text-green-600 font-semibold">Recorded</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setVitalsModalOpen(true)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-blue-50/60 hover:border-blue-200 hover:shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs">
                  <Activity size={13} className="text-blue-600" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Record Vitals</span>
              </button>
              <button
                onClick={() => setAdministerModalOpen(true)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-purple-50/60 hover:border-purple-200 hover:shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs">
                  <Pill size={13} className="text-purple-600" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Administer Med</span>
              </button>
              <button
                onClick={() => setLabModalOpen(true)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-cyan-50/60 hover:border-cyan-200 hover:shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs">
                  <FlaskConical size={13} className="text-cyan-600" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Collect Sample</span>
              </button>
              <button
                onClick={() => setNoteModalOpen(true)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-emerald-50/60 hover:border-emerald-200 hover:shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs">
                  <FileText size={13} className="text-emerald-600" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Add Note</span>
              </button>
            </div>
          </div>
        </aside>
      ) : (
        <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white flex items-center justify-center p-6 text-center text-gray-400 text-xs">
          Select a patient to view details and clinical records.
        </aside>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <NursePatientDetailsModal
          patient={selectedPatient}
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          onRecordVitals={() => setVitalsModalOpen(true)}
          onAdministerMed={() => setAdministerModalOpen(true)}
          onCollectSample={() => setLabModalOpen(true)}
        />
      )}

      {/* Action Modals */}
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
    </div>
  );
}

export default React.memo(PatientsPage);
