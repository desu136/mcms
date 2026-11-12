import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Clock,
  UserPlus,
  CalendarDays,
  UserCheck,
  FileText,
  CreditCard,
  BarChart2,
  ArrowRight,
  Database,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import NewAppointmentModal from '../../components/receptionist/NewAppointmentModal';
import CheckInModal from '../../components/receptionist/CheckInModal';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import { fetchQueue, fetchAppointments, fetchPatients } from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { QueueEntryDTO, AppointmentDTO, PatientDTO } from '@mcms/contracts';

interface DashboardPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

interface DashboardAppointmentItem {
  id: string;
  time: string;
  patientName: string;
  doctor: string;
  status: string;
}

interface DashboardQueueItem {
  queueNumber: string;
  patientName: string;
  type: string;
  status: string;
}

export function DashboardPage({ onNavigateTab }: DashboardPageProps) {
  const { syncStatus, isOnline } = useSync();
  const { accessToken } = useAuth();

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Live state
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [queue, setQueue] = useState<QueueEntryDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [totalPatientsCount, setTotalPatientsCount] = useState<number>(0);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [queueRes, aptRes, patientsRes] = await Promise.allSettled([
        fetchQueue(accessToken),
        fetchAppointments(accessToken),
        fetchPatients(accessToken, { page: 1, limit: 10 }),
      ]);

      if (queueRes.status === 'fulfilled' && queueRes.value) {
        setQueue(queueRes.value);
      }

      if (aptRes.status === 'fulfilled' && aptRes.value) {
        setAppointments(aptRes.value);
      }

      if (patientsRes.status === 'fulfilled' && patientsRes.value) {
        setPatients(patientsRes.value.data || []);
        setTotalPatientsCount(patientsRes.value.total || 0);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = a.appointmentDate ? a.appointmentDate.split('T')[0] : '';
      return d === todayStr;
    });
  }, [appointments, todayStr]);

  // Queue counts
  const waitingCount = useMemo(() => {
    return queue.filter((q) => {
      const s = (q.status || '').toUpperCase();
      return s === 'WAITING' || s === 'PENDING' || s === '';
    }).length;
  }, [queue]);

  const inConsultCount = useMemo(() => {
    return queue.filter((q) => {
      const s = (q.status || '').toUpperCase();
      return s === 'IN_PROGRESS' || s === 'CALLED' || s === 'IN_CONSULTATION';
    }).length;
  }, [queue]);

  const completedCount = useMemo(() => {
    return queue.filter((q) => (q.status || '').toUpperCase() === 'COMPLETED').length;
  }, [queue]);

  // 7-day patient flow calculated dynamically
  const patientFlowChart = useMemo(() => {
    const days: { day: string; registered: number; appointments: number; checkedIn: number }[] = [];
    const base = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const iso = d.toISOString().split('T')[0] ?? '';
      const label = i === 0 ? 'Today' : `${dayNames[d.getDay()]} ${d.getDate()}`;

      const aptsOnDay = appointments.filter((a) => (a.appointmentDate?.split('T')[0] ?? '') === iso);
      const checkedInOnDay = aptsOnDay.filter((a) => (a.status || '').toUpperCase() === 'CHECKED_IN').length;
      const queueOnDay = queue.filter((q) => (q.checkInTime ? q.checkInTime.split('T')[0] : '') === iso).length;

      days.push({
        day: label,
        registered: Math.max(aptsOnDay.length, queueOnDay, 0),
        appointments: aptsOnDay.length,
        checkedIn: checkedInOnDay + queueOnDay,
      });
    }
    return days;
  }, [appointments, queue]);

  // Visit types breakdown from real appointments
  const patientTypesDonut = useMemo(() => {
    let consultation = 0;
    let followUp = 0;
    let emergency = 0;
    let routine = 0;

    appointments.forEach((a) => {
      const t = (a.type || '').toUpperCase();
      if (t.includes('FOLLOW')) followUp++;
      else if (t.includes('EMERGENCY')) emergency++;
      else if (t.includes('ROUTINE') || t.includes('CHECKUP')) routine++;
      else consultation++;
    });

    const total = appointments.length;
    if (total === 0) {
      return [{ name: 'General Consultation', value: 1, percent: 100, color: '#1E6BFF' }];
    }

    const list = [
      { name: 'Consultation', value: consultation, percent: Math.round((consultation / total) * 100), color: '#1E6BFF' },
      { name: 'Follow-up', value: followUp, percent: Math.round((followUp / total) * 100), color: '#10B981' },
      { name: 'Emergency', value: emergency, percent: Math.round((emergency / total) * 100), color: '#8B5CF6' },
      { name: 'Routine', value: routine, percent: Math.round((routine / total) * 100), color: '#F59E0B' },
    ];

    return list.filter((item) => item.value > 0);
  }, [appointments]);

  // Map top appointments for display
  const topAppointments: DashboardAppointmentItem[] = useMemo(() => {
    return appointments.slice(0, 5).map((a) => {
      let status = 'Scheduled';
      const s = (a.status || '').toUpperCase();
      if (s === 'CONFIRMED') status = 'Confirmed';
      else if (s === 'CHECKED_IN') status = 'Checked In';
      else if (s === 'COMPLETED') status = 'Completed';

      return {
        id: a.id,
        time: a.startTime || '09:00',
        patientName: a.patientName || 'Patient',
        doctor: a.doctorName || 'Assigned Doctor',
        status,
      };
    });
  }, [appointments]);

  // Map top queue entries for display
  const topQueueItems: DashboardQueueItem[] = useMemo(() => {
    return queue.slice(0, 5).map((q) => {
      let statusText = 'Waiting';
      const s = (q.status || '').toUpperCase();
      if (s === 'IN_PROGRESS' || s === 'CALLED' || s === 'IN_CONSULTATION') statusText = 'In Consultation';
      else if (s === 'COMPLETED') statusText = 'Completed';

      return {
        queueNumber: q.ticketNumber || `Q-${q.id.slice(0, 4)}`,
        patientName: q.patientName || 'Patient',
        type: q.priority || 'Standard',
        status: statusText,
      };
    });
  }, [queue]);

  // Dynamic KPIs
  const liveKPIs = useMemo(() => {
    return [
      {
        title: "Today's Appointments",
        value: String(todayAppointments.length),
        change: 'Scheduled today',
        trend: 'up' as const,
        trendLabel: '',
        iconName: 'calendar' as const,
        color: 'blue' as const,
      },
      {
        title: 'Patients Waiting',
        value: String(waitingCount),
        change: `${inConsultCount} in consultation`,
        trend: 'up' as const,
        trendLabel: 'live triage queue',
        iconName: 'clock' as const,
        color: 'amber' as const,
      },
      {
        title: 'Active Patients',
        value: String(totalPatientsCount),
        change: 'in clinic database',
        trend: 'up' as const,
        trendLabel: 'registered dossiers',
        iconName: 'users' as const,
        color: 'cyan' as const,
      },
      {
        title: 'Offline Queue',
        value: String(syncStatus.pendingOperations),
        suffix: ' ops',
        change: isOnline ? 'Online Synced' : 'SQLite Local',
        trendLabel: 'sync engine',
        iconName: 'clock' as const,
        color: 'emerald' as const,
      },
      {
        title: 'Consultations Done',
        value: String(completedCount),
        change: 'Completed visits',
        trend: 'up' as const,
        trendLabel: 'today',
        iconName: 'check-circle' as const,
        color: 'purple' as const,
      },
    ];
  }, [todayAppointments.length, waitingCount, inConsultCount, totalPatientsCount, syncStatus, isOnline, completedCount]);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Receptionist Workstation"
            subtitle="Manage patient registration, appointments, check-ins, queue and billing with SQLite offline sync."
            icon={Users}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh Dashboard"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-200" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold leading-none">Clinic Open</div>
                    <div className="text-[9px] text-blue-100 font-medium leading-none mt-0.5">
                      8:00 AM - 5:00 PM
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckInModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Check In Patient
                </button>
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {liveKPIs.map((kpi, idx) => (
              <ReceptionistStatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                suffix={kpi.suffix}
                change={kpi.change}
                trend={kpi.trend}
                trendLabel={kpi.trendLabel}
                iconName={kpi.iconName}
                color={kpi.color}
              />
            ))}
          </div>
        }
      >
        {/* Quick Action Station */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-xl sm:rounded-2xl p-3.5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-2">
                <span>Reception Operations Panel</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isOnline ? 'Online Synced' : 'Offline Mode'}
                </span>
              </div>
              <div className="text-[11px] text-blue-100 font-normal">
                {syncStatus.pendingOperations > 0
                  ? `${syncStatus.pendingOperations} operations waiting in local SQLite queue`
                  : 'Workstation ready. All registrations & queue tickets synced.'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('registration')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Register Patient</span>
            </button>
            <button
              onClick={() => setAppointmentModalOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => onNavigateTab('billing')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Process Bill</span>
            </button>
          </div>
        </div>

        {/* Charts & Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
          {/* Patient Flow Bar Chart */}
          <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Weekly Patient Flow</h2>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" /> Registered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Appointments
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> Checked In
                </span>
              </div>
            </div>

            <div className="h-44 sm:h-48 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientFlowChart} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="registered" fill="#1E6BFF" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="appointments" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="checkedIn" fill="#8B5CF6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Types Donut Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Visit Types</h2>
              </div>

              <div className="relative h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientTypesDonut}
                      innerRadius={45}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {patientTypesDonut.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold text-slate-400">Total</span>
                  <span className="text-lg font-black text-slate-900 leading-none">
                    {appointments.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {patientTypesDonut.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dual Columns: Today's Appointments & Live Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Today's Appointments Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                  Today&apos;s Appointments
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({todayAppointments.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Doctor</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No appointments scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    topAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 font-mono font-bold text-slate-700">{apt.time}</td>
                        <td className="py-2 font-bold text-slate-900">{apt.patientName}</td>
                        <td className="py-2 text-slate-600">{apt.doctor}</td>
                        <td className="py-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              apt.status === 'Checked In'
                                ? 'bg-blue-100 text-blue-700'
                                : apt.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Queue Overview */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                  Live Queue Waiting List
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('queue')}
                className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Queue ({waitingCount})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {topQueueItems.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No patients in queue currently.
                </div>
              ) : (
                topQueueItems.map((q) => (
                  <div
                    key={q.queueNumber}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        {q.queueNumber}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{q.patientName}</div>
                        <div className="text-[10px] text-slate-400">
                          {q.type}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[11px] font-bold ${
                          q.status === 'In Consultation' ? 'text-purple-600' : 'text-blue-600'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Dynamic Modals */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          onAppointmentBooked={() => {
            void loadDashboardData();
            setAppointmentModalOpen(false);
          }}
        />
      )}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
          onCheckInComplete={() => {
            void loadDashboardData();
            setCheckInModalOpen(false);
          }}
        />
      )}
    </>
  );
}

export default React.memo(DashboardPage);
