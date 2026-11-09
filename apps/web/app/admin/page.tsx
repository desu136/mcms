'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth-context';
import { fetchClinicDashboardStats } from '../../lib/api/staff';
import type { ClinicDashboardStatsDTO } from '@mcms/contracts';
import {
  Users,
  CalendarDays,
  Stethoscope,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  FileText,
  BarChart2,
  ChevronLeft,
  Activity,
  RefreshCw,
  Search,
  ArrowUpRight,
  Sparkles,
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

// ─── Default Trend Structure ──────────────────────────────────────────────────

const DEFAULT_WEEKLY_TRENDS = [
  { day: 'Mon', thisWeek: 0, lastWeek: 0 },
  { day: 'Tue', thisWeek: 0, lastWeek: 0 },
  { day: 'Wed', thisWeek: 0, lastWeek: 0 },
  { day: 'Thu', thisWeek: 0, lastWeek: 0 },
  { day: 'Fri', thisWeek: 0, lastWeek: 0 },
  { day: 'Sat', thisWeek: 0, lastWeek: 0 },
  { day: 'Sun', thisWeek: 0, lastWeek: 0 },
];

const avatarColors = ['#2979FF', '#00C853', '#9C27B0', '#FF6D00', '#F44336', '#00BCD4'];

// ─── Small Components ─────────────────────────────────────────────────────────

const StatCard = ({
  icon,
  label,
  value,
  change,
  changeLabel,
  iconBg,
  iconColor,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  iconBg: string;
  iconColor: string;
  href: string;
}) => {
  const isUp = change > 0;
  const isFlat = change === 0;

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-3.5 group cursor-pointer"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
        style={{ backgroundColor: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-gray-500 font-medium truncate flex items-center justify-between">
          <span>{label}</span>
          <ChevronRight size={13} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="text-2xl font-bold text-gray-800 leading-tight">{value}</div>
        <div className="flex items-center gap-1 text-[11px] font-medium mt-0.5">
          {isFlat ? (
            <Minus size={11} className="text-gray-400" />
          ) : isUp ? (
            <TrendingUp size={11} className="text-emerald-500" />
          ) : (
            <TrendingDown size={11} className="text-red-500" />
          )}
          <span className={isFlat ? 'text-gray-400' : isUp ? 'text-emerald-600' : 'text-red-500'}>
            {isFlat ? '→' : isUp ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-gray-400 font-normal">{changeLabel}</span>
        </div>
      </div>
    </Link>
  );
};

// Interactive mini-calendar with real dates & selection
const MiniCalendar = ({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) => {
  const [current, setCurrent] = useState(() => new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (days.length % 7 !== 0) days.push(null);

  const today = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">{monthName}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
          >
            <ChevronLeft size={14} className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
          >
            <ChevronRight size={14} className="text-gray-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="h-8" />;
          const isToday =
            d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected =
            d === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();

          return (
            <div key={i} className="flex items-center justify-center h-8">
              <button
                type="button"
                onClick={() => onSelectDate(new Date(year, month, d))}
                className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                  isSelected
                    ? 'bg-[#2979FF] text-white shadow-md shadow-blue-300 font-bold'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {d}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ClinicAdminDashboard() {
  const { user, accessToken } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'Admin';

  const [stats, setStats] = useState<ClinicDashboardStatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [patientSearch, setPatientSearch] = useState('');
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  const loadStats = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await fetchClinicDashboardStats(accessToken);
      if (data) setStats(data);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Multiply count estimate for week/month periods
  const periodMultiplier = useMemo(() => {
    if (selectedPeriod === 'week') return 7;
    if (selectedPeriod === 'month') return 30;
    return 1;
  }, [selectedPeriod]);

  const chartData = stats?.weeklyTrends ?? DEFAULT_WEEKLY_TRENDS;
  const deptData = stats?.departmentBreakdown?.length
    ? stats.departmentBreakdown.map((d, i) => ({
        name: d.name,
        value: d.patientVisits,
        color: d.color || '#2979FF',
      }))
    : [];

  const rawPatients = stats?.recentPatients ?? [];
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return rawPatients;
    const q = patientSearch.toLowerCase();
    return rawPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p as any).pid?.toLowerCase().includes(q),
    );
  }, [rawPatients, patientSearch]);

  const recentAppts = stats?.recentAppointments ?? [];
  const fmt = (n: number | undefined) => (isLoading ? '—' : (n ?? 0).toLocaleString());

  return (
    <div className="flex gap-0 h-full">
      {/* ── Left + Center ── */}
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">
        {/* Greeting & Interactive Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Good Morning, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's what's happening at your clinic today.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Filter */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                    selectedPeriod === p ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => void loadStats()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs transition disabled:opacity-50"
              title="Refresh clinic data"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-blue-600' : 'text-gray-500'} />
              <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
            </button>

            {/* Date Display */}
            <div className="hidden md:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
              <CalendarDays size={16} className="text-[#2979FF]" />
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-700">{dateStr}</div>
                <div className="text-[10px] text-gray-400">{dayStr}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Workspace Direct Switch Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md shadow-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold">Doctor Workspace Available</div>
              <div className="text-xs text-blue-100">
                View your personal schedule, consultation encounters, and patient charts
              </div>
            </div>
          </div>
          <Link
            href="/doctor"
            className="px-4 py-2 rounded-xl bg-white text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors shrink-0 shadow-sm text-center"
          >
            Open Doctor Dashboard →
          </Link>
        </div>

        {/* Clickable Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Users size={22} />}
            label="Total Patients"
            value={fmt(stats?.totalPatients)}
            change={0}
            changeLabel="registered in EHR"
            iconBg="#E3F2FD"
            iconColor="#1565C0"
            href="/admin/patients"
          />
          <StatCard
            icon={<CalendarDays size={22} />}
            label={selectedPeriod === 'today' ? "Today's Appointments" : 'Estimated Appointments'}
            value={fmt((stats?.todayAppointmentsCount ?? 0) * periodMultiplier)}
            change={0}
            changeLabel="scheduled slots"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            href="/admin/appointments"
          />
          <StatCard
            icon={<Stethoscope size={22} />}
            label="Active Doctors"
            value={fmt(stats?.totalDoctors)}
            change={0}
            changeLabel="registered staff"
            iconBg="#F3E5F5"
            iconColor="#6A1B9A"
            href="/admin/staff"
          />
          <StatCard
            icon={<Activity size={22} />}
            label="Active Queue"
            value={fmt(stats?.activeQueueCount)}
            change={0}
            changeLabel="in waiting queue"
            iconBg="#FFF3E0"
            iconColor="#E65100"
            href="/admin/clinic-management"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* Line Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Appointments Overview</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 bg-[#2979FF] inline-block rounded" /> This Week
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 bg-gray-300 inline-block rounded" /> Last Week
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="thisWeek" stroke="#2979FF" strokeWidth={2.5} dot={{ r: 4, fill: '#2979FF', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lastWeek" stroke="#CBD5E1" strokeWidth={2} dot={{ r: 3, fill: '#CBD5E1', strokeWidth: 0 }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Patient Visits by Department</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie
                      data={deptData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {deptData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-gray-800">
                    {deptData.reduce((acc, d) => acc + d.value, 0).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">Total Visits</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {deptData.slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-gray-700 ml-1">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients Table with Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Recent Patients</h2>
              <p className="text-xs text-gray-400">Live EHR patient activity</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={13} className="text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                />
              </div>

              <Link href="/admin/patients" className="text-xs text-[#2979FF] font-medium hover:underline shrink-0">
                View All
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-50/60">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Phone</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">Last Visit</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPatients.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <Link href="/admin/patients" className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                        >
                          {p.avatar}
                        </div>
                        <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{p.phone}</td>
                    <td className="px-5 py-3 text-sm text-[#2979FF] font-medium">{p.department}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{p.lastVisit}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href="/admin/patients"
                        className="w-6 h-6 rounded-lg bg-gray-50 hover:bg-blue-50 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronRight size={13} className="text-gray-400 group-hover:text-blue-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                      {isLoading ? 'Loading patient records...' : 'No patient records found in EHR.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-72 xl:w-80 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-y-auto hidden lg:flex">
        {/* Upcoming Appointments */}
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Upcoming Appointments</h2>
            <Link href="/admin/appointments" className="text-xs text-[#2979FF] font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentAppts.length > 0 ? (
              recentAppts.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href="/admin/appointments"
                  className="flex items-center gap-3 group hover:bg-gray-50 rounded-xl px-2 py-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-gray-500 w-16 flex-shrink-0">{a.startTime || '—'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                      {a.patientName}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{a.doctorName}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 bg-blue-50 text-blue-700">
                    {a.departmentName || a.status}
                  </span>
                  <ChevronRight size={13} className="text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </Link>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                No upcoming appointments today.
              </div>
            )}
          </div>
        </div>

        {/* Interactive Calendar */}
        <div className="p-5 border-b border-gray-50">
          <MiniCalendar selectedDate={calendarDate} onSelectDate={setCalendarDate} />
        </div>

        {/* Quick Actions (Interactive Links) */}
        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <UserPlus size={18} />, label: 'Register Patient', color: '#E3F2FD', iconColor: '#1565C0', href: '/admin/patients?action=new' },
              { icon: <CalendarPlus size={18} />, label: 'Book Appointment', color: '#E8F5E9', iconColor: '#2E7D32', href: '/admin/appointments?action=new' },
              { icon: <FileText size={18} />, label: 'Add Medical Record', color: '#FFF3E0', iconColor: '#E65100', href: '/admin/medical-records' },
              { icon: <BarChart2 size={18} />, label: 'Generate Report', color: '#FFF8E1', iconColor: '#F57F17', href: '/admin/reports' },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-center group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: action.color }}
                >
                  <span style={{ color: action.iconColor }}>{action.icon}</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-600 group-hover:text-gray-900 leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
