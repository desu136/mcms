'use client';

import { useState, useCallback, useEffect } from 'react';
import NurseStatCard from '@/components/nurse/NurseStatCard';
import NursePatientDetailsModal from '@/components/nurse/NursePatientDetailsModal';
import RecordVitalsModal from '@/components/nurse/RecordVitalsModal';
import {
  CalendarDays,
  Eye,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  RefreshCcw,
  FileText,
  Filter,
  Search,
  RefreshCw,
  Clock,
  Heart,
  ArrowRight,
  Activity,
  AlertTriangle,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchAppointments, fetchQueue, updateQueueEntry } from '../../../lib/api/appointments';
import { fetchPatients } from '../../../lib/api/patients';
import { fetchDoctors, fetchDepartments } from '../../../lib/api/staff';
import type { AppointmentDTO, QueueEntryDTO, PatientDTO, DoctorDTO, ClinicDepartmentDTO } from '@mcms/contracts';

interface ExtendedQueueItem {
  id: string;
  ticketNumber: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  age: number;
  gender: string;
  departmentName: string;
  doctorName?: string | null;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: string;
  checkInTime: string;
  waitMinutes: number;
}

export default function NurseAppointmentsPage() {
  const { accessToken } = useAuth();

  // Mode: 'queue' (Nursing Triage Queue) vs 'appointments' (Scheduled Appointments)
  const [viewMode, setViewMode] = useState<'queue' | 'appointments'>('queue');

  // Live Queue Data
  const [queueEntries, setQueueEntries] = useState<ExtendedQueueItem[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Live Appointments Data
  const [liveAppointments, setLiveAppointments] = useState<AppointmentDTO[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Metadata
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);

  // Modals
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<string>('');
  const [selectedQueueEntryId, setSelectedQueueEntryId] = useState<string | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<any>(null);

  // Load Metadata
  const loadMetadata = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [pRes, dRes, deptRes] = await Promise.allSettled([
        fetchPatients(accessToken, { limit: 100 }),
        fetchDoctors(accessToken),
        fetchDepartments(accessToken),
      ]);
      if (pRes.status === 'fulfilled') setPatients(pRes.value.data);
      if (dRes.status === 'fulfilled') setDoctors(dRes.value);
      if (deptRes.status === 'fulfilled') setDepartments(deptRes.value);
    } catch (e) {
      console.error('Failed to load clinic metadata:', e);
    }
  }, [accessToken]);

  // Load Live Queue Entries
  const loadQueue = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingQueue(true);
    try {
      const rawQueue = await fetchQueue(accessToken);
      const mapped: ExtendedQueueItem[] = rawQueue.map((q) => {
        const checkIn = new Date(q.checkInTime);
        const waitMins = Math.max(0, Math.floor((Date.now() - checkIn.getTime()) / 60000));
        return {
          id: q.id,
          ticketNumber: q.ticketNumber,
          patientId: q.patientId,
          patientName: q.patientName || 'Patient',
          patientPid: q.patientPid || 'PID-000000',
          age: (q as any).patientAge || 30,
          gender: (q as any).patientGender || 'Female',
          departmentName: (q as any).departmentName || (q.departmentId ? `Dept ${q.departmentId}` : 'General OPD'),
          doctorName: (q as any).doctorName || (q.assignedDoctorId ? `Dr. ${q.assignedDoctorId}` : null),
          priority: q.priority as 'ROUTINE' | 'URGENT' | 'EMERGENCY',
          status: q.status,
          checkInTime: checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          waitMinutes: waitMins,
        };
      });
      setQueueEntries(mapped);
    } catch (e) {
      console.error('Failed to load queue in nurse portal:', e);
    } finally {
      setIsLoadingQueue(false);
    }
  }, [accessToken]);

  // Load Live Appointments
  const loadAppointments = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingAppointments(true);
    try {
      const data = await fetchAppointments(accessToken);
      setLiveAppointments(data || []);
    } catch (err) {
      console.error('Failed to load appointments for nurse portal:', err);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadMetadata();
    void loadQueue();
    void loadAppointments();
  }, [loadMetadata, loadQueue, loadAppointments]);

  const handleStartTriage = (patientId: string, queueId?: string) => {
    setSelectedPatientForVitals(patientId);
    setSelectedQueueEntryId(queueId);
    setVitalsModalOpen(true);
  };

  const handleOpenPatientDetails = (patientId: string, patientName: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setSelectedPatientForDetails({
        id: found.id,
        pid: found.pid,
        name: found.fullName || `${found.firstName} ${found.lastName}`.trim(),
        age: found.dateOfBirth
          ? Math.max(0, new Date().getFullYear() - new Date(found.dateOfBirth).getFullYear())
          : 30,
        gender: found.gender === 'MALE' ? 'Male' : 'Female',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(found.firstName)}`,
        phone: found.phoneNumber || '—',
        email: found.email || '—',
        address: found.address || 'Addis Ababa, Ethiopia',
        room: 'Triage Room 1',
        bed: 'Counter 01',
        department: 'Outpatient Triage',
        visitReason: 'Clinical Triage',
        status: 'In Care',
        vitalsStatus: 'Normal',
        vitals: { bp: '—', hr: 0, temp: 0, spo2: 0 },
        doctor: 'Attending Physician',
        admissionDate: found.createdAt ? new Date(found.createdAt).toLocaleDateString() : 'Today',
      });
      setDetailsOpen(true);
    }
  };

  // Filter Queue Entries
  const filteredQueue = queueEntries.filter((q) => {
    const query = searchQuery.toLowerCase();
    const matchQ =
      !query ||
      q.patientName.toLowerCase().includes(query) ||
      q.patientPid.toLowerCase().includes(query) ||
      q.ticketNumber.toLowerCase().includes(query);
    const matchPri = selectedPriority === 'All' || q.priority === selectedPriority;
    const matchStat =
      selectedStatus === 'All' ||
      q.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchQ && matchPri && matchStat;
  });

  // Filter Appointments
  const filteredAppointments = liveAppointments.filter((a) => {
    const query = searchQuery.toLowerCase();
    const matchQ =
      !query ||
      a.patientName.toLowerCase().includes(query) ||
      a.patientPid.toLowerCase().includes(query) ||
      (a.reason || '').toLowerCase().includes(query);
    const matchStatus =
      selectedStatus === 'All' ||
      a.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'today' &&
        (a.status === 'CHECKED_IN' ||
          a.status === 'IN_PROGRESS' ||
          a.status === 'WAITING')) ||
      (activeTab === 'upcoming' &&
        (a.status === 'SCHEDULED' || a.status === 'CONFIRMED')) ||
      (activeTab === 'completed' && a.status === 'COMPLETED') ||
      (activeTab === 'cancelled' &&
        (a.status === 'CANCELLED' || a.status === 'NO_SHOW'));
    return matchQ && matchStatus && matchTab;
  });

  // Queue KPI counts
  const waitingQueueCount = queueEntries.filter((q) => q.status === 'WAITING').length;
  const inConsultCount = queueEntries.filter((q) => q.status === 'IN_CONSULTATION').length;
  const urgentCount = queueEntries.filter(
    (q) => q.priority === 'URGENT' || q.priority === 'EMERGENCY',
  ).length;

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <CalendarDays size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Nursing Flow: Triage & Appointments
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Receive checked-in patients from reception, perform vital sign triage, and manage consultation flow.
              </p>
            </div>
          </div>

          {/* Mode Switcher & Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('queue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'queue'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={14} />
                <span>Triage Queue ({waitingQueueCount})</span>
              </button>
              <button
                onClick={() => setViewMode('appointments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'appointments'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays size={14} />
                <span>Appointments ({liveAppointments.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                void loadQueue();
                void loadAppointments();
              }}
              disabled={isLoadingQueue || isLoadingAppointments}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                size={13}
                className={`text-blue-600 ${
                  isLoadingQueue || isLoadingAppointments ? 'animate-spin' : ''
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard
            icon={<Clock size={18} className="text-amber-600" />}
            iconBg="bg-amber-50"
            label="Awaiting Triage"
            value={isLoadingQueue ? '—' : waitingQueueCount}
            trend="Checked in by Reception"
            trendUp
          />
          <NurseStatCard
            icon={<Heart size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
            label="In Consultation"
            value={isLoadingQueue ? '—' : inConsultCount}
            trend="Triaged & with Doctor"
            trendUp
          />
          <NurseStatCard
            icon={<AlertTriangle size={18} className="text-rose-600" />}
            iconBg="bg-rose-50"
            label="Urgent / Emergency"
            value={isLoadingQueue ? '—' : urgentCount}
            trend="Requires immediate triage"
            trendUp={false}
          />
          <NurseStatCard
            icon={<CalendarDays size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Total Appointments"
            value={isLoadingAppointments ? '—' : liveAppointments.length}
            trend="Active clinic bookings"
            trendUp
          />
        </div>

        {/* View Mode: NURSING TRIAGE QUEUE */}
        {viewMode === 'queue' ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search queue by patient name, PID, or ticket #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
                >
                  <option value="All">All Priorities</option>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="WAITING">Waiting</option>
                  <option value="CALLED">Called</option>
                  <option value="IN_CONSULTATION">In Consultation</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Check-In / Wait</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Department / Room</th>
                    <th className="py-3 px-4">Assigned Doctor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Triage Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingQueue ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Loading active nursing queue...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No patients currently in the nursing queue.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {item.ticketNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block">{item.patientName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {item.patientPid} • {item.gender}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            <span>{item.checkInTime}</span>
                            <span className="text-[10px] text-slate-400 font-medium ml-1">
                              ({item.waitMinutes}m ago)
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              item.priority === 'EMERGENCY'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : item.priority === 'URGENT'
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {item.departmentName}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {item.doctorName || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              item.status === 'WAITING'
                                ? 'bg-amber-100 text-amber-700'
                                : item.status === 'IN_CONSULTATION'
                                ? 'bg-blue-100 text-blue-700'
                                : item.status === 'CALLED'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartTriage(item.patientId, item.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition"
                            >
                              <Heart size={12} />
                              <span>Record Vitals & Triage</span>
                            </button>
                            <button
                              onClick={() => handleOpenPatientDetails(item.patientId, item.patientName)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="View Patient Chart"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* View Mode: SCHEDULED APPOINTMENTS */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Tab filters */}
            <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                {[
                  { key: 'all', label: 'All', count: liveAppointments.length },
                  {
                    key: 'today',
                    label: 'Today',
                    count: liveAppointments.filter(
                      (a) =>
                        a.status === 'CHECKED_IN' ||
                        a.status === 'IN_PROGRESS' ||
                        a.status === 'WAITING',
                    ).length,
                  },
                  {
                    key: 'upcoming',
                    label: 'Upcoming',
                    count: liveAppointments.filter(
                      (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED',
                    ).length,
                  },
                  {
                    key: 'completed',
                    label: 'Completed',
                    count: liveAppointments.filter((a) => a.status === 'COMPLETED').length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Appointment Date & Time</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Attending Doctor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingAppointments ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Loading appointments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No appointments found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block">{a.patientName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {a.patientPid}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {new Date(a.appointmentDate).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] text-slate-400">{a.startTime}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {a.branchName || 'General OPD'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {a.reason || 'Consultation'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {a.doctorName || 'Assigned Physician'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              a.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : a.status === 'IN_PROGRESS' || a.status === 'CHECKED_IN'
                                ? 'bg-blue-100 text-blue-700'
                                : a.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartTriage(a.patientId)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition"
                            >
                              <Heart size={12} />
                              <span>Triage Vitals</span>
                            </button>
                            <button
                              onClick={() => handleOpenPatientDetails(a.patientId, a.patientName)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="View Patient Chart"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record Vitals & Triage Modal */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => {
          setVitalsModalOpen(false);
          setSelectedQueueEntryId(undefined);
        }}
        selectedPatientId={selectedPatientForVitals}
        queueEntryId={selectedQueueEntryId}
        onSave={() => {
          void loadQueue();
          void loadAppointments();
        }}
      />

      {/* Patient Details Modal */}
      <NursePatientDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        patient={selectedPatientForDetails}
        onRecordVitals={(p) => handleStartTriage(p.id)}
      />
    </div>
  );
}
