import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarDays,
  Users,
  Pill,
  FlaskConical,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Heart,
  Stethoscope,
  Zap,
  Loader2,
  RefreshCw,
  Clock,
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
import { PatientItem } from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorReferralModal } from '../../components/doctor/DoctorReferralModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients } from '../../api/patients';
import { fetchAppointments, fetchQueue } from '../../api/appointments';
import { fetchPrescriptions, fetchLabOrders } from '../../api/clinical';
import type { PatientDTO, AppointmentDTO, PrescriptionDTO, LabOrderDTO, QueueEntryDTO } from '@mcms/contracts';

function mapPatientDtoToItem(p: PatientDTO): PatientItem {
  const name = p.fullName || `${p.firstName} ${p.lastName}`;
  const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear() : 1990;
  const age = Math.max(0, new Date().getFullYear() - birthYear);
  return {
    id: p.id,
    name,
    pid: p.pid || `PID-${p.id.slice(0, 6)}`,
    age,
    gender: (p.gender?.toUpperCase() === 'MALE' ? 'Male' : 'Female'),
    phone: p.phoneNumber || '—',
    email: p.email || '—',
    address: p.address || 'Addis Ababa, Ethiopia',
    department: 'General OPD',
    lastVisit: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
    lastVisitReason: 'Clinical Consultation',
    status: p.status?.toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=150&background=dbeafe&color=1e40af`,
    totalVisits: 1,
    conditions: [],
  };
}

function createPatientItemFromAppointment(a: AppointmentDTO): PatientItem {
  return {
    id: a.patientId,
    name: a.patientName,
    pid: `PID-${a.patientId.slice(0, 6)}`,
    age: 30,
    gender: 'Female',
    phone: '—',
    email: '—',
    address: 'Addis Ababa',
    department: a.branchName || 'General OPD',
    lastVisit: a.appointmentDate,
    lastVisitReason: a.reason || a.type || 'Consultation',
    status: 'Active',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.patientName)}&size=150&background=dbeafe&color=1e40af`,
    totalVisits: 1,
    conditions: [],
  };
}

function createPatientItemFromQueue(q: QueueEntryDTO): PatientItem {
  return {
    id: q.patientId,
    name: q.patientName,
    pid: q.patientPid || `PID-${q.patientId.slice(0, 6)}`,
    age: 30,
    gender: 'Female',
    phone: '—',
    email: '—',
    address: 'Addis Ababa',
    department: 'General OPD',
    lastVisit: 'Today',
    lastVisitReason: `Ticket #${q.ticketNumber}`,
    status: 'Active',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(q.patientName)}&size=150&background=dbeafe&color=1e40af`,
    totalVisits: 1,
    conditions: [],
  };
}

export interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
}

export function DashboardPage({ onNavigateTab }: DashboardPageProps) {
  const { accessToken, user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('This Week');
  const [calendarSelectedDay, setCalendarSelectedDay] = useState(19);

  // Live state
  const [loading, setLoading] = useState(true);
  const [livePatients, setLivePatients] = useState<PatientDTO[]>([]);
  const [liveAppointments, setLiveAppointments] = useState<AppointmentDTO[]>([]);
  const [livePrescriptions, setLivePrescriptions] = useState<PrescriptionDTO[]>([]);
  const [liveLabOrders, setLiveLabOrders] = useState<LabOrderDTO[]>([]);
  const [liveQueue, setLiveQueue] = useState<QueueEntryDTO[]>([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [patientsRes, apptsRes, rxRes, labsRes, queueRes] = await Promise.allSettled([
        fetchPatients(accessToken, { limit: 10 }),
        fetchAppointments(accessToken),
        fetchPrescriptions(accessToken),
        fetchLabOrders(accessToken),
        fetchQueue(accessToken),
      ]);

      if (patientsRes.status === 'fulfilled' && patientsRes.value?.data) {
        setLivePatients(patientsRes.value.data);
      }
      if (apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value)) {
        setLiveAppointments(apptsRes.value);
      }
      if (rxRes.status === 'fulfilled' && Array.isArray(rxRes.value)) {
        setLivePrescriptions(rxRes.value);
      }
      if (labsRes.status === 'fulfilled' && Array.isArray(labsRes.value)) {
        setLiveLabOrders(labsRes.value);
      }
      if (queueRes.status === 'fulfilled' && Array.isArray(queueRes.value)) {
        setLiveQueue(queueRes.value);
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const handleOpenPatient = (p: PatientItem) => {
    setSelectedPatient(p);
    setDrawerOpen(true);
  };

  // KPIs calculation - 100% Real API counts (0 if empty)
  const totalAppointmentsCount = liveAppointments.length;
  const completedAppointmentsCount = liveAppointments.filter(
    (a) => a.status.toUpperCase() === 'COMPLETED',
  ).length;
  const pendingRxCount = livePrescriptions.filter(
    (p) => p.status.toUpperCase() === 'ACTIVE' || p.status.toUpperCase() === 'PENDING',
  ).length;
  const pendingLabCount = liveLabOrders.filter(
    (l) => l.status.toUpperCase() !== 'COMPLETED' && l.status.toUpperCase() !== 'CANCELLED',
  ).length;

  // Derive Current Patient from real Queue or Appointments
  const currentPatient: PatientItem | null = useMemo(() => {
    const activeQ =
      liveQueue.find(
        (q) => q.status.toUpperCase() === 'IN_PROGRESS' || q.status.toUpperCase() === 'CALLING',
      ) ||
      (liveQueue.length > 0 && liveQueue[0]?.status.toUpperCase() === 'WAITING' ? liveQueue[0] : null);

    if (activeQ) {
      const match = livePatients.find((p) => p.id === activeQ.patientId);
      return match ? mapPatientDtoToItem(match) : createPatientItemFromQueue(activeQ);
    }

    const activeA = liveAppointments.find(
      (a) => a.status.toUpperCase() === 'IN_PROGRESS' || a.status.toUpperCase() === 'CHECKED_IN',
    );
    if (activeA) {
      const match = livePatients.find((p) => p.id === activeA.patientId);
      return match ? mapPatientDtoToItem(match) : createPatientItemFromAppointment(activeA);
    }

    return null;
  }, [liveQueue, liveAppointments, livePatients]);

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => {
      const count = liveAppointments.filter((a) => {
        try {
          const d = new Date(a.appointmentDate);
          const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
          return weekday === day;
        } catch {
          return false;
        }
      }).length;
      return {
        day,
        newPatients: count,
        returningPatients: Math.floor(count * 0.5),
      };
    });
  }, [liveAppointments]);

  const headerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Stethoscope className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
            Welcome Back, {user?.displayName || 'Doctor'}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium leading-tight">
            Here&apos;s your live clinical workstation status.
          </p>
        </div>
      </div>

      {/* Date & Refresh */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => void loadDashboardData()}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh Dashboard"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-800 tracking-tight">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-[10px] text-slate-400 font-medium leading-none">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Today's Appointments"
        value={loading ? '—' : totalAppointmentsCount}
        icon={Users}
        color="blue"
        change={{ value: `${totalAppointmentsCount}`, trend: 'neutral', label: 'today' }}
      />
      <DoctorStatCard
        title="Patients Seen Today"
        value={loading ? '—' : completedAppointmentsCount}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: `${completedAppointmentsCount}`, trend: 'up', label: 'completed' }}
      />
      <DoctorStatCard
        title="Pending Prescriptions"
        value={loading ? '—' : pendingRxCount}
        icon={Pill}
        color="purple"
        change={{ value: `${pendingRxCount}`, trend: 'neutral', label: 'active Rx' }}
      />
      <DoctorStatCard
        title="Lab Results Pending"
        value={loading ? '—' : pendingLabCount}
        icon={FlaskConical}
        color="orange"
        change={{ value: `${pendingLabCount}`, trend: 'neutral', label: 'requisitions' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Quick Actions Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-blue-600 px-3 py-2 flex items-center gap-2 text-white">
          <Zap className="w-3.5 h-3.5 text-white" />
          <h3 className="text-[11px] font-bold text-white tracking-wide">Quick Actions</h3>
        </div>
        <div className="p-2.5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigateTab?.('appointments')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">View Appointments</span>
          </button>

          <button
            onClick={() => setPrescriptionModalOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center cursor-pointer group"
          >
            <Pill className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Add Prescription</span>
          </button>

          <button
            onClick={() => setLabModalOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-orange-400/50 hover:border-orange-400 hover:bg-orange-50/30 transition-all text-center cursor-pointer group"
          >
            <FlaskConical className="w-4 h-4 text-orange-500 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Order Lab Test</span>
          </button>

          <button
            onClick={() => onNavigateTab?.('medical-records')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">View Patient Records</span>
          </button>
        </div>
      </div>

      {/* Current Patient Card */}
      {currentPatient ? (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-[11px] font-bold text-slate-800">Current Patient</h3>
            </div>
            <button
              onClick={() => handleOpenPatient(currentPatient)}
              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View Record
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2.5">
            <img
              src={currentPatient.avatar}
              alt={currentPatient.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs font-black text-slate-900">{currentPatient.name}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                  In Consultation
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">{currentPatient.pid}</p>
            </div>
          </div>

          <div className="mt-2 space-y-1.5 text-[10px]">
            {[
              { label: 'Age / Gender', value: `${currentPatient.age}y / ${currentPatient.gender}` },
              { label: 'Phone', value: currentPatient.phone },
              { label: 'Department', value: currentPatient.department },
              { label: 'Visit Type', value: currentPatient.lastVisitReason || 'Consultation' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">{label}</span>
                <span className="font-bold text-slate-700 text-right max-w-[55%] truncate">{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleOpenPatient(currentPatient)}
            className="mt-2 w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            View Full Profile
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-700">No Patient in Consultation</h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto">
            The consultation queue is currently clear. Patients checked in at reception will appear here.
          </p>
          {liveQueue.some((q) => q.status.toUpperCase() === 'WAITING') && (
            <button
              onClick={() => onNavigateTab?.('appointments')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Call Next Patient ({liveQueue.filter((q) => q.status.toUpperCase() === 'WAITING').length} waiting)
            </button>
          )}
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-[11px] font-bold text-slate-800">Upcoming Appointments</h3>
          </div>
          <button
            onClick={() => onNavigateTab?.('appointments')}
            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="mt-1.5 space-y-1.5">
          {liveAppointments.filter(
            (a) => a.status.toUpperCase() !== 'COMPLETED' && a.status.toUpperCase() !== 'CANCELLED',
          ).length > 0 ? (
            liveAppointments
              .filter(
                (a) => a.status.toUpperCase() !== 'COMPLETED' && a.status.toUpperCase() !== 'CANCELLED',
              )
              .slice(0, 4)
              .map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-[10px] font-bold text-slate-500 w-12 shrink-0">{a.startTime}</div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-800 truncate">{a.patientName}</div>
                      <div className="text-[9px] text-slate-400 truncate">{a.reason || a.type || 'Consultation'}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                    {a.status}
                  </span>
                </div>
              ))
          ) : (
            <div className="py-4 text-center text-xs text-slate-400">
              No upcoming appointments scheduled
            </div>
          )}
        </div>
      </div>

      {/* Interactive Mini Calendar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-slate-800">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <button className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
          {[
            null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
            22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
          ].map((d, i) =>
            d === null ? (
              <span key={i} />
            ) : d === new Date().getDate() ? (
              <button
                key={d}
                onClick={() => setCalendarSelectedDay(d)}
                className="py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] cursor-pointer"
              >
                {d}
              </button>
            ) : (
              <button
                key={d}
                onClick={() => setCalendarSelectedDay(d)}
                className={`py-1 rounded-full font-medium text-[11px] cursor-pointer transition-colors ${
                  calendarSelectedDay === d ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            )
          )}
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
        rightPanelWidth="lg:w-[320px] xl:w-[360px] 2xl:w-[380px]"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          {/* Column 1: Today's Schedule & Motivational Banner */}
          <div className="space-y-4">
            {/* Today's Schedule Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Today&apos;s Schedule</h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('appointments')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {liveAppointments.length > 0 ? (
                  liveAppointments.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        const match = livePatients.find((p) => p.id === item.patientId);
                        if (match) handleOpenPatient(mapPatientDtoToItem(match));
                        else handleOpenPatient(createPatientItemFromAppointment(item));
                      }}
                      className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-[10px] font-semibold text-slate-500 w-24 shrink-0">
                          {item.startTime}
                        </span>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&size=80&background=dbeafe&color=1e40af`}
                          alt={item.patientName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1 truncate">
                          <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {item.patientName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.reason || item.type || 'Consultation'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden xl:inline-block text-[10px] font-medium text-slate-500">
                          {item.branchName || 'General OPD'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            item.status.toUpperCase() === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : item.status.toUpperCase() === 'IN_PROGRESS' || item.status.toUpperCase() === 'CHECKED_IN'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                          }`}
                        >
                          {item.status}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-700">No appointments scheduled today</div>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      Appointments scheduled for today will appear here in real time.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Motivational Banner Card */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/80 border border-blue-100/70 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80"
                  alt="Doctor"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0 shadow-2xs"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 tracking-tight">Better care, together</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Your dedication makes a difference. Thank you for being part of our healthcare team.
                  </div>
                </div>
              </div>
              <Heart className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
            </div>
          </div>

          {/* Column 2: Patient Overview Chart & Recent Patients */}
          <div className="space-y-4">
            {/* Patient Overview Line Chart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-3.5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Patient Overview</h3>
                </div>

                <div className="flex items-center gap-4">
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E6BFF]" />
                      <span>New</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00D09C]" />
                      <span>Returning</span>
                    </div>
                  </div>

                  <select
                    value={chartTimeframe}
                    onChange={(e) => setChartTimeframe(e.target.value)}
                    className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none"
                  >
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                    <option value="This Month">This Month</option>
                  </select>
                </div>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="newPatients"
                      name="New Patients"
                      stroke="#1E6BFF"
                      strokeWidth={2.5}
                      dot={{ fill: '#1E6BFF', r: 3.5 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="returningPatients"
                      name="Returning Patients"
                      stroke="#00D09C"
                      strokeWidth={2.5}
                      dot={{ fill: '#00D09C', r: 3.5 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Patients Table Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Recent Patients</h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('patients')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                {livePatients.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                        <th className="py-2 px-3.5">Name</th>
                        <th className="py-2 px-3.5">Age</th>
                        <th className="py-2 px-3.5">Gender</th>
                        <th className="py-2 px-3.5">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {livePatients.slice(0, 5).map((p) => {
                        const item = mapPatientDtoToItem(p);
                        return (
                          <tr
                            key={p.id}
                            onClick={() => handleOpenPatient(item)}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-3.5">
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.avatar}
                                  alt={item.name}
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                                />
                                <div>
                                  <div className="text-[11px] font-bold text-slate-800">{item.name}</div>
                                  <div className="text-[10px] text-slate-400">{item.pid}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3.5 text-[11px] font-semibold text-slate-600">
                              {item.age}y
                            </td>
                            <td className="py-2 px-3.5 text-[11px] font-semibold text-slate-600">
                              {item.gender}
                            </td>
                            <td className="py-2 px-3.5 text-[11px] font-medium text-slate-500">
                              {item.lastVisit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No patients registered yet. Patients created in the system will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DoctorPageShell>

      {/* Patient Drawer & Modals */}
      <DoctorPatientDrawer
        patient={selectedPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
        onOpenReferralModal={() => setReferralModalOpen(true)}
      />
      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        defaultPatientId={currentPatient?.id || livePatients[0]?.id}
        onSuccess={() => void loadDashboardData()}
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={currentPatient?.id || livePatients[0]?.id}
        onSuccess={() => void loadDashboardData()}
      />
      <DoctorReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        patientId={currentPatient?.id || livePatients[0]?.id}
        patientName={currentPatient?.name || livePatients[0]?.fullName}
        onSuccess={() => void loadDashboardData()}
      />
    </>
  );
}
export default DashboardPage;
