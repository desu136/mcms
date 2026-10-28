'use client';

import React, { useState } from 'react';
import {
  FileText,
  Users,
  Shield,
  AlertTriangle,
  X as XIcon,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PageHeader, AdminCard, TabBar, UserAvatar, Pagination } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';

// NOTE: All data below is from static fixtures.
// Backend endpoints required:
// - GET /api/v1/audit (audit logs listing with filters)
// - GET /api/v1/audit/stats (log count aggregation)
// These will be wired when the backend exposes the audit log endpoints with appropriate pagination.

const TABS = ['Activity Logs', 'Authentication Events', 'System Events', 'Audit Logs', 'Error Logs'];

const activityData = [
  { time: '12 AM', userActions: 280, authEvents: 200, sysEvents: 130, errors: 30 },
  { time: '4 AM', userActions: 260, authEvents: 195, sysEvents: 120, errors: 25 },
  { time: '8 AM', userActions: 310, authEvents: 215, sysEvents: 140, errors: 35 },
  { time: '12 PM', userActions: 340, authEvents: 225, sysEvents: 145, errors: 40 },
  { time: '4 PM', userActions: 320, authEvents: 210, sysEvents: 135, errors: 38 },
  { time: '8 PM', userActions: 295, authEvents: 200, sysEvents: 125, errors: 30 },
];

const moduleData = [
  { name: 'Authentication', value: 28, color: '#2979FF' },
  { name: 'Patient Management', value: 22, color: '#00C853' },
  { name: 'Appointments', value: 15, color: '#AA00FF' },
  { name: 'Clinical', value: 12, color: '#FF9100' },
  { name: 'System', value: 10, color: '#F44336' },
  { name: 'Others', value: 13, color: '#9E9E9E' },
];

const logs = [
  { time: 'Oct 19, 2026 10:42 AM', user: 'Desu Kasaye', action: 'Login', module: 'Authentication', details: 'Successful login from web client', ip: '192.168.1.10', status: 'success' },
  { time: 'Oct 19, 2026 10:38 AM', user: 'Aster Mulu', action: 'Update', module: 'Patient Management', details: 'Updated patient record #P-10023', ip: '192.168.1.15', status: 'success' },
  { time: 'Oct 19, 2026 10:24 AM', user: 'Lidya Kebede', action: 'Create', module: 'Appointments', details: 'Created appointment #A-4587', ip: '192.168.1.20', status: 'success' },
  { time: 'Oct 19, 2026 10:12 AM', user: 'Getachew Tadesse', action: 'Update', module: 'Clinical', details: 'Updated clinical notes for visit #V-3021', ip: '192.168.1.18', status: 'success' },
  { time: 'Oct 19, 2026 09:58 AM', user: 'Samuel Girma', action: 'Failed Login', module: 'Authentication', details: 'Invalid password attempt', ip: '192.168.1.22', status: 'error' },
  { time: 'Oct 19, 2026 09:45 AM', user: 'Betlehem Abebe', action: 'Delete', module: 'Laboratory', details: 'Deleted lab order #L-0786', ip: '192.168.1.14', status: 'success' },
  { time: 'Oct 19, 2026 09:32 AM', user: 'Admin', action: 'Notification', module: 'System', details: 'Sent system notification', ip: '127.0.0.1', status: 'success' },
  { time: 'Oct 19, 2026 09:18 AM', user: 'Aster Mulu', action: 'Update', module: 'Billing', details: 'Updated invoice #INV-2026-045', ip: '192.168.1.15', status: 'success' },
];

const recentEvents = [
  { icon: Shield, bg: 'bg-emerald-50', color: 'text-emerald-500', label: 'User logged in', sub: 'Desu Kasaye (System Admin)', time: '10:42 AM' },
  { icon: Users, bg: 'bg-blue-50', color: 'text-blue-500', label: 'Patient record updated', sub: 'Patient #P-10023', time: '10:38 AM' },
  { icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-500', label: 'Appointment created', sub: 'Appointment #A-4587', time: '10:24 AM' },
  { icon: FileText, bg: 'bg-orange-50', color: 'text-orange-500', label: 'Clinical notes updated', sub: 'Visit #V-3021', time: '10:12 AM' },
  { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-500', label: 'Failed login attempt', sub: 'Unknown user', time: '09:58 AM' },
  { icon: XIcon, bg: 'bg-red-50', color: 'text-red-400', label: 'Lab order deleted', sub: 'Order #L-0786', time: '09:45 AM' },
];

const PER_PAGE = 8;

export default function LogsActivityPage() {
  const [activeTab, setActiveTab] = useState('Activity Logs');
  const [search, setSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('All Types');
  const [userFilter, setUserFilter] = useState('All Users');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [page, setPage] = useState(1);

  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      !search ||
      l.user.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        icon={<FileText size={20} className="text-blue-500" />}
        title="Logs & Activity"
        subtitle="Monitor system activity, user actions, authentication events, and audit logs."
        dateRange={dateStr}
        dateSubtitle="Last 7 days"
        systemStatus="online"
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Logs" value="8,472" icon={FileText} iconBg="bg-blue-50" iconColor="text-blue-500" change="12%" changeDir="up" changeLabel="vs. previous 7 days" />
        <StatCard title="User Actions" value="6,213" icon={Users} iconBg="bg-green-50" iconColor="text-green-500" change="14%" changeDir="up" changeLabel="vs. previous 7 days" />
        <StatCard title="Authentication Events" value="1,024" icon={Shield} iconBg="bg-purple-50" iconColor="text-purple-500" change="8%" changeDir="up" changeLabel="vs. previous 7 days" />
        <StatCard title="System Events" value="182" icon={Zap} iconBg="bg-orange-50" iconColor="text-orange-500" change="5%" changeDir="up" changeLabel="vs. previous 7 days" />
        <StatCard title="Error Events" value="53" icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" change="22%" changeDir="down" changeLabel="vs. previous 7 days" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Charts + Table */}
        <div className="xl:col-span-3 space-y-4">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Activity Overview */}
            <div className="md:col-span-3">
              <AdminCard title="Activity Overview" titleIcon={<FileText size={15} className="text-blue-500" />}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6EEFF', fontSize: 11 }} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="userActions" name="User Actions" stroke="#2979FF" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="authEvents" name="Auth Events" stroke="#00C853" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="sysEvents" name="System Events" stroke="#FF9100" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="errors" name="Errors" stroke="#F44336" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </AdminCard>
            </div>

            {/* Module Donut */}
            <div className="md:col-span-2">
              <AdminCard title="Activity by Module" titleIcon={<Filter size={15} className="text-blue-500" />}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <PieChart width={140} height={120}>
                      <Pie data={moduleData} cx={65} cy={55} innerRadius={35} outerRadius={52} paddingAngle={2} dataKey="value">
                        {moduleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-sm font-bold text-gray-900">8,472</span>
                      <span className="text-[9px] text-gray-500">Total Logs</span>
                    </div>
                  </div>
                  <div className="w-full space-y-1 mt-1">
                    {moduleData.map((m) => (
                      <div key={m.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                          <span className="text-gray-600 truncate max-w-[90px]">{m.name}</span>
                        </div>
                        <span className="text-gray-400">{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminCard>
            </div>
          </div>

          {/* Logs Table */}
          <AdminCard
            title="Recent Activity Logs"
            titleIcon={<FileText size={15} className="text-blue-500" />}
            action={
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg transition">
                  <Download size={12} />
                  Export
                </button>
                <button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>
              </div>
            }
            noPadding
          >
            <div className="px-5 pt-3 pb-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search logs, users, actions..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-5 py-2.5">Date & Time</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2.5">User</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2.5">Action</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2.5">Module</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2.5">Details</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2.5">IP Address</th>
                    <th className="text-left font-medium text-gray-500 px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{log.time}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <UserAvatar name={log.user} size="sm" />
                          <span className="font-medium text-gray-800 whitespace-nowrap">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`font-medium ${log.status === 'error' ? 'text-red-500' : 'text-gray-700'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-blue-600 hover:underline cursor-pointer">{log.module}</td>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate">{log.details}</td>
                      <td className="px-3 py-2.5 text-gray-500 font-mono">{log.ip}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge variant={log.status === 'success' ? 'success' : 'error'} label={log.status === 'success' ? 'Success' : 'Failed'} />
                      </td>
                      <td className="px-3 py-2.5">
                        <button className="text-gray-300 hover:text-gray-500 transition">
                          <MoreHorizontal size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-xs text-gray-400">No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-100">
                <Pagination current={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Right: Quick Filters + Recent Events */}
        <div className="space-y-4">
          {/* Quick Filters */}
          <AdminCard title="Quick Filters" titleIcon={<Filter size={15} className="text-blue-500" />}>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Log Type</label>
                <div className="relative">
                  <select
                    value={logTypeFilter}
                    onChange={(e) => setLogTypeFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {['All Types', 'Authentication', 'User Actions', 'System Events', 'Errors'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none">▼</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">User</label>
                <div className="relative">
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {['All Users', 'Desu Kasaye', 'Aster Mulu', 'Lidya Kebede'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none">▼</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Module</label>
                <div className="relative">
                  <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {['All Modules', 'Authentication', 'Patient Management', 'Appointments', 'Clinical', 'Laboratory', 'Billing', 'System'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none">▼</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
                <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">Oct 19, 2026 – Oct 19, 2026</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-[#2979FF] rounded-xl hover:bg-blue-700 transition">
                  <Search size={12} />
                  Apply Filters
                </button>
                <button className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  <Filter size={11} />
                  Reset
                </button>
              </div>
            </div>
          </AdminCard>

          {/* Recent Events */}
          <AdminCard
            title="Recent Events"
            titleIcon={<Zap size={15} className="text-blue-500" />}
            action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
          >
            <div className="space-y-3">
              {recentEvents.map(({ icon: Icon, bg, color, label, sub, time }) => (
                <div key={label + time} className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={11} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-tight">{label}</p>
                    <p className="text-[10px] text-gray-500 truncate">{sub}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{time}</span>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
