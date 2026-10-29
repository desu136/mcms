'use client';

import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Bell,
  Layers,
  Palette,
  Database,
  Activity,
  FileText,
  HardDrive,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Info,
  ChevronRight,
  Save,
} from 'lucide-react';
import { PageHeader, AdminCard, TabBar } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';

const TABS = ['General', 'Clinic Information', 'Security', 'Notifications', 'Integrations', 'Appearance'];

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#2979FF]' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

// ─── Select Component ─────────────────────────────────────────────────────────
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-700"
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</span>
      </div>
    </div>
  );
}

// ─── Maintenance Action ───────────────────────────────────────────────────────
function MaintenanceAction({
  icon: Icon,
  label,
  description,
  actionLabel,
  onClick,
  danger = false,
}: {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-blue-50'}`}>
          <Icon size={15} className={danger ? 'text-red-500' : 'text-blue-500'} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition ${
          danger
            ? 'border-red-200 text-red-600 hover:bg-red-50'
            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ─── Quick Action Link ────────────────────────────────────────────────────────
function QuickActionLink({ icon: Icon, label, description, href }: { icon: React.ComponentType<any>; label: string; description: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between py-2.5 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon size={14} className="text-blue-500" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-800">{label}</p>
          <p className="text-[10px] text-gray-500">{description}</p>
        </div>
      </div>
      <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // General Settings state
  const [systemName, setSystemName] = useState('Modern Clinic Management System');
  const [timezone, setTimezone] = useState('Africa/Addis_Ababa (EAT)');
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('Oct 19, 2026 (MMM DD, YYYY)');
  const [timeFormat, setTimeFormat] = useState('12-hour (e.g. 10:24 AM)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Application Settings state
  const [offlineMode, setOfflineMode] = useState(true);
  const [autoSync, setAutoSync] = useState('5 minutes');
  const [sessionTimeout, setSessionTimeout] = useState('8 hours');
  const [multipleSessions, setMultipleSessions] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);

  // Date & Time
  const [dtDateFormat, setDtDateFormat] = useState('Oct 19, 2026 (MMM DD, YYYY)');
  const [dtTimeFormat, setDtTimeFormat] = useState('12-hour (e.g. 10:24 AM)');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Sunday');
  const [locale, setLocale] = useState('English (United States)');

  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    // NOTE: /api/v1/admin/settings endpoint is not yet implemented in the backend.
    // Changes are persisted in component state only until the backend exposes this endpoint.
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sysInfo = [
    { label: 'Application Version', value: 'v1.0.0' },
    { label: 'Backend API Version', value: 'v1.0.0' },
    { label: 'Database Version', value: 'PostgreSQL 15.4' },
    { label: 'Database Schema', value: 'public' },
    { label: 'Last Updated', value: 'Oct 18, 2026 10:24 AM' },
    { label: 'Environment', value: 'Production', badge: true },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="p-6 space-y-5">
      {saved && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg">
          Settings saved successfully!
        </div>
      )}

      <PageHeader
        icon={<Settings size={20} className="text-blue-500" />}
        title="System Settings"
        subtitle="Configure system preferences, clinic information, and application settings."
        dateRange={dateStr}
        dateSubtitle={dayStr}
        systemStatus="online"
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'General' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left — General + Date & Time */}
          <div className="xl:col-span-2 space-y-4">
            {/* General Settings */}
            <AdminCard>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Settings size={18} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">General Settings</h2>
                  <p className="text-xs text-gray-500">Configure basic system preferences and application behavior.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">System Name</label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Timezone"
                    value={timezone}
                    onChange={setTimezone}
                    options={['Africa/Addis_Ababa (EAT)', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai']}
                  />
                  <SelectField
                    label="Default Language"
                    value={language}
                    onChange={setLanguage}
                    options={['English', 'Amharic', 'French', 'Arabic', 'Spanish']}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Date Format"
                    value={dateFormat}
                    onChange={setDateFormat}
                    options={['Oct 19, 2026 (MMM DD, YYYY)', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
                  />
                  <SelectField
                    label="Time Format"
                    value={timeFormat}
                    onChange={setTimeFormat}
                    options={['12-hour (e.g. 10:24 AM)', '24-hour (e.g. 22:24)']}
                  />
                </div>

                <Toggle
                  checked={maintenanceMode}
                  onChange={setMaintenanceMode}
                  label="Enable System Maintenance Mode"
                  description="Temporarily restrict access for system updates."
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#2979FF] text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save Changes
                </button>
              </div>
            </AdminCard>

            {/* Date & Time Settings */}
            <AdminCard>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Globe size={18} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Date & Time Settings</h2>
                  <p className="text-xs text-gray-500">Configure date, time, and regional format settings.</p>
                </div>
              </div>

              <div className="space-y-4">
                <SelectField
                  label="Date Format"
                  value={dtDateFormat}
                  onChange={setDtDateFormat}
                  options={['Oct 19, 2026 (MMM DD, YYYY)', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
                />
                <SelectField
                  label="Time Format"
                  value={dtTimeFormat}
                  onChange={setDtTimeFormat}
                  options={['12-hour (e.g. 10:24 AM)', '24-hour (e.g. 22:24)']}
                />
                <SelectField
                  label="First Day of Week"
                  value={firstDayOfWeek}
                  onChange={setFirstDayOfWeek}
                  options={['Sunday', 'Monday', 'Saturday']}
                />
                <SelectField
                  label="Locale"
                  value={locale}
                  onChange={setLocale}
                  options={['English (United States)', 'English (UK)', 'Amharic (Ethiopia)', 'French (France)']}
                />
              </div>
            </AdminCard>
          </div>

          {/* Right — Application + Maintenance + System Info + Quick Actions */}
          <div className="space-y-4">
            {/* Application Settings */}
            <AdminCard>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Layers size={18} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Application Settings</h2>
                  <p className="text-xs text-gray-500">Configure client application behavior and features.</p>
                </div>
              </div>

              <Toggle
                checked={offlineMode}
                onChange={setOfflineMode}
                label="Enable Offline Mode"
                description="Allow selected features to work without internet connection."
              />

              <div className="py-3 border-b border-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-700">Auto-sync Interval</p>
                  <div className="relative">
                    <select
                      value={autoSync}
                      onChange={(e) => setAutoSync(e.target.value)}
                      className="pl-2 pr-6 py-1 text-xs border border-gray-200 rounded-lg appearance-none text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      {['1 minute', '5 minutes', '15 minutes', '30 minutes', '1 hour'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                  </div>
                </div>
              </div>

              <div className="py-3 border-b border-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-700">Session Timeout</p>
                  <div className="relative">
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="pl-2 pr-6 py-1 text-xs border border-gray-200 rounded-lg appearance-none text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      {['30 minutes', '1 hour', '4 hours', '8 hours', '24 hours'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                  </div>
                </div>
              </div>

              <Toggle
                checked={multipleSessions}
                onChange={setMultipleSessions}
                label="Allow Multiple Sessions"
                description="Permit users to be logged in from multiple devices."
              />
              <Toggle
                checked={systemNotifications}
                onChange={setSystemNotifications}
                label="Show System Notifications"
                description="Display important system alerts and updates."
              />
              <Toggle
                checked={auditLogging}
                onChange={setAuditLogging}
                label="Enable Audit Logging"
                description="Track important user actions and system events."
              />
            </AdminCard>

            {/* System Maintenance */}
            <AdminCard>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">System Maintenance</h2>
                  <p className="text-xs text-gray-500">Perform maintenance tasks and manage system health.</p>
                </div>
              </div>

              <MaintenanceAction
                icon={Database}
                label="Run Database Migration"
                description="Apply pending database migrations."
                actionLabel="Run"
                onClick={() => setConfirmAction('migration')}
              />
              <MaintenanceAction
                icon={Activity}
                label="Check System Health"
                description="Verify all services and dependencies."
                actionLabel="Check"
                onClick={() => setConfirmAction('health')}
              />
              <MaintenanceAction
                icon={Trash2}
                label="Clear Logs"
                description="Remove old log files (last 30 days)."
                actionLabel="Clear"
                onClick={() => setConfirmAction('logs')}
                danger
              />
              <MaintenanceAction
                icon={RefreshCw}
                label="Restart Services"
                description="Restart application services (requires downtime)."
                actionLabel="Restart"
                onClick={() => setConfirmAction('restart')}
                danger
              />

              {confirmAction && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700">Confirm Action</p>
                  </div>
                  <p className="text-xs text-amber-600 mb-3">
                    Are you sure you want to proceed with: <strong>{confirmAction}</strong>?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 px-3 py-1.5 text-xs border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}
            </AdminCard>

            {/* System Information */}
            <AdminCard
              title="System Information"
              titleIcon={<Info size={15} className="text-blue-500" />}
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

            {/* Quick Actions */}
            <AdminCard title="Quick Actions" titleIcon={<Activity size={15} className="text-blue-500" />}>
              <div className="space-y-1">
                <QuickActionLink icon={FileText} label="View System Logs" description="Check application and error logs." href="/logs-activity" />
                <QuickActionLink icon={HardDrive} label="Backup Database" description="Create a manual database backup." href="/backup-restore" />
                <QuickActionLink icon={RefreshCw} label="Restore Database" description="Restore from a previous backup." href="/backup-restore" />
                <QuickActionLink icon={Trash2} label="Clear Cache" description="Clear application cache and temporary files." href="#" />
              </div>
            </AdminCard>
          </div>
        </div>
      )}

      {activeTab !== 'General' && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">{activeTab} settings</p>
            <p className="text-xs text-gray-400 mt-1">This section is under development.</p>
          </div>
        </div>
      )}
    </div>
  );
}
