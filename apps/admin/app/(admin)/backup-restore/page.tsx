'use client';

import React, { useState } from 'react';
import {
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Upload,
  Download,
  Shield,
  RotateCcw,
  PlusCircle,
  MoreHorizontal,
  Info,
  ChevronDown,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { PageHeader, AdminCard, TabBar, Pagination } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';

// NOTE: All data below is from static fixtures.
// Backend endpoints required for live integration:
// - POST /api/v1/admin/backups (create new backup)
// - GET  /api/v1/admin/backups (list backups)
// - GET  /api/v1/admin/backups/:id/status (backup status)
// - POST /api/v1/admin/restore (initiate restore)
// These will be wired once the backend exposes these admin endpoints.
// UI service boundary is ready at services/admin-api.ts for future extension.

const TABS = ['Backups', 'Backup History', 'Restore Points', 'Storage', 'Settings'];

const statusData = [
  { name: 'Completed', value: 23, color: '#00C853' },
  { name: 'Failed', value: 1, color: '#F44336' },
];

const recentBackups = [
  { dt: 'Oct 19, 2026 06:12 AM', type: 'Full Backup', size: '512 MB', status: 'Completed', location: 'Local' },
  { dt: 'Oct 18, 2026 06:15 AM', type: 'Incremental', size: '214 MB', status: 'Completed', location: 'Local' },
  { dt: 'Oct 17, 2026 06:10 AM', type: 'Full Backup', size: '498 MB', status: 'Completed', location: 'Local' },
  { dt: 'Oct 16, 2026 06:08 AM', type: 'Incremental', size: '208 MB', status: 'Completed', location: 'Local' },
  { dt: 'Oct 15, 2026 06:05 AM', type: 'Full Backup', size: '503 MB', status: 'Completed', location: 'Cloud' },
  { dt: 'Oct 14, 2026 06:02 AM', type: 'Incremental', size: '205 MB', status: 'Failed', location: 'Local' },
  { dt: 'Oct 13, 2026 05:58 AM', type: 'Full Backup', size: '510 MB', status: 'Completed', location: 'Local' },
];

const restoreOps = [
  { dt: 'Oct 12, 2026 02:15 PM', source: 'Backup #23', status: 'Completed' },
  { dt: 'Oct 05, 2026 11:32 AM', source: 'Backup #20', status: 'Completed' },
  { dt: 'Sep 28, 2026 09:45 AM', source: 'Backup #18', status: 'Completed' },
];

const quickActions = [
  { icon: PlusCircle, label: 'Create Backup', desc: 'Start a new backup job', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: RotateCcw, label: 'Restore Database', desc: 'Restore from a backup', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Shield, label: 'Validate Backup', desc: 'Check backup integrity', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Database, label: 'Manage Storage', desc: 'View and manage storage', color: 'text-orange-500', bg: 'bg-orange-50' },
];

const PER_PAGE = 7;

export default function BackupRestorePage() {
  const [activeTab, setActiveTab] = useState('Backups');
  const [backupType, setBackupType] = useState('Full Backup');
  const [storageLocation, setStorageLocation] = useState('Local Storage');
  const [description, setDescription] = useState('');
  const [startingBackup, setStartingBackup] = useState(false);
  const [backupStarted, setBackupStarted] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  const paginated = recentBackups.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleStartBackup = async () => {
    setStartingBackup(true);
    // NOTE: Backend /api/v1/admin/backups POST endpoint not yet implemented.
    // This simulates the UX flow; no actual backup is performed.
    await new Promise((r) => setTimeout(r, 1200));
    setStartingBackup(false);
    setBackupStarted(true);
    setTimeout(() => setBackupStarted(false), 4000);
  };

  return (
    <div className="p-6 space-y-5">
      {backupStarted && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} />
          Backup job initiated! This may take several minutes.
        </div>
      )}

      <PageHeader
        icon={<HardDrive size={20} className="text-blue-500" />}
        title="Backup & Restore"
        subtitle="Manage database backups, view backup history, and restore data when needed."
        dateRange={dateStr}
        dateSubtitle={dayStr}
        systemStatus="online"
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Backups' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard title="Total Backups" value={24} icon={HardDrive} iconBg="bg-blue-50" iconColor="text-blue-500" change="+20%" changeDir="up" />
            <StatCard title="Successful Backups" value={23} icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-500" change="+21%" changeDir="up" />
            <StatCard title="Failed Backups" value={1} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" change="+100%" changeDir="down" />
            <StatCard title="Total Backup Size" value="12.4 GB" icon={Database} iconBg="bg-purple-50" iconColor="text-purple-500" change="-18%" changeDir="up" />
            <div className="bg-white rounded-2xl p-5 border border-[#E6EEFF] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-blue-500" />
                <p className="text-xs text-gray-500 font-medium">Last Backup</p>
              </div>
              <p className="text-xs font-bold text-gray-900">Oct 19, 2026 06:12 AM</p>
              <div className="mt-1.5">
                <StatusBadge variant="active" label="Completed" showDot />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Create Backup Form + Table */}
            <div className="xl:col-span-2 space-y-4">
              {/* Create Backup */}
              <AdminCard>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <HardDrive size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Create New Backup</h2>
                    <p className="text-xs text-gray-500">Create a new database backup for safe keeping. This may take several minutes depending on the data size.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Backup Type</label>
                    <div className="relative">
                      <select
                        value={backupType}
                        onChange={(e) => setBackupType(e.target.value)}
                        className="w-full pl-3 pr-7 py-2 text-sm border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      >
                        {['Full Backup', 'Incremental', 'Differential'].map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Storage Location</label>
                    <div className="relative">
                      <select
                        value={storageLocation}
                        onChange={(e) => setStorageLocation(e.target.value)}
                        className="w-full pl-3 pr-7 py-2 text-sm border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      >
                        {['Local Storage', 'Cloud Storage', 'Both (Local + Cloud)'].map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={`e.g. Daily backup - ${now.toLocaleDateString()}`}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartBackup}
                  disabled={startingBackup}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2979FF] text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
                >
                  {startingBackup ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HardDrive size={15} />
                  )}
                  {startingBackup ? 'Starting Backup...' : 'Start Backup'}
                </button>
              </AdminCard>

              {/* Recent Backups Table */}
              <AdminCard
                title="Recent Backups"
                titleIcon={<HardDrive size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-500 px-5 py-3">Date & Time</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-3">Type</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-3">Size</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-3">Status</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-3">Location</th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((b) => (
                        <tr key={b.dt} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="px-5 py-2.5 text-gray-500">{b.dt}</td>
                          <td className="px-3 py-2.5 text-gray-700">{b.type}</td>
                          <td className="px-3 py-2.5 text-gray-600">{b.size}</td>
                          <td className="px-3 py-2.5">
                            <StatusBadge
                              variant={b.status === 'Completed' ? 'success' : 'error'}
                              label={b.status}
                            />
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{b.location}</td>
                          <td className="px-3 py-2.5">
                            <button className="text-gray-300 hover:text-gray-500 transition">
                              <MoreHorizontal size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 border-t border-gray-100">
                    <Pagination current={page} total={recentBackups.length} perPage={PER_PAGE} onChange={setPage} />
                  </div>
                </div>
              </AdminCard>
            </div>

            {/* Right Panel */}
            <div className="space-y-4">
              {/* Backup Status Donut */}
              <AdminCard title="Backup Status" titleIcon={<HardDrive size={15} className="text-blue-500" />}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <PieChart width={160} height={140}>
                      <Pie data={statusData} cx={75} cy={65} innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                        {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-lg font-bold text-gray-900">24</span>
                      <span className="text-[10px] text-gray-500">Total Backups</span>
                    </div>
                  </div>
                  <div className="w-full space-y-2 mt-1">
                    {statusData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                          <span className="text-gray-600">{d.name}</span>
                        </div>
                        <span className="text-gray-500 font-medium">
                          {d.value} ({Math.round((d.value / 24) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminCard>

              {/* Backup Validation */}
              <AdminCard title="Backup Validation" titleIcon={<Shield size={15} className="text-blue-500" />}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-700">Last Validation</p>
                        <p className="text-[10px] text-gray-500">Oct 18, 2026 08:30 AM</p>
                      </div>
                    </div>
                    <StatusBadge variant="success" label="Passed" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={14} className="text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-700">Last Restore Test</p>
                        <p className="text-[10px] text-gray-500">Oct 12, 2026 09:15 AM</p>
                      </div>
                    </div>
                    <StatusBadge variant="success" label="Passed" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-xs text-gray-600">Recovery Point Objective (RPO)</p>
                    </div>
                    <span className="text-xs font-medium text-gray-800">1 hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-gray-400" />
                      <p className="text-xs text-gray-600">Retention Policy</p>
                    </div>
                    <span className="text-xs font-medium text-gray-800">30 days</span>
                  </div>
                </div>
              </AdminCard>

              {/* Quick Actions */}
              <AdminCard title="Quick Actions" titleIcon={<HardDrive size={15} className="text-blue-500" />}>
                <div className="space-y-2">
                  {quickActions.map(({ icon: Icon, label, desc, bg, color }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition text-left group"
                    >
                      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon size={15} className={color} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-500">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </AdminCard>

              {/* Quick Info */}
              <AdminCard title="Quick Info" titleIcon={<Info size={15} className="text-blue-500" />}>
                <div className="space-y-2.5">
                  {[
                    { label: 'Database Version', value: 'PostgreSQL 15.4' },
                    { label: 'Backup Engine', value: 'pg_dump' },
                    { label: 'Backup Storage', value: 'Local + Cloud' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database size={13} className="text-gray-400" />
                        <span className="text-xs text-gray-600">{label}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </AdminCard>

              {/* Important Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <p className="text-xs font-bold text-amber-700">Important</p>
                </div>
                <p className="text-[11px] text-amber-600 leading-relaxed">
                  Restoring a database will overwrite existing data. Ensure you have a recent backup and follow the recovery procedure. Only authorized administrators can perform restore operations.
                </p>
              </div>

              {/* Recent Restore Ops */}
              <AdminCard
                title="Recent Restore Operations"
                titleIcon={<RotateCcw size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5">Date & Time</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Source</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restoreOps.map((r) => (
                        <tr key={r.dt} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-gray-500">{r.dt}</td>
                          <td className="px-3 py-2.5 text-gray-700">{r.source}</td>
                          <td className="px-3 py-2.5">
                            <StatusBadge variant="success" label={r.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'Backups' && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HardDrive size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">{activeTab}</p>
            <p className="text-xs text-gray-400 mt-1">This section is under development.</p>
          </div>
        </div>
      )}
    </div>
  );
}
