import React, { useState, useCallback, useEffect } from 'react';
import {
  CalendarDays,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
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
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import { NursePatient } from '../../components/nurse/nurseMockData';
import NursePatientDetailsModal from '../../components/nurse/NursePatientDetailsModal';
import RecordVitalsModal from '../../components/nurse/RecordVitalsModal';
import { useAuth } from '../../auth/AuthContext';
import { fetchAppointments, fetchQueue, updateQueueEntry } from '../../api/appointments';
import { fetchPatients } from '../../api/patients';
import { fetchDoctors, fetchDepartments } from '../../api/staff';
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

const QUEUE_STATUS_STYLES: Record<string, string> = {
  WAITING_FOR_TRIAGE: 'bg-amber-100 text-amber-800 border-amber-200',
  TRIAGE_IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  WAITING_FOR_DOCTOR: 'bg-purple-100 text-purple-800 border-purple-200',
  IN_CONSULTATION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
};

const APPT_STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  CHECKED_IN: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-rose-100 text-rose-800',
  NO_SHOW: 'bg-gray-200 text-gray-600',
};

function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <ChevronLeft size={13} className="text-gray-500" />
        </button>
        <span className="text-xs font-bold text-gray-800">
          {monthName} {year}
        </span>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <ChevronRight size={13} className="text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-0.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {day !== null ? (
              <button
                className={`w-6 h-6 text-[11px] rounded-full flex items-center justify-center font-medium transition-colors relative cursor-pointer ${
                  day === today && isCurrentMonth
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                {day}
              </button>
            ) : (
              <div className="w-6 h-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppointmentsPage() {
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
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<NursePatient | null>(null);

  // Load Metadata
  const loadMetadata = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [pRes, dRes, deptRes] = await Promise.allSettled([
        fetchPatients(accessToken, { limit: 100 }),
        fetchDoctors(accessToken),
        fetchDepartments(accessToken),
      ]);
      if (pRes.status === 'fulfilled' && pRes.value.data) setPatients(pRes.value.data);
      if (dRes.status === 'fulfilled' && Array.isArray(dRes.value)) setDoctors(dRes.value);
      if (deptRes.status === 'fulfilled' && Array.isArray(deptRes.value)) setDepartments(deptRes.value);
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
      console.error('Failed to load queue in nurse desktop:', e);
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
      console.error('Failed to load appointments for nurse desktop:', err);
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

  const handleForwardToDoctor = async (queueId: string) => {
    try {
      await updateQueueEntry(queueId, { status: 'WAITING_FOR_DOCTOR' }, accessToken);
      await loadQueue();
    } catch (e) {
      console.error('Failed to forward patient to doctor:', e);
    }
  };

  const handleOpenPatientDetails = (patientId: string, fallbackName?: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      const name = found.fullName || `${found.firstName} ${found.lastName}`.trim();
      const birthYear = found.dateOfBirth ? new Date(found.dateOfBirth).getFullYear() : 1995;
      const age = Math.max(0, new Date().getFullYear() - birthYear);
      setSelectedPatientForDetails({
        id: found.id,
        pid: found.pid || `PID-${found.id.slice(0, 6).toUpperCase()}`,
        name,
        age,
        gender: found.gender?.toUpperCase() === 'MALE' ? 'Male' : 'Female',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        phone: found.phoneNumber || '—',
        email: found.email || '—',
        address: found.address || 'Addis Ababa, Ethiopia',
        room: 'Triage Room 1',
        bed: 'Counter 01',
        department: 'Outpatient Triage',
        visitReason: found.allergies ? `Allergies: ${found.allergies}` : 'Clinical Triage',
        status: 'In Care',
        vitalsStatus: 'Normal',
        vitals: { bp: '—', hr: 0, temp: 0, spo2: 0 },
        doctor: 'Attending Physician',
        admissionDate: found.createdAt ? new Date(found.createdAt).toLocaleDateString() : 'Today',
      });
      setDetailsOpen(true);
    } else if (fallbackName) {
      setSelectedPatientForDetails({
        id: patientId,
        pid: `PID-${patientId.slice(0, 6).toUpperCase()}`,
        name: fallbackName,
        age: 30,
        gender: 'Female',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackName)}`,
        phone: '—',
        email: '—',
        address: 'Addis Ababa, Ethiopia',
        room: 'Triage Room 1',
        bed: 'Counter 01',
        department: 'Outpatient Triage',
        visitReason: 'Clinical Triage',
        status: 'In Care',
        vitalsStatus: 'Normal',
        vitals: { bp: '—', hr: 0, temp: 0, spo2: 0 },
        doctor: 'Attending Physician',
        admissionDate: 'Today',
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
    const matchStat = selectedStatus === 'All' || q.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchQ && matchPri && matchStat;
  });

  // Filter Appointments
  const filteredAppointments = liveAppointments.filter((a) => {
    const query = searchQuery.toLowerCase();
    const patientName = a.patientName || '';
    const doctorName = a.doctorName || '';
    const reason = a.reason || '';
    const matchQ =
      !query ||
      patientName.toLowerCase().includes(query) ||
      doctorName.toLowerCase().includes(query) ||
      reason.toLowerCase().includes(query);
    const matchStat = selectedStatus === 'All' || a.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchQ && matchStat;
  });

  const activeCount = viewMode === 'queue' ? filteredQueue.length : filteredAppointments.length;
  const totalPages = Math.max(1, Math.ceil(activeCount / rowsPerPage));
  const paginatedQueue = filteredQueue.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // KPIs
  const waitingForTriageCount = queueEntries.filter(
    (q) => q.status === 'WAITING_FOR_TRIAGE' || q.status === 'WAITING' || q.status === 'CHECKED_IN',
  ).length;
  const urgentCount = queueEntries.filter(
    (q) => (q.priority === 'URGENT' || q.priority === 'EMERGENCY') && q.status !== 'COMPLETED',
  ).length;
  const waitingForDoctorCount = queueEntries.filter((q) => q.status === 'WAITING_FOR_DOCTOR').length;
  const apptsTodayCount = liveAppointments.length;

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Banner */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <CalendarDays size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Triage Queue & Appointments</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage incoming outpatient triage queues, record vital signs, and monitor clinic bookings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                void loadQueue();
                void loadAppointments();
              }}
              disabled={isLoadingQueue || isLoadingAppointments}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw
                size={14}
                className={isLoadingQueue || isLoadingAppointments ? 'animate-spin text-blue-600' : ''}
              />
            </button>
            <div className="flex bg-gray-200/80 p-0.5 rounded-lg border border-gray-300/50">
              <button
                onClick={() => {
                  setViewMode('queue');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'queue' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Triage Queue ({queueEntries.length})
              </button>
              <button
                onClick={() => {
                  setViewMode('appointments');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'appointments' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Appointments ({liveAppointments.length})
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard
            icon={Users}
            color="amber"
            label="Waiting for Triage"
            value={String(waitingForTriageCount)}
            trend="Ready for vital sign intake"
            trendUp={waitingForTriageCount === 0}
          />
          <NurseStatCard
            icon={AlertTriangle}
            color="red"
            label="Urgent / Emergency"
            value={String(urgentCount)}
            trend="High priority attention"
            trendUp={urgentCount === 0}
          />
          <NurseStatCard
            icon={ArrowRight}
            color="purple"
            label="With / Waiting Doctor"
            value={String(waitingForDoctorCount)}
            trend="Triaged & forwarded"
            trendUp={true}
          />
          <NurseStatCard
            icon={Calendar}
            color="blue"
            label="Total Booked"
            value={String(apptsTodayCount)}
            trend="Scheduled encounters"
            trendUp={true}
          />
        </div>

        {/* Table / List Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-2.5 sm:p-3 border-b border-gray-100 flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={
                  viewMode === 'queue'
                    ? 'Search by ticket #, patient name, PID...'
                    : 'Search by patient name, doctor, or reason...'
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {viewMode === 'queue' && (
              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Priorities</option>
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            )}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              {viewMode === 'queue' ? (
                <>
                  <option value="WAITING_FOR_TRIAGE">Waiting for Triage</option>
                  <option value="TRIAGE_IN_PROGRESS">Triage In Progress</option>
                  <option value="WAITING_FOR_DOCTOR">Waiting for Doctor</option>
                  <option value="IN_CONSULTATION">In Consultation</option>
                  <option value="COMPLETED">Completed</option>
                </>
              ) : (
                <>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </>
              )}
            </select>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            {viewMode === 'queue' ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-2.5 text-left">Ticket</th>
                    <th className="px-3 py-2.5 text-left">Patient</th>
                    <th className="px-3 py-2.5 text-left">Priority</th>
                    <th className="px-3 py-2.5 text-left">Wait Time</th>
                    <th className="px-3 py-2.5 text-left">Department / Doctor</th>
                    <th className="px-3 py-2.5 text-left">Status</th>
                    <th className="px-3 py-2.5 text-center">Triage Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoadingQueue ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                        Loading queue entries...
                      </td>
                    </tr>
                  ) : paginatedQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        No active queue entries found.
                      </td>
                    </tr>
                  ) : (
                    paginatedQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {item.ticketNumber}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-gray-800 text-xs leading-tight">{item.patientName}</p>
                              <p className="text-[10px] text-gray-400">{item.patientPid}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.priority === 'EMERGENCY'
                                ? 'bg-red-100 text-red-700 animate-pulse'
                                : item.priority === 'URGENT'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock size={12} className="text-gray-400" />
                            <span>{item.waitMinutes} mins</span>
                          </div>
                          <div className="text-[10px] text-gray-400">Since {item.checkInTime}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          <div>{item.departmentName}</div>
                          {item.doctorName && <div className="text-[10px] text-gray-400">{item.doctorName}</div>}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              QUEUE_STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStartTriage(item.patientId, item.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                              title="Record Vitals & Triage"
                            >
                              <Activity size={12} />
                              <span>Triage</span>
                            </button>
                            {item.status !== 'WAITING_FOR_DOCTOR' && item.status !== 'IN_CONSULTATION' && item.status !== 'COMPLETED' && (
                              <button
                                onClick={() => void handleForwardToDoctor(item.id)}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                                title="Forward to Doctor"
                              >
                                <ArrowRight size={11} />
                                <span>Forward</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenPatientDetails(item.patientId, item.patientName)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
                              title="Patient History"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-2.5 text-left">Patient</th>
                    <th className="px-3 py-2.5 text-left">Doctor</th>
                    <th className="px-3 py-2.5 text-left">Date & Time</th>
                    <th className="px-3 py-2.5 text-left">Type / Reason</th>
                    <th className="px-3 py-2.5 text-left">Status</th>
                    <th className="px-3 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoadingAppointments ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                        Loading appointments...
                      </td>
                    </tr>
                  ) : paginatedAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        No scheduled appointments found.
                      </td>
                    </tr>
                  ) : (
                    paginatedAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-800 text-xs leading-tight">{apt.patientName}</p>
                          <p className="text-[10px] text-gray-400">{apt.patientPid || 'Patient ID'}</p>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{apt.doctorName || 'Attending Physician'}</td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          <div>{new Date(apt.appointmentDate).toLocaleDateString()}</div>
                          <div className="text-[10px] text-gray-400">{apt.startTime} - {apt.endTime}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-600 truncate max-w-[140px]">{apt.reason || apt.type}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              APPT_STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleStartTriage(apt.patientId)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Pre-Triage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="px-3.5 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {activeCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, activeCount)} of {activeCount} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    currentPage === n ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-blue-600" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Calendar View</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Live Schedule</span>
          </div>
          <MiniCalendar />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2">Triage Quick Protocol</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2 p-2 bg-blue-50/60 rounded-lg border border-blue-100">
              <Activity size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">1. Record Vital Signs</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Capture BP, Pulse, Temp, SpO₂, RR, and weight/height.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-purple-50/60 rounded-lg border border-purple-100">
              <Heart size={14} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">2. Determine Priority</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Evaluate emergency conditions and triage urgency.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
              <ArrowRight size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">3. Forward to Doctor</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Pass patient into Doctor workstation consultation queue.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Patient Details Modal */}
      {selectedPatientForDetails && (
        <NursePatientDetailsModal
          patient={selectedPatientForDetails}
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      )}

      {/* Triage / Record Vitals Modal */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        onSave={() => {
          void loadQueue();
          void loadAppointments();
        }}
        selectedPatientId={selectedPatientForVitals}
        queueEntryId={selectedQueueEntryId}
      />
    </div>
  );
}

export default React.memo(AppointmentsPage);
