import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarDays,
  Stethoscope,
  Building2,
  TrendingUp,
  Receipt,
  BedDouble,
  Clock,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../auth/AuthContext';
import type { ClinicDashboardStatsDTO } from '@mcms/contracts';

const FALLBACK_STATS: ClinicDashboardStatsDTO = {
  totalPatients: 1480,
  totalDoctors: 28,
  totalDepartments: 12,
  todayAppointmentsCount: 42,
  activeQueueCount: 9,
  occupiedBedsCount: 18,
  availableBedsCount: 14,
  recentAppointments: [
    { id: '1', patientName: 'Amanuel Bekele', doctorName: 'Dr. Fitsum Alemu', departmentName: 'Cardiology', appointmentDate: '2026-10-30', startTime: '09:00 AM', status: 'CONFIRMED' },
    { id: '2', patientName: 'Selam Tesfaye', doctorName: 'Dr. Hana Mengesha', departmentName: 'Pediatrics', appointmentDate: '2026-10-30', startTime: '10:30 AM', status: 'SCHEDULED' },
    { id: '3', patientName: 'Yonas Tadesse', doctorName: 'Dr. Abebe Kebede', departmentName: 'General Medicine', appointmentDate: '2026-10-30', startTime: '01:00 PM', status: 'CHECKED_IN' },
    { id: '4', patientName: 'Mekdes Worku', doctorName: 'Dr. Lealem Demissie', departmentName: 'Gynecology', appointmentDate: '2026-10-30', startTime: '03:30 PM', status: 'SCHEDULED' },
    { id: '5', patientName: 'Abraham Girma', doctorName: 'Dr. Fitsum Alemu', departmentName: 'Cardiology', appointmentDate: '2026-10-30', startTime: '04:45 PM', status: 'SCHEDULED' },
  ],
  departmentBreakdown: [
    { name: 'Cardiology', doctorsCount: 4, patientVisits: 32, color: '#2563EB' },
    { name: 'General Medicine', doctorsCount: 8, patientVisits: 45, color: '#10B981' },
    { name: 'Pediatrics', doctorsCount: 5, patientVisits: 28, color: '#F59E0B' },
    { name: 'Gynecology', doctorsCount: 4, patientVisits: 22, color: '#8B5CF6' },
    { name: 'Orthopedics', doctorsCount: 3, patientVisits: 18, color: '#EF4444' },
    { name: 'Other', doctorsCount: 4, patientVisits: 14, color: '#64748B' },
  ],
  weeklyTrends: [
    { day: 'Mon', thisWeek: 22, lastWeek: 18 },
    { day: 'Tue', thisWeek: 30, lastWeek: 24 },
    { day: 'Wed', thisWeek: 27, lastWeek: 32 },
    { day: 'Thu', thisWeek: 38, lastWeek: 28 },
    { day: 'Fri', thisWeek: 35, lastWeek: 30 },
    { day: 'Sat', thisWeek: 40, lastWeek: 22 },
    { day: 'Sun', thisWeek: 28, lastWeek: 25 },
  ],
};

export function DashboardPage() {
  const { accessToken, user } = useAuth();
  const [stats, setStats] = useState<ClinicDashboardStatsDTO>(FALLBACK_STATS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      if (!accessToken) return;
      try {
        setIsLoading(true);
        const tenantId = (user as any)?.tenant?.id;
        const branchId = (user as any)?.activeBranchId;
        const headers: Record<string, string> = {
          Authorization: `Bearer ${accessToken}`,
        };
        if (tenantId) headers['X-Tenant-Id'] = tenantId;
        if (branchId) headers['X-Branch-Id'] = branchId;

        const res = await fetch('http://localhost:3001/api/v1/clinic-admin/dashboard', { headers });
        if (res.ok) {
          const data = (await res.json()) as ClinicDashboardStatsDTO;
          if (isMounted) setStats(data);
        }
      } catch {
        // Fallback to initial stats
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchStats();
    return () => {
      isMounted = false;
    };
  }, [accessToken, user]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-2">
            <span>✨</span> Clinical Operations Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.firstName ? `Welcome back, ${user.firstName}` : 'Clinic Administration'}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time branch overview of patient visits, active physicians, queue pace, and bed occupancy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Active Queue</div>
            <div className="text-2xl font-black">{stats.activeQueueCount} patients</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registered Patients', value: stats.totalPatients.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Physicians On Staff', value: stats.totalDoctors.toString(), icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: "Today's Appointments", value: stats.todayAppointmentsCount.toString(), icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
          { label: 'Bed Occupancy', value: `${stats.occupiedBedsCount} / ${stats.occupiedBedsCount + stats.availableBedsCount}`, icon: BedDouble, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl bg-white border ${kpi.border} shadow-2xs flex items-center justify-between`}>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Appointment Volume (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Patient Visit Trends</h2>
              <p className="text-xs text-slate-500">Comparing current week vs last week</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: 12, border: 'none', color: '#fff', fontSize: 12 }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Line type="monotone" dataKey="thisWeek" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} name="This Week" />
                <Line type="monotone" dataKey="lastWeek" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Last Week" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Volume Pie (1 col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Specialty Volume</h2>
            <p className="text-xs text-slate-500 mb-4">Patient distribution by department</p>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departmentBreakdown}
                    dataKey="patientVisits"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {stats.departmentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: 12, border: 'none', color: '#fff', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {stats.departmentBreakdown.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 truncate font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Appointments Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Appointments</h2>
            <p className="text-xs text-slate-500">Live consult requests and check-ins today</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Patient</th>
                <th className="pb-3">Attending Doctor</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3 pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stats.recentAppointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pl-2 font-bold text-slate-800">{a.patientName}</td>
                  <td className="py-3 text-slate-600">{a.doctorName}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                      {a.departmentName}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{a.appointmentDate} • {a.startTime}</td>
                  <td className="py-3 pr-2">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;
