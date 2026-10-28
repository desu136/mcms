'use client';

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Users,
  Settings,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Smartphone,
  Activity,
  Send,
  X,
  ChevronDown,
  Search,
} from 'lucide-react';
import { PageHeader, AdminCard, TabBar, Pagination } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';

// NOTE: All data below is from static fixtures.
// Backend endpoints required:
// - GET  /api/v1/admin/notifications
// - POST /api/v1/admin/notifications
// - PATCH /api/v1/admin/notifications/:id/read
// - GET  /api/v1/admin/notification-settings
// These will be wired once the backend exposes these notification management endpoints.

const TABS = ['All Notifications', 'System Alerts', 'User Notifications', 'Settings'];

type NotifType = 'success' | 'warning' | 'info' | 'error' | 'neutral';

const notifications: {
  id: string;
  icon: any;
  type: NotifType;
  title: string;
  message: string;
  target: string;
  channel: string;
  priority: string;
  time: string;
  read: boolean;
}[] = [
  { id: '1', icon: CheckCircle2, type: 'success', title: 'Database Backup Completed', message: 'Database backup completed successfully. Size: 48 MB. Stored in local storage.', target: 'Administrators', channel: 'In-App', priority: 'Normal', time: '10:42 AM', read: false },
  { id: '2', icon: AlertTriangle, type: 'warning', title: 'System Alert: High Memory Usage', message: 'Memory usage has reached 80%. Consider restarting non-essential services.', target: 'Administrators', channel: 'Email + In-App', priority: 'High', time: '10:15 AM', read: false },
  { id: '3', icon: Info, type: 'info', title: 'New User Account Created', message: 'Dr. Hana Mengesha has been added as General Practitioner in General Medicine.', target: 'All Staff', channel: 'In-App', priority: 'Normal', time: '09:48 AM', read: true },
  { id: '4', icon: Bell, type: 'info', title: 'Upcoming System Maintenance', message: 'Scheduled system maintenance on Oct 22, 2026 from 2:00 AM – 4:00 AM (EAT).', target: 'All Users', channel: 'Email + SMS + In-App', priority: 'High', time: '09:20 AM', read: true },
  { id: '5', icon: CheckCircle2, type: 'success', title: 'System Update Completed', message: 'MCMS has been updated to v1.0.1. All services are running normally.', target: 'All Staff', channel: 'In-App', priority: 'Normal', time: 'Oct 18, 2026', read: true },
  { id: '6', icon: AlertTriangle, type: 'warning', title: 'Storage Space Warning', message: 'Local storage is at 75% capacity. Consider archiving old backups.', target: 'Administrators', channel: 'Email + In-App', priority: 'High', time: 'Oct 18, 2026', read: true },
  { id: '7', icon: Users, type: 'info', title: 'New Role Assignment', message: 'Dr. Fitsum Alemu has been assigned the Lab Doctor role in Laboratory.', target: 'Administrators', channel: 'In-App', priority: 'Normal', time: 'Oct 17, 2026', read: true },
  { id: '8', icon: AlertTriangle, type: 'error', title: 'Failed Backup Attempt', message: 'Scheduled backup on Oct 14, 2026 failed due to insufficient disk space.', target: 'Administrators', channel: 'Email + In-App', priority: 'Critical', time: 'Oct 14, 2026', read: true },
];

const typeIconBg: Record<NotifType, string> = {
  success: 'bg-emerald-50',
  warning: 'bg-amber-50',
  info: 'bg-blue-50',
  error: 'bg-red-50',
  neutral: 'bg-gray-50',
};
const typeIconColor: Record<NotifType, string> = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  error: 'text-red-500',
  neutral: 'text-gray-500',
};

const notifSettings = [
  { icon: AlertTriangle, label: 'System Alerts', desc: 'Critical errors, maintenance windows', enabled: true },
  { icon: CheckCircle2, label: 'Backup Notifications', desc: 'Backup success and failure alerts', enabled: true },
  { icon: Users, label: 'User Account Updates', desc: 'New users, role changes, status updates', enabled: true },
  { icon: Activity, label: 'Performance Alerts', desc: 'CPU, memory, and storage warnings', enabled: true },
  { icon: Bell, label: 'Appointment Reminders', desc: 'Upcoming appointment notifications', enabled: false },
  { icon: Info, label: 'Update Notifications', desc: 'Software and security updates', enabled: true },
];

const channels = [
  { icon: Bell, label: 'In-App Notifications', enabled: true },
  { icon: Mail, label: 'Email Notifications', enabled: true },
  { icon: Smartphone, label: 'SMS Notifications', enabled: false },
];

const PER_PAGE = 6;

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#2979FF]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

// ─── Send Notification Dialog ─────────────────────────────────────────────────
function SendNotificationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ title: '', message: '', target: 'All Users', priority: 'Normal', channel: 'In-App' });
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Send Notification</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              placeholder="Notification title"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
              rows={3}
              placeholder="Notification message..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Target Audience', key: 'target', options: ['All Users', 'Administrators', 'All Staff', 'Clinical Staff'] },
              { label: 'Priority', key: 'priority', options: ['Normal', 'High', 'Critical'] },
              { label: 'Channel', key: 'channel', options: ['In-App', 'Email', 'SMS', 'Email + In-App'] },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <select
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2979FF] rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All Notifications');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [page, setPage] = useState(1);
  const [readState, setReadState] = useState<Record<string, boolean>>(
    Object.fromEntries(notifications.map((n) => [n.id, n.read]))
  );
  const [settingsEnabled, setSettingsEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(notifSettings.map((n) => [n.label, n.enabled]))
  );
  const [channelsEnabled, setChannelsEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(channels.map((c) => [c.label, c.enabled]))
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const unreadCount = Object.values(readState).filter((v) => !v).length;

  const filtered = notifications.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch = !search || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    const matchType = typeFilter === 'All Types' || n.type === typeFilter.toLowerCase();
    return matchSearch && matchType;
  });
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="p-6 space-y-5">
      <SendNotificationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <PageHeader
        icon={<Bell size={20} className="text-blue-500" />}
        title="Notifications"
        subtitle="Manage system notifications, alerts, and communication settings."
        dateRange={dateStr}
        dateSubtitle={dayStr}
        systemStatus="online"
        actions={
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2979FF] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <Plus size={15} />
            Send Notification
          </button>
        }
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'All Notifications' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Notifications" value={notifications.length} icon={Bell} iconBg="bg-blue-50" iconColor="text-blue-500" change="15%" changeDir="up" />
            <StatCard title="Unread Notifications" value={unreadCount} icon={Info} iconBg="bg-orange-50" iconColor="text-orange-500" change="33%" changeDir="down" />
            <StatCard title="System Alerts" value={notifications.filter((n) => n.type === 'warning' || n.type === 'error').length} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" change="25%" changeDir="down" />
            <StatCard title="User Notifications" value={notifications.filter((n) => n.type === 'info').length} icon={Users} iconBg="bg-purple-50" iconColor="text-purple-500" change="20%" changeDir="up" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Notification List */}
            <div className="xl:col-span-3 space-y-4">
              <AdminCard
                title="Recent Notifications"
                titleIcon={<Bell size={15} className="text-blue-500" />}
                action={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReadState(Object.fromEntries(notifications.map((n) => [n.id, true])))}
                      className="text-xs text-[#2979FF] font-medium hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                }
                noPadding
              >
                {/* Search + Filter Bar */}
                <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search notifications..."
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                      className="pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
                    >
                      {['All Types', 'Success', 'Warning', 'Info', 'Error'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-[#2979FF] rounded-xl hover:bg-blue-700 transition">
                    <Filter size={11} />
                    Filter
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {paginated.map((n) => {
                    const Icon = n.icon;
                    const isRead = readState[n.id];
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-5 py-4 hover:bg-gray-50/70 transition cursor-pointer ${!isRead ? 'bg-blue-50/30' : ''}`}
                        onClick={() => setReadState((r) => ({ ...r, [n.id]: true }))}
                      >
                        <div className={`w-9 h-9 rounded-xl ${typeIconBg[n.type]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={16} className={typeIconColor[n.type]} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-sm font-semibold text-gray-900 ${!isRead ? 'font-bold' : ''}`}>
                              {n.title}
                            </p>
                            {!isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <Users size={10} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">{n.target}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Send size={10} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">{n.channel}</span>
                            </div>
                            <StatusBadge
                              variant={n.priority === 'Critical' ? 'error' : n.priority === 'High' ? 'warning' : 'neutral'}
                              label={n.priority}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                          <button className="text-gray-300 hover:text-gray-500 transition">
                            <MoreHorizontal size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="px-5 py-8 text-center text-xs text-gray-400">No notifications found.</div>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-gray-100">
                  <Pagination current={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
                </div>
              </AdminCard>
            </div>

            {/* Right Panel */}
            <div className="space-y-4">
              {/* Notification Settings */}
              <AdminCard title="Notification Settings" titleIcon={<Settings size={15} className="text-blue-500" />}>
                <div className="space-y-3">
                  {notifSettings.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon size={11} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800">{label}</p>
                          <p className="text-[10px] text-gray-500 leading-tight">{desc}</p>
                        </div>
                      </div>
                      <Toggle checked={settingsEnabled[label] ?? false} onChange={(v) => setSettingsEnabled((s) => ({ ...s, [label]: v }))} />
                    </div>
                  ))}
                </div>
              </AdminCard>

              {/* Notification Channels */}
              <AdminCard title="Notification Channels" titleIcon={<Send size={15} className="text-blue-500" />}>
                <div className="space-y-3">
                  {channels.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Icon size={13} className="text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{label}</span>
                      </div>
                      <Toggle checked={channelsEnabled[label] ?? false} onChange={(v) => setChannelsEnabled((c) => ({ ...c, [label]: v }))} />
                    </div>
                  ))}
                </div>
              </AdminCard>

              {/* Quick Send Notification */}
              <AdminCard title="Quick Notification" titleIcon={<Bell size={15} className="text-blue-500" />}>
                <p className="text-xs text-gray-500 mb-3">Send a quick notification to system users.</p>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2979FF] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
                >
                  <Plus size={15} />
                  Create & Send Notification
                </button>
              </AdminCard>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'All Notifications' && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">{activeTab}</p>
            <p className="text-xs text-gray-400 mt-1">This section is under development.</p>
          </div>
        </div>
      )}
    </div>
  );
}
