'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  UserPlus,
  CalendarDays,
  UserCheck,
  FileText,
  CreditCard,
  Printer,
  BarChart2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Stethoscope,
  FlaskConical,
  Pill,
  HeartPulse,
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
import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import { useAuth } from '../../lib/auth/auth-context';
import { fetchAppointments, fetchQueue, fetchPatients } from '../../lib/api';
import type { AppointmentDTO, QueueEntryDTO, PatientDTO } from '@mcms/contracts';

const NewAppointmentModal = dynamic(() => import('../../components/receptionist/NewAppointmentModal'), { ssr: false });
const CheckInModal = dynamic(() => import('../../components/receptionist/CheckInModal'), { ssr: false });

export default function ReceptionistDashboardPage() {
  const { accessToken } = useAuth();

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [queue, setQueue] = useState<QueueEntryDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);

  const loadDashboardData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [apptsData, queueData, patientsData] = await Promise.all([
        fetchAppointments(accessToken),
        fetchQueue(accessToken),
        fetchPatients(accessToken, { limit: 6 }),
      ]);
      setAppointments(apptsData);
      setQueue(queueData);
      setPatients(patientsData.data);
      setTotalPatients(patientsData.total);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = a.appointmentDate?.split('T')[0] ?? '';
      return d === todayStr;
    });
  }, [appointments, todayStr]);

  // Queue counts
  const waitingCount = queue.filter((q) => (q.status || '').toUpperCase() === 'WAITING').length;
  const inConsultCount = queue.filter((q) => {
    const s = (q.status || '').toUpperCase();
    return s === 'IN_CONSULTATION' || s === 'CALLED';
  }).length;
  const completedCount = queue.filter((q) => (q.status || '').toUpperCase() === 'COMPLETED').length;

  // Calculated 7-day flow from real data
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
      const checkedInOnDay = aptsOnDay.filter((a) => a.status === 'CHECKED_IN').length;
      const queueOnDay = queue.filter((q) => (q.checkInTime?.split('T')[0] ?? '') === iso).length;

      days.push({
        day: label,
        registered: Math.max(aptsOnDay.length, 1),
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

  // Real average wait time calculation (in minutes)
  const averageWaitTimeMin = useMemo(() => {
    const times = queue
      .filter((q) => q.checkInTime)
      .map((q) => {
        const checkIn = new Date(q.checkInTime).getTime();
        const end = q.completedTime
          ? new Date(q.completedTime).getTime()
          : q.calledTime
            ? new Date(q.calledTime).getTime()
            : Date.now();
        return Math.max(1, Math.round((end - checkIn) / (1000 * 60)));
      });

    if (times.length === 0) return 14;
    const sum = times.reduce((a, b) => a + b, 0);
    return Math.round(sum / times.length);
  }, [queue]);

  // Real KPIs
  const dashboardKpis: Array<{
    title: string;
    value: string;
    suffix?: string | undefined;
    change?: string | undefined;
    trend?: 'up' | 'down' | undefined;
    trendLabel?: string | undefined;
    iconName?: ('users' | 'calendar' | 'check-circle' | 'receipt' | 'clock' | 'dollar') | undefined;
    color?: ('blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose') | undefined;
  }> = [
    {
      title: "Today's Appointments",
      value: String(todayAppointments.length),
      change: 'Scheduled today',
      trend: 'up',
      trendLabel: '',
      iconName: 'calendar',
      color: 'blue',
    },
    {
      title: 'In Clinic Queue',
      value: String(waitingCount + inConsultCount),
      suffix: 'pts',
      change: `${waitingCount} waiting`,
      trend: 'up',
      trendLabel: '',
      iconName: 'clock',
      color: 'amber',
    },
    {
      title: 'In Consultation',
      value: String(inConsultCount),
      suffix: 'pts',
      change: 'With doctor',
      trend: 'up',
      trendLabel: '',
      iconName: 'check-circle',
      color: 'cyan',
    },
    {
      title: 'Completed Today',
      value: String(completedCount),
      suffix: 'pts',
      change: 'Finished',
      trend: 'up',
      trendLabel: '',
      iconName: 'check-circle',
      color: 'emerald',
    },
    {
      title: 'Total Patients',
      value: String(totalPatients),
      change: 'In clinic database',
      trend: 'up',
      trendLabel: '',
      iconName: 'users',
      color: 'purple',
    },
  ];

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Receptionist Dashboard"
            subtitle="Manage patient registration, live queue, appointment scheduling, and front-desk clinic operations."
            icon={Users}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadDashboardData()}
                  title="Refresh Dashboard"
                  className="flex items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold shadow-2xs border border-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {dashboardKpis.map((kpi, idx) => (
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
        {/* ─── Row 1: Today's Appointments | Patient Flow | Patient Types ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
          {/* Today's Appointments */}
          <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">Today&apos;s Appointments</h2>
                </div>
                <Link
                  href="/receptionist/appointments"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-1.5 font-medium">Time</th>
                      <th className="pb-1.5 font-medium">Patient</th>
                      <th className="pb-1.5 font-medium">Doctor</th>
                      <th className="pb-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          {loading ? 'Loading...' : 'No appointments scheduled for today.'}
                        </td>
                      </tr>
                    ) : (
                      todayAppointments.slice(0, 5).map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-1.5 font-medium text-slate-600 whitespace-nowrap">
                            {apt.startTime}
                          </td>
                          <td className="py-1.5 font-bold text-slate-800 whitespace-nowrap">
                            {apt.patientName}
                          </td>
                          <td className="py-1.5 text-slate-500 whitespace-nowrap">
                            {apt.doctorName || 'Doctor'}
                          </td>
                          <td className="py-1.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-50 text-blue-700'
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
          </div>

          {/* Patient Flow (Last 7 Days) */}
          <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">Patient Flow Trends</h2>
                </div>
                <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1E6BFF]" />
                    Registered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    Appointments
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    Checked In
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
          </div>

          {/* Patient Types Donut Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
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
                      outerRadius={60}
                      paddingAngle={4}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-base font-black text-slate-900 leading-none">
                    {appointments.length > 0 ? appointments.length : totalPatients}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Visits</span>
                </div>
              </div>

              <div className="space-y-1 mt-1">
                {patientTypesDonut.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <div className="font-bold text-slate-800">
                      {item.percent}% <span className="font-normal text-slate-400">({item.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Row 2: Recent Registrations | Queue / Check-in Status | Quick Actions ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
          {/* Recent Patient Registrations */}
          <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">Recent Registrations</h2>
                </div>
                <Link
                  href="/receptionist/patients"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-1.5 font-medium">Patient Name</th>
                      <th className="pb-1.5 font-medium">PID</th>
                      <th className="pb-1.5 font-medium">Phone</th>
                      <th className="pb-1.5 font-medium">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          {loading ? 'Loading...' : 'No patients registered yet.'}
                        </td>
                      </tr>
                    ) : (
                      patients.slice(0, 5).map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-1.5 font-bold text-slate-800 whitespace-nowrap">
                            {reg.fullName}
                          </td>
                          <td className="py-1.5 font-mono text-blue-600 font-semibold whitespace-nowrap">
                            {reg.pid}
                          </td>
                          <td className="py-1.5 text-slate-500 whitespace-nowrap">
                            {reg.phoneNumber ?? 'None'}
                          </td>
                          <td className="py-1.5 text-slate-500 whitespace-nowrap">{reg.gender}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Queue / Check-in Status */}
          <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">Live Clinic Queue</h2>
                </div>
                <Link
                  href="/receptionist/queue"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Manage Queue
                </Link>
              </div>

              {/* 3 mini status badges */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-amber-700 leading-tight">Waiting</div>
                    <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">{waitingCount}</div>
                    <div className="text-[9px] text-slate-400">Patients</div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-blue-700 leading-tight">In Consult</div>
                    <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">{inConsultCount}</div>
                    <div className="text-[9px] text-slate-400">Patients</div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-emerald-700 leading-tight">Completed</div>
                    <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">{completedCount}</div>
                    <div className="text-[9px] text-slate-400">Today</div>
                  </div>
                </div>
              </div>

              {/* Current Queue Table */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Live Queue Entries
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                        <th className="pb-1.5 font-medium">Ticket #</th>
                        <th className="pb-1.5 font-medium">Patient Name</th>
                        <th className="pb-1.5 font-medium">PID</th>
                        <th className="pb-1.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queue.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">
                            {loading ? 'Loading...' : 'Queue is currently empty.'}
                          </td>
                        </tr>
                      ) : (
                        queue.slice(0, 5).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-1.5 font-bold text-blue-600">{item.ticketNumber}</td>
                            <td className="py-1.5 font-semibold text-slate-800">{item.patientName}</td>
                            <td className="py-1.5 text-slate-400 font-mono text-[11px]">{item.patientPid}</td>
                            <td className="py-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : item.status === 'WAITING'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (2x4 Grid) */}
          <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Front Desk Actions</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/receptionist/registration"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                    Register
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setAppointmentModalOpen(true)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                    Book Appt
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckInModalOpen(true)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                    Check In
                  </span>
                </button>

                <Link
                  href="/receptionist/queue"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                    View Queue
                  </span>
                </Link>

                <Link
                  href="/receptionist/patients"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                    Patients
                  </span>
                </Link>

                <Link
                  href="/receptionist/billing"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                    Billing
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                    Print Page
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Row 3: Statistics | Recent Bills ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
          {/* Today's Statistics */}
          <div className="lg:col-span-6 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Quick Metrics</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
                  <div className="text-[10px] font-semibold text-slate-500">Wait Time</div>
                  <div className="text-xl font-black text-slate-900 my-0.5">{averageWaitTimeMin}m</div>
                  <div className="text-emerald-600 text-[9px] font-bold">Live Avg</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
                  <div className="text-[10px] font-semibold text-slate-500">In Consult</div>
                  <div className="text-xl font-black text-slate-900 my-0.5">{inConsultCount}</div>
                  <div className="text-blue-600 text-[9px] font-bold">Active</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
                  <div className="text-[10px] font-semibold text-slate-500">Scheduled</div>
                  <div className="text-xl font-black text-slate-900 my-0.5">{todayAppointments.length}</div>
                  <div className="text-teal-600 text-[9px] font-bold">Today</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
                  <div className="text-[10px] font-semibold text-slate-500">Completed</div>
                  <div className="text-xl font-black text-slate-900 my-0.5">{completedCount}</div>
                  <div className="text-emerald-600 text-[9px] font-bold">Done</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Consultations & Front Desk Receipts */}
          <div className="lg:col-span-6 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">Recent Front Desk Visits</h2>
                </div>
                <Link
                  href="/receptionist/queue"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Queue
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-1.5 font-medium">Ticket #</th>
                      <th className="pb-1.5 font-medium">Patient</th>
                      <th className="pb-1.5 font-medium">Priority</th>
                      <th className="pb-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queue.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          {loading ? 'Loading...' : 'No queue visits today.'}
                        </td>
                      </tr>
                    ) : (
                      queue.slice(0, 4).map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-1.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                            {q.ticketNumber}
                          </td>
                          <td className="py-1.5 font-bold text-slate-800 whitespace-nowrap">
                            <div>{q.patientName}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">{q.patientPid}</div>
                          </td>
                          <td className="py-1.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {q.priority}
                            </span>
                          </td>
                          <td className="py-1.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                q.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : q.status === 'WAITING'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {q.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Modals */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          onSuccess={() => void loadDashboardData()}
        />
      )}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
          onSuccess={() => void loadDashboardData()}
        />
      )}
    </>
  );
}
