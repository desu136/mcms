'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Legend,
} from 'recharts';
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  Activity,
  Settings,
  HardDrive,
  Eye,
  Shield,
  RefreshCw,
  UserPlus,
  Database,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { adminUsersApi, type AdminUserSummary } from '../services/admin-api';
import { StatCard } from '../components/StatCard';
import { AdminCard, PageHeader, UserAvatar, LoadingSpinner } from '../components/AdminUI';
import { StatusBadge, RoleBadge } from '../components/StatusBadge';

// ─── Static demo data (backend integration gaps documented below) ─────────────
// NOTE: The following sections rely on backend endpoints not yet implemented:
// - /api/v1/admin/stats (system-wide statistics)
// - /api/v1/admin/metrics (CPU/memory usage history)
// - /api/v1/admin/logs (system logs listing)
// - /api/v1/admin/database-status
// These sections display representative data until the backend exposes these APIs.

const cpuMemData = [
  { time: '12 AM', cpu: 35, mem: 42 },
  { time: '4 AM', cpu: 28, mem: 38 },
  { time: '8 AM', cpu: 55, mem: 52 },
  { time: '12 PM', cpu: 70, mem: 60 },
  { time: '4 PM', cpu: 62, mem: 58 },
  { time: '8 PM', cpu: 48, mem: 50 },
];

const roleDistData = [
  { name: 'Clinical Staff', value: 18, color: '#2979FF' },
  { name: 'Receptionists', value: 6, color: '#00C853' },
  { name: 'Administrators', value: 4, color: '#AA00FF' },
  { name: 'Lab Technicians', value: 3, color: '#FF9100' },
  { name: 'Others', value: 1, color: '#9E9E9E' },
];

const systemLogs = [
  { time: 'Oct 19, 2026 09:42 AM', user: 'Desu Kasaye', action: 'Login', ip: '192.168.1.10', status: 'success' },
  { time: 'Oct 19, 2026 08:15 AM', user: 'Aster Mulu', action: 'Updated patient record', ip: '192.168.1.12', status: 'success' },
  { time: 'Oct 19, 2026 07:30 AM', user: 'Lidya Kebede', action: 'Added new appointment', ip: '192.168.1.15', status: 'success' },
  { time: 'Oct 18, 2026 06:22 PM', user: 'Getachew Tadesse', action: 'Viewed lab results', ip: '192.168.1.20', status: 'success' },
];

const dbStatus = [
  { label: 'Database Server', value: 'Online', badge: 'active' as const },
  { label: 'Connection Status', value: 'Connected', badge: 'active' as const },
  { label: 'Total Databases', value: '5', badge: null },
  { label: 'Database Size', value: '512 MB', badge: null },
  { label: 'Last Query Time', value: 'Oct 19, 2026 09:41 AM', badge: null },
];

const recentActivity = [
  { icon: Users, bg: 'bg-blue-50', color: 'text-blue-500', title: 'New user registered', sub: 'Dr. Hana Mengesha', time: '2 hours ago' },
  { icon: Settings, bg: 'bg-purple-50', color: 'text-purple-500', title: 'System settings updated', sub: 'By Desu Kasaye', time: '4 hours ago' },
  { icon: Database, bg: 'bg-green-50', color: 'text-green-500', title: 'Database backup completed', sub: 'Automatic backup', time: '6 hours ago' },
  { icon: Shield, bg: 'bg-orange-50', color: 'text-orange-500', title: 'User role changed', sub: 'Dr. Fitsum Alemu', time: '8 hours ago' },
];

const sysInfo = [
  { label: 'Application Version', value: 'v1.0.0' },
  { label: 'Database Version', value: 'MySQL 8.0.36' },
  { label: 'Server Uptime', value: '12 days, 6 hours' },
  { label: 'Last Backup', value: 'Oct 18, 2026 10:24 AM' },
  { label: 'Environment', value: 'Production', badge: true },
];

const quickActions = [
  { icon: UserPlus, label: 'Add User', href: '/users-roles', bg: 'bg-blue-50', color: 'text-blue-500' },
  { icon: Settings, label: 'System Settings', href: '/settings', bg: 'bg-purple-50', color: 'text-purple-500' },
  { icon: HardDrive, label: 'Backup Now', href: '/backup-restore', bg: 'bg-green-50', color: 'text-green-500' },
  { icon: Eye, label: 'View Logs', href: '/logs-activity', bg: 'bg-orange-50', color: 'text-orange-500' },
  { icon: Shield, label: 'Manage Roles', href: '/users-roles', bg: 'bg-pink-50', color: 'text-pink-500' },
  { icon: RefreshCw, label: 'Update System', href: '/settings', bg: 'bg-cyan-50', color: 'text-cyan-500' },
];

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    if (!accessToken) return;
    adminUsersApi
      .list(accessToken)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, [accessToken]);

  const activeUsers = users.filter((u) => u.isActive).length;

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <PageHeader
        icon={<Settings size={20} className="text-blue-500" />}
        title="System Admin Dashboard"
        subtitle="Monitor system performance, manage users and settings, and ensure smooth operations."
        dateRange={dateStr}
        dateSubtitle={dayStr}
        systemStatus="online"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={usersLoading ? '—' : users.length}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          change="8%"
          changeDir="up"
        />
        <StatCard
          title="Total Patients"
          value="1,248"
          icon={UserCheck}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          change="12%"
          changeDir="up"
        />
        <StatCard
          title="Total Appointments"
          value="36"
          icon={Calendar}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          change="6%"
          changeDir="up"
          changeLabel="vs. yesterday"
        />
        <StatCard
          title="Total Records"
          value="12,480"
          icon={FileText}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          change="15%"
          changeDir="up"
        />
        <StatCard
          title="System Uptime"
          value="99.98%"
          icon={Activity}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          change="0.02%"
          changeDir="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* CPU / Memory Chart */}
        <div className="xl:col-span-2">
          <AdminCard title="System Usage Overview" titleIcon={<Activity size={16} className="text-blue-500" />}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cpuMemData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v ?? 0}%`} contentStyle={{ borderRadius: 12, border: '1px solid #E6EEFF', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="cpu" name="CPU Usage" stroke="#2979FF" strokeWidth={2} dot={{ r: 3, fill: '#2979FF' }} />
                <Line type="monotone" dataKey="mem" name="Memory Usage" stroke="#00C853" strokeWidth={2} dot={{ r: 3, fill: '#00C853' }} />
              </LineChart>
            </ResponsiveContainer>
          </AdminCard>
        </div>

        {/* Role Distribution */}
        <AdminCard title="User Roles Distribution" titleIcon={<Users size={16} className="text-blue-500" />}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <PieChart width={180} height={160}>
                <Pie
                  data={roleDistData}
                  cx={85}
                  cy={75}
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {roleDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center flex-col" style={{ top: 0 }}>
                <span className="text-xl font-bold text-gray-900">
                  {usersLoading ? '—' : users.length || 32}
                </span>
                <span className="text-[10px] text-gray-500">Total Users</span>
              </div>
            </div>
            <div className="w-full space-y-1.5 mt-1">
              {roleDistData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-gray-500 font-medium">
                    {item.value} ({Math.round((item.value / 32) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Recent Users + Right Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Users Table */}
        <div className="xl:col-span-2">
          <AdminCard
            title="Recent Users"
            titleIcon={<Users size={16} className="text-blue-500" />}
            action={
              <Link href="/users-roles" className="text-xs text-[#2979FF] font-medium hover:underline">
                View All
              </Link>
            }
            noPadding
          >
            {usersLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Name</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Role</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Department</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Last Login</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 6).map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={u.displayName} size="sm" />
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{u.displayName}</p>
                              <p className="text-[10px] text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <RoleBadge role={u.roles[0] ?? 'User'} />
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {u.staffProfile?.department ?? 'General'}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge
                            variant={u.isActive ? 'active' : 'inactive'}
                            label={u.isActive ? 'Active' : 'Inactive'}
                            showDot
                          />
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400">
                          No users found. The backend may not be reachable.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Right Panel: Quick Actions + System Info + Recent Activity */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <AdminCard
            title="Quick Actions"
            titleIcon={<Activity size={16} className="text-blue-500" />}
          >
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(({ icon: Icon, label, href, bg, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 transition group text-center"
                >
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon size={16} className={color} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </AdminCard>

          {/* System Info */}
          <AdminCard
            title="System Information"
            titleIcon={<Database size={16} className="text-blue-500" />}
          >
            <div className="space-y-2.5">
              {sysInfo.map(({ label, value, badge }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{label}</span>
                  {badge ? (
                    <StatusBadge variant="success" label={value} />
                  ) : (
                    <span className="text-xs font-medium text-gray-800">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Recent Activity */}
          <AdminCard
            title="Recent Activity"
            titleIcon={<Activity size={16} className="text-blue-500" />}
            action={
              <Link href="/logs-activity" className="text-xs text-[#2979FF] font-medium hover:underline">
                View All
              </Link>
            }
          >
            <div className="space-y-3">
              {recentActivity.map(({ icon: Icon, bg, color, title, sub, time }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={13} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">{title}</p>
                    <p className="text-[10px] text-gray-500">{sub}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{time}</span>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Bottom Row: System Logs + Database Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* System Logs */}
        <AdminCard
          title="System Logs"
          titleIcon={<FileText size={16} className="text-blue-500" />}
          action={
            <Link href="/logs-activity" className="text-xs text-[#2979FF] font-medium hover:underline">
              View All
            </Link>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Date & Time</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3">User</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3">Action</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3">IP Address</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.map((log, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-2.5 text-gray-500">{log.time}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800">{log.user}</td>
                    <td className="px-3 py-2.5 text-gray-600">{log.action}</td>
                    <td className="px-3 py-2.5 text-gray-500">{log.ip}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge variant="success" label="Success" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        {/* Database Status */}
        <AdminCard
          title="Database Status"
          titleIcon={<Database size={16} className="text-blue-500" />}
          action={
            <Link href="/database-management" className="text-xs text-[#2979FF] font-medium hover:underline">
              View Details
            </Link>
          }
        >
          <div className="space-y-3">
            {dbStatus.map(({ label, value, badge }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
                {badge ? (
                  <StatusBadge variant={badge} label={value} showDot />
                ) : (
                  <span className="text-xs font-medium text-gray-800">{value}</span>
                )}
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
