import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  CalendarDays,
  Stethoscope,
  Building2,
  TrendingUp,
  Receipt,
  BedDouble,
  ChevronRight,
  UserPlus,
  CalendarPlus,
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
import { useAuth } from '../../auth/AuthContext';
import { fetchClinicDashboardStats } from '../../api/staff';
import type { ClinicDashboardStatsDTO } from '@mcms/contracts';

export interface DashboardPageProps {
  onNavigate?: (tab: string) => void;
}

const INITIAL_STATS: ClinicDashboardStatsDTO = {
  totalPatients: 0,
  totalDoctors: 0,
  totalDepartments: 0,
  todayAppointmentsCount: 0,
  activeQueueCount: 0,
  occupiedBedsCount: 0,
  availableBedsCount: 0,
  recentAppointments: [],
  departmentBreakdown: [],
  weeklyTrends: [
    { day: 'Mon', thisWeek: 0, lastWeek: 0 },
    { day: 'Tue', thisWeek: 0, lastWeek: 0 },
    { day: 'Wed', thisWeek: 0, lastWeek: 0 },
    { day: 'Thu', thisWeek: 0, lastWeek: 0 },
    { day: 'Fri', thisWeek: 0, lastWeek: 0 },
    { day: 'Sat', thisWeek: 0, lastWeek: 0 },
    { day: 'Sun', thisWeek: 0, lastWeek: 0 },
  ],
  recentPatients: [],
};

const AVATAR_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { accessToken, user } = useAuth();
  const [stats, setStats] = useState<ClinicDashboardStatsDTO>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [appointmentFilter, setAppointmentFilter] = useState<string>('ALL');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!accessToken) return;
    try {
      setIsLoading(true);
      const data = await fetchClinicDashboardStats(accessToken);
      if (data && typeof data === 'object') {
        setStats({
          totalPatients: typeof data.totalPatients === 'number' ? data.totalPatients : 0,
          totalDoctors: typeof data.totalDoctors === 'number' ? data.totalDoctors : 0,
          totalDepartments: typeof data.totalDepartments === 'number' ? data.totalDepartments : 0,
          todayAppointmentsCount: typeof data.todayAppointmentsCount === 'number' ? data.todayAppointmentsCount : 0,
          activeQueueCount: typeof data.activeQueueCount === 'number' ? data.activeQueueCount : 0,
          occupiedBedsCount: typeof data.occupiedBedsCount === 'number' ? data.occupiedBedsCount : 0,
          availableBedsCount: typeof data.availableBedsCount === 'number' ? data.availableBedsCount : 0,
          recentAppointments: Array.isArray(data.recentAppointments) ? data.recentAppointments : [],
          departmentBreakdown: Array.isArray(data.departmentBreakdown) ? data.departmentBreakdown : [],
          weeklyTrends:
            Array.isArray(data.weeklyTrends) && data.weeklyTrends.length > 0
              ? data.weeklyTrends
              : INITIAL_STATS.weeklyTrends,
          recentPatients: Array.isArray(data.recentPatients) ? data.recentPatients : [],
        });
      }
    } catch (err) {
      console.error('Failed to load clinic dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // Display user name safely
  const greetingName = useMemo(() => {
    if (user?.displayName) return user.displayName.split(' ')[0] ?? 'Admin';
    if (user?.firstName) return user.firstName;
    return 'Clinic Admin';
  }, [user]);

  // Dynamic calculations based on period filter
  const periodMultiplier = useMemo(() => {
    if (selectedPeriod === 'week') return 7;
    if (selectedPeriod === 'month') return 30;
    return 1;
  }, [selectedPeriod]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    const list = stats?.recentAppointments ?? [];
    return list.filter((a) => {
      if (!a) return false;
      if (appointmentFilter !== 'ALL' && a.status !== appointmentFilter) return false;
      if (selectedDept && a.departmentName !== selectedDept) return false;
      return true;
    });
  }, [stats?.recentAppointments, appointmentFilter, selectedDept]);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    const list = stats?.recentPatients ?? [];
    if (!patientSearch.trim()) return list;
    const q = patientSearch.toLowerCase();
    return list.filter((p) => {
      if (!p) return false;
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.pid && p.pid.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.department && p.department.toLowerCase().includes(q))
      );
    });
  }, [stats?.recentPatients, patientSearch]);

  const quickActions = [
    {
      title: 'Register Patient',
      desc: 'Create new EHR chart & triage',
      icon: UserPlus,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
      tab: 'patients',
    },
    {
      title: 'Book Appointment',
      desc: 'Schedule consultation slot',
      icon: CalendarPlus,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
      tab: 'appointments',
    },
    {
      title: 'Clinical Staff',
      desc: 'Physicians & credentials',
      icon: Stethoscope,
      color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      tab: 'staff',
    },
    {
      title: 'Rooms & Bed Setup',
      desc: 'Wards, capacity & status',
      icon: BedDouble,
      color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
      tab: 'clinic-management',
    },
    {
      title: 'Clinic Branches',
      desc: 'Locations & facility config',
      icon: Building2,
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
      tab: 'branches',
    },
    {
      title: 'Invoices & Billing',
      desc: 'Tariffs, claims & payments',
      icon: Receipt,
      color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200',
      tab: 'billing',
    },
  ];

  const totalBeds = (stats?.occupiedBedsCount ?? 0) + (stats?.availableBedsCount ?? 0);

  return (
    <div className="space-y-6">
      {/* ── Top Header & Live Actions ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Interactive Clinic Admin Workstation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {greetingName}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            Live operations monitor: click any KPI card or quick action to navigate directly into clinical management modules.
          </p>
        </div>

        {/* Period Selector & Manual Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/10 text-xs font-semibold">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-xl transition-all capitalize ${selectedPeriod === p ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-blue-100 hover:text-white'
                  }`}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <button
            onClick={() => void fetchStats()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/10 text-xs font-semibold text-white transition-all disabled:opacity-50"
            title="Click to sync latest data from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── Interactive KPI Stat Cards (Clickable) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Registered Patients',
            value: ((stats?.totalPatients ?? 0) * (selectedPeriod === 'today' ? 1 : 1)).toLocaleString(),
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100 hover:border-blue-300',
            tab: 'patients',
            tag: `${stats?.totalPatients ?? 0} active in EHR`,
          },
          {
            label: 'Physicians On Staff',
            value: (stats?.totalDoctors ?? 0).toString(),
            icon: Stethoscope,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100 hover:border-emerald-300',
            tab: 'staff',
            tag: 'Rostered Physicians',
          },
          {
            label: selectedPeriod === 'today' ? "Today's Appointments" : 'Estimated Appointments',
            value: ((stats?.todayAppointmentsCount ?? 0) * periodMultiplier).toString(),
            icon: CalendarDays,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100 hover:border-purple-300',
            tab: 'appointments',
            tag: `${stats?.activeQueueCount ?? 0} in queue`,
          },
          {
            label: 'Bed Occupancy',
            value: `${stats?.occupiedBedsCount ?? 0} / ${totalBeds}`,
            icon: BedDouble,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100 hover:border-amber-300',
            tab: 'clinic-management',
            tag: `${stats?.availableBedsCount ?? 0} available`,
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate?.(kpi.tab)}
              className={`p-5 rounded-2xl bg-white border ${kpi.border} shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[11px]">
                  <span className="text-slate-400 font-medium">{kpi.tag}</span>
                  <span className="text-blue-600 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Interactive Quick Actions Strip ── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Fast Action Shortcuts</h2>
            <p className="text-xs text-slate-500">Jump directly to administrative tasks</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any action</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onNavigate?.(qa.tab)}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col items-start gap-2.5 active:scale-98 ${qa.color}`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/80 shadow-2xs flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">{qa.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{qa.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Appointment Volume (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Patient Visit Trends</h2>
              <p className="text-xs text-slate-500">Comparing current week vs previous period</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Live Records
              </span>
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">Specialty Distribution</h2>
              {selectedDept && (
                <button
                  onClick={() => setSelectedDept(null)}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">Patient volume by clinical department</p>
            <div className="h-44 w-full flex items-center justify-center">
              {stats.departmentBreakdown && stats.departmentBreakdown.length > 0 ? (
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
                      onClick={(entry) => {
                        const name = entry?.name;
                        setSelectedDept((prev) => (prev === name ? null : (name ?? null)));
                      }}
                      cursor="pointer"
                    >
                      {stats.departmentBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || '#2563EB'}
                          stroke={entry.name === selectedDept ? '#000' : 'none'}
                          strokeWidth={entry.name === selectedDept ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: 12, border: 'none', color: '#fff', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400 text-center">
                  No department breakdown available.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {stats.departmentBreakdown && stats.departmentBreakdown.slice(0, 6).map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDept(d.name === selectedDept ? null : d.name)}
                className={`flex items-center gap-2 text-xs p-1 rounded-lg text-left transition-colors ${selectedDept === d.name ? 'bg-blue-50 font-bold text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                  }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color || '#2563EB' }} />
                <span className="truncate">{d.name}</span>
                <span className="text-[10px] text-slate-400 ml-auto font-mono">{d.patientVisits}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive Recent Patients Table & Appointments Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Patients</h2>
                <p className="text-xs text-slate-500">Latest active patients registered in EHR</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('patients')}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name, PID or phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p, i) => (
                  <div
                    key={p.id || i}
                    onClick={() => onNavigate?.('patients')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 rounded-xl px-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                        style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      >
                        {p.avatar || 'PT'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                          <span>{p.pid || '—'}</span>
                          <span>•</span>
                          <span>{p.phone || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {p.department || 'General'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.lastVisit || 'Recently'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  {isLoading ? 'Loading patient records...' : 'No patient records found in EHR.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Appointments Feed */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Appointment Queue</h2>
                <p className="text-xs text-slate-500">Live consult requests & scheduled check-ins</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('appointments')}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5"
              >
                View Calendar <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {(['ALL', 'CONFIRMED', 'SCHEDULED', 'CHECKED_IN'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAppointmentFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${appointmentFilter === st
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onNavigate?.('appointments')}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 rounded-xl px-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 text-[11px] font-bold text-slate-500 shrink-0">
                        {a.startTime || '—'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {a.patientName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Attending: {a.doctorName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {a.departmentName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${a.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : a.status === 'CHECKED_IN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  {isLoading ? 'Loading appointment queue...' : 'No appointments scheduled today.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
