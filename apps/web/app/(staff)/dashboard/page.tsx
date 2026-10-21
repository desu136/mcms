'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const appointmentsOverview = [
  { day: 'Mon', thisWeek: 22, lastWeek: 18 },
  { day: 'Tue', thisWeek: 30, lastWeek: 24 },
  { day: 'Wed', thisWeek: 27, lastWeek: 32 },
  { day: 'Thu', thisWeek: 38, lastWeek: 28 },
  { day: 'Fri', thisWeek: 35, lastWeek: 30 },
  { day: 'Sat', thisWeek: 40, lastWeek: 22 },
  { day: 'Sun', thisWeek: 28, lastWeek: 25 },
];

const departmentVisits = [
  { name: 'General Medicine', value: 32, color: '#2979FF' },
  { name: 'Pediatrics', value: 18, color: '#00C853' },
  { name: 'Gynecology', value: 15, color: '#9C27B0' },
  { name: 'Cardiology', value: 12, color: '#FF6D00' },
  { name: 'Orthopedics', value: 10, color: '#F44336' },
  { name: 'Other', value: 13, color: '#B0BEC5' },
];

const upcomingAppointments = [
  { time: '09:00 AM', patient: 'Amanuel Bekele', doctor: 'Dr. Fitsum Alemu', dept: 'General Medicine', deptColor: '#E3F2FD', deptText: '#1565C0' },
  { time: '10:30 AM', patient: 'Selam Tesfaye', doctor: 'Dr. Hana Mengesha', dept: 'Pediatrics', deptColor: '#E8F5E9', deptText: '#2E7D32' },
  { time: '01:00 PM', patient: 'Yonas Tadesse', doctor: 'Dr. Abebe Kebede', dept: 'Cardiology', deptColor: '#FFF3E0', deptText: '#E65100' },
  { time: '03:30 PM', patient: 'Mekdes Worku', doctor: 'Dr. Lealem Demissie', dept: 'Gynecology', deptColor: '#F3E5F5', deptText: '#6A1B9A' },
  { time: '04:45 PM', patient: 'Abraham Girma', doctor: 'Dr. Fitsum Alemu', dept: 'General Medicine', deptColor: '#E3F2FD', deptText: '#1565C0' },
];

const recentPatients = [
  { name: 'Aster Mulu', phone: '+251 912 345 678', dept: 'General Medicine', lastVisit: 'Oct 18, 2026', status: 'Active', avatar: 'AM' },
  { name: 'Abebe Assefa', phone: '+251 911 234 567', dept: 'Pediatrics', lastVisit: 'Oct 17, 2026', status: 'Active', avatar: 'AA' },
  { name: 'Tigist Alemu', phone: '+251 913 456 789', dept: 'Gynecology', lastVisit: 'Oct 16, 2026', status: 'Active', avatar: 'TA' },
  { name: 'Getachew Tadesse', phone: '+251 912 876 543', dept: 'Cardiology', lastVisit: 'Oct 15, 2026', status: 'Active', avatar: 'GT' },
  { name: 'Lidya Kebede', phone: '+251 918 765 432', dept: 'Orthopedics', lastVisit: 'Oct 14, 2026', status: 'Inactive', avatar: 'LK' },
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  iconBg: string;
  iconColor: string;
}) => {
  const isUp = change > 0;
  const isFlat = change === 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>
      <div className="text-sm text-gray-500 font-medium mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
      <div className="flex items-center gap-1 text-xs font-medium">
        {isFlat ? (
          <Minus size={13} className="text-gray-400" />
        ) : isUp ? (
          <TrendingUp size={13} className="text-emerald-500" />
        ) : (
          <TrendingDown size={13} className="text-red-500" />
        )}
        <span className={isFlat ? 'text-gray-400' : isUp ? 'text-emerald-600' : 'text-red-500'}>
          {isFlat ? '→' : isUp ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span className="text-gray-400 font-normal">{changeLabel}</span>
      </div>
    </div>
  );
};

// Simple mini-calendar
const MiniCalendar = () => {
  const today = new Date(2026, 9, 19); // Oct 19 2026
  const [current, setCurrent] = useState(new Date(2026, 9, 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (days.length % 7 !== 0) days.push(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">{monthName}</span>
        <div className="flex gap-1">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition">
            <ChevronLeft size={14} className="text-gray-500" />
          </button>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition">
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
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={i} className="flex items-center justify-center h-8">
              {d ? (
                <button
                  className={`w-7 h-7 rounded-full text-xs font-medium transition
                    ${isToday ? 'bg-[#2979FF] text-white shadow-md shadow-blue-300' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {d}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ClinicAdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'Admin';

  const now = new Date(2026, 9, 19);
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="flex gap-0 h-full">
      {/* ── Left + Center ── */}
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">

        {/* Greeting */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Good Morning, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's what's happening at your clinic today.</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
            <CalendarDays size={16} className="text-[#2979FF]" />
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">{dateStr}</div>
              <div className="text-xs text-gray-400">{dayStr}</div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Users size={22} />}
            label="Total Patients"
            value="1,248"
            change={12}
            changeLabel="vs. last month"
            iconBg="#E3F2FD"
            iconColor="#1565C0"
          />
          <StatCard
            icon={<CalendarDays size={22} />}
            label="Today's Appointments"
            value="36"
            change={8}
            changeLabel="vs. yesterday"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
          />
          <StatCard
            icon={<Stethoscope size={22} />}
            label="Active Doctors"
            value="12"
            change={0}
            changeLabel="vs. last month"
            iconBg="#F3E5F5"
            iconColor="#6A1B9A"
          />
          <StatCard
            icon={<Receipt size={22} />}
            label="Pending Bills"
            value="8"
            change={-33}
            changeLabel="vs. last month"
            iconBg="#FFF3E0"
            iconColor="#E65100"
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
              <LineChart data={appointmentsOverview} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                      data={departmentVisits}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {departmentVisits.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-gray-800">1,248</span>
                  <span className="text-[9px] text-gray-400 font-medium">Total Visits</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {departmentVisits.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-gray-700 ml-1">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Recent Patients</h2>
            <button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>
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
                {recentPatients.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                        >
                          {p.avatar}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{p.phone}</td>
                    <td className="px-5 py-3 text-sm text-[#2979FF] font-medium">{p.dept}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{p.lastVisit}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-600 border border-red-100'}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button className="w-6 h-6 rounded-lg bg-gray-50 hover:bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <ChevronRight size={13} className="text-gray-400 hover:text-blue-500" />
                      </button>
                    </td>
                  </tr>
                ))}
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
            <button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((a, i) => (
              <div key={i} className="flex items-center gap-3 group hover:bg-gray-50 rounded-xl px-2 py-2 -mx-2 transition-colors cursor-pointer">
                <div className="text-xs font-semibold text-gray-500 w-16 flex-shrink-0">{a.time}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">{a.patient}</div>
                  <div className="text-[10px] text-gray-400 truncate">{a.doctor}</div>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: a.deptColor, color: a.deptText }}
                >
                  {a.dept.split(' ')[0]}
                </span>
                <ChevronRight size={13} className="text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="p-5 border-b border-gray-50">
          <MiniCalendar />
        </div>

        {/* Quick Actions */}
        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <UserPlus size={18} />, label: 'Register Patient', color: '#E3F2FD', iconColor: '#1565C0' },
              { icon: <CalendarPlus size={18} />, label: 'Book Appointment', color: '#E8F5E9', iconColor: '#2E7D32' },
              { icon: <FileText size={18} />, label: 'Add Medical Record', color: '#FFF3E0', iconColor: '#E65100' },
              { icon: <BarChart2 size={18} />, label: 'Generate Report', color: '#FFF8E1', iconColor: '#F57F17' },
            ].map((action, i) => (
              <button
                key={i}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: action.color }}
                >
                  <span style={{ color: action.iconColor }}>{action.icon}</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-600 leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
