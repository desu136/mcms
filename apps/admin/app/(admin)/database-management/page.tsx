'use client';

import React, { useState } from 'react';
import {
  Database,
  Activity,
  Link2,
  ArrowUpDown,
  HardDrive,
  Wrench,
  Info,
  MoreHorizontal,
  Play,
  PlusCircle,
  CheckCircle2,
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
import { PageHeader, AdminCard, TabBar } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';

// NOTE: All data below is from static fixtures.
// Backend endpoints required:
// - GET /api/v1/admin/database/health
// - GET /api/v1/admin/database/connections
// - GET /api/v1/admin/database/migrations
// - GET /api/v1/admin/database/backups
// - GET /api/v1/admin/database/performance
// These will be wired once the backend exposes these admin endpoints.

const TABS = ['Overview', 'Connections', 'Migrations', 'Backups', 'Storage', 'Maintenance'];

const perfData = [
  { time: '12 AM', cpu: 22, mem: 45, conns: 52 },
  { time: '4 AM', cpu: 18, mem: 42, conns: 48 },
  { time: '8 AM', cpu: 45, mem: 55, conns: 65 },
  { time: '12 PM', cpu: 62, mem: 60, conns: 72 },
  { time: '4 PM', cpu: 55, mem: 58, conns: 68 },
  { time: '8 PM', cpu: 38, mem: 50, conns: 55 },
];

const storageData = [
  { name: 'Data', value: 412, color: '#2979FF' },
  { name: 'Logs', value: 62, color: '#00C853' },
  { name: 'Backups', value: 38, color: '#FF9100' },
  { name: 'Other', value: 0, color: '#E0E0E0' },
];

const migrations = [
  { id: '202610190612', desc: 'Add patient insurance fields', status: 'Success', runAt: 'Oct 19, 2026 06:12 AM' },
  { id: '202610181045', desc: 'Create laboratory tables', status: 'Success', runAt: 'Oct 18, 2026 10:45 AM' },
  { id: '202610170830', desc: 'Update appointment indexes', status: 'Success', runAt: 'Oct 17, 2026 08:30 AM' },
  { id: '202610161200', desc: 'Add prescription module', status: 'Success', runAt: 'Oct 16, 2026 12:00 PM' },
  { id: '202610150915', desc: 'Modify visit table structure', status: 'Success', runAt: 'Oct 15, 2026 09:15 AM' },
];

const backupHistory = [
  { dt: 'Oct 19, 2026 06:12 AM', type: 'Automatic', size: '48 MB', status: 'Success' },
  { dt: 'Oct 18, 2026 06:11 AM', type: 'Automatic', size: '47 MB', status: 'Success' },
  { dt: 'Oct 17, 2026 06:10 AM', type: 'Automatic', size: '46 MB', status: 'Success' },
  { dt: 'Oct 16, 2026 06:09 AM', type: 'Automatic', size: '46 MB', status: 'Success' },
  { dt: 'Oct 15, 2026 06:08 AM', type: 'Automatic', size: '45 MB', status: 'Success' },
];

const connections = [
  { id: 'conn_001', app: 'Backend API', user: 'mcms_api', state: 'Active', duration: '2 hours 14 minutes' },
  { id: 'conn_002', app: 'Web Client', user: 'mcms_web', state: 'Active', duration: '1 hour 32 minutes' },
  { id: 'conn_003', app: 'Mobile App', user: 'mcms_mobile', state: 'Active', duration: '48 minutes' },
  { id: 'conn_004', app: 'Desktop App', user: 'mcms_desktop', state: 'Idle', duration: '12 minutes' },
];

const maintenance = [
  { label: 'Database integrity', status: 'OK', note: 'Last checked: Oct 19, 2026 06:00 AM' },
  { label: 'Vacuum and analyze', status: 'OK', note: 'Last run: Oct 19, 2026 05:45 AM' },
  { label: 'Expired log cleanup', status: 'OK', note: 'Last run: Oct 18, 2026 11:30 PM' },
  { label: 'Disk space', status: 'OK', note: '5% used' },
];

const dbInfo = [
  { label: 'Database Type', value: 'PostgreSQL 15.4' },
  { label: 'Host', value: 'localhost' },
  { label: 'Port', value: '5432' },
  { label: 'Database Name', value: 'mcms' },
  { label: 'Schema Version', value: 'public' },
  { label: 'Connection Pool', value: '20 / 100' },
  { label: 'Uptime', value: '2 days, 6 hours' },
  { label: 'Last Updated', value: 'Oct 18, 2026 10:24 AM' },
  { label: 'Environment', value: 'Production', badge: true },
];

const quickActions = [
  { icon: Play, label: 'Run Migration', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: PlusCircle, label: 'Create Backup', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Activity, label: 'Check Health', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Wrench, label: 'Optimize Database', color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function DatabaseManagementPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [perfRange, setPerfRange] = useState('Last 24 hours');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        icon={<Database size={20} className="text-blue-500" />}
        title="Database Management"
        subtitle="Monitor database health, manage connections, migrations, backups, and storage."
        dateRange={dateStr}
        dateSubtitle={dayStr}
        systemStatus="online"
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E6EEFF] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className="text-blue-500" />
                <p className="text-xs text-gray-500">Database Health</p>
              </div>
              <p className="text-xl font-bold text-gray-900">Healthy</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">● All systems operational</p>
            </div>
            <StatCard title="Active Connections" value="12" suffix="of 100 max" icon={Link2} iconBg="bg-blue-50" iconColor="text-blue-500" change="2%" changeDir="up" changeLabel="vs. last hour" />
            <div className="bg-white rounded-2xl p-5 border border-[#E6EEFF] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpDown size={18} className="text-purple-500" />
                <p className="text-xs text-gray-500">Pending Migrations</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">No pending migrations</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E6EEFF] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive size={18} className="text-green-500" />
                <p className="text-xs text-gray-500">Last Backup</p>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Oct 19, 2026 06:12 AM</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Completed successfully</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E6EEFF] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className="text-orange-500" />
                <p className="text-xs text-gray-500">Database Size</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">512 MB</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span>of 10 GB</span><span>5% used</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Performance Chart */}
            <div className="xl:col-span-2">
              <AdminCard
                title="Database Performance"
                titleIcon={<Activity size={15} className="text-blue-500" />}
                action={
                  <div className="relative">
                    <select
                      value={perfRange}
                      onChange={(e) => setPerfRange(e.target.value)}
                      className="pl-2 pr-6 py-1 text-xs border border-gray-200 rounded-lg appearance-none text-gray-600 focus:outline-none"
                    >
                      {['Last 24 hours', 'Last 7 days', 'Last 30 days'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={perfData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6EEFF', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="cpu" name="CPU Usage" stroke="#2979FF" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="mem" name="Memory Usage" stroke="#00C853" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="conns" name="Connections" stroke="#AA00FF" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </AdminCard>
            </div>

            {/* Storage Donut */}
            <AdminCard title="Database Storage" titleIcon={<HardDrive size={15} className="text-blue-500" />}>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <PieChart width={160} height={140}>
                    <Pie data={storageData.filter((d) => d.value > 0)} cx={75} cy={65} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                      {storageData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-base font-bold text-gray-900">512 MB</span>
                    <span className="text-[10px] text-gray-500">Used</span>
                  </div>
                </div>
                <div className="w-full space-y-2 mt-2">
                  {storageData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-gray-600">{d.name}</span>
                      </div>
                      <span className="text-gray-500">
                        {d.value > 0 ? `${d.value} MB   ${Math.round((d.value / 512) * 100)}%` : '0 MB   0%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Recent Migrations */}
            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminCard
                title="Recent Migrations"
                titleIcon={<ArrowUpDown size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-500 px-5 py-2.5">ID</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Description</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Status</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Run At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {migrations.map((m) => (
                        <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-5 py-2.5 font-mono text-gray-500">{m.id}</td>
                          <td className="px-3 py-2.5 text-gray-700 max-w-[130px] truncate">{m.desc}</td>
                          <td className="px-3 py-2.5"><StatusBadge variant="success" label={m.status} /></td>
                          <td className="px-3 py-2.5 text-gray-400">{m.runAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>

              {/* Backup History */}
              <AdminCard
                title="Backup History"
                titleIcon={<HardDrive size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-500 px-5 py-2.5">Date & Time</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Type</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Size</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupHistory.map((b) => (
                        <tr key={b.dt} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-5 py-2.5 text-gray-500">{b.dt}</td>
                          <td className="px-3 py-2.5 text-gray-600">{b.type}</td>
                          <td className="px-3 py-2.5 text-gray-600">{b.size}</td>
                          <td className="px-3 py-2.5"><StatusBadge variant="success" label={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </div>

            {/* Right: DB Info + Quick Actions */}
            <div className="space-y-4">
              {/* DB Info */}
              <AdminCard title="Database Information" titleIcon={<Info size={15} className="text-blue-500" />}>
                <div className="space-y-2.5">
                  {dbInfo.map(({ label, value, badge }) => (
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

              {/* Quick Actions */}
              <AdminCard title="Quick Actions" titleIcon={<Activity size={15} className="text-blue-500" />}>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(({ icon: Icon, label, bg, color }) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-2 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition group"
                    >
                      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon size={16} className={color} />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </AdminCard>
            </div>
          </div>

          {/* Bottom: Connections + Maintenance */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Connections */}
            <AdminCard
              title="Database Connections"
              titleIcon={<Link2 size={15} className="text-blue-500" />}
              action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
              noPadding
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left font-medium text-gray-500 px-5 py-2.5">ID</th>
                      <th className="text-left font-medium text-gray-500 px-3 py-2.5">Application</th>
                      <th className="text-left font-medium text-gray-500 px-3 py-2.5">User</th>
                      <th className="text-left font-medium text-gray-500 px-3 py-2.5">State</th>
                      <th className="text-left font-medium text-gray-500 px-3 py-2.5">Duration</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-2.5 font-mono text-gray-400">{c.id}</td>
                        <td className="px-3 py-2.5 text-gray-700">{c.app}</td>
                        <td className="px-3 py-2.5 text-gray-500">{c.user}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge variant={c.state === 'Active' ? 'active' : 'neutral'} label={c.state} showDot />
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{c.duration}</td>
                        <td className="px-3 py-2.5">
                          <button className="text-gray-300 hover:text-gray-500">
                            <MoreHorizontal size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>

            {/* Maintenance */}
            <AdminCard title="Database Maintenance" titleIcon={<Wrench size={15} className="text-blue-500" />}>
              <div className="space-y-3">
                {maintenance.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-800">{m.label}</p>
                        <p className="text-[10px] text-gray-500">{m.note}</p>
                      </div>
                    </div>
                    <StatusBadge variant="success" label="OK" />
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        </>
      )}

      {activeTab !== 'Overview' && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">{activeTab}</p>
            <p className="text-xs text-gray-400 mt-1">Detailed {activeTab.toLowerCase()} view coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
