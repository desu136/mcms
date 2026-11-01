'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Clock,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  RefreshCw,
  Smartphone,
  Monitor,
  AlertTriangle,
  Heart,
  Activity,
  FlaskConical,
  Pill,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type TabId = 'notifications' | 'shift' | 'display' | 'privacy' | 'security';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label, description, icon }: ToggleProps) {
  return (
    <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors group">
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="mt-0.5 w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
            {icon}
          </div>
        )}
        <div>
          <div className="text-xs font-bold text-slate-800">{label}</div>
          {description && <div className="text-[11px] text-slate-400 mt-0.5">{description}</div>}
        </div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-all shrink-0 cursor-pointer mt-0.5 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        }`}
        style={{ width: 40, height: 22 }}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
          style={{ width: 18, height: 18, top: 2, left: 2 }}
        />
      </div>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function NurseSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('notifications');
  const [saved, setSaved] = useState(false);

  // Notification preferences
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [vitalAlerts, setVitalAlerts] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [labAlerts, setLabAlerts] = useState(true);
  const [medicationAlerts, setMedicationAlerts] = useState(true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Shift preferences
  const [autoClockIn, setAutoClockIn] = useState(false);
  const [breakReminder, setBreakReminder] = useState(true);
  const [shiftEndAlert, setShiftEndAlert] = useState(true);
  const [overtimeWarning, setOvertimeWarning] = useState(true);
  const [shiftStart, setShiftStart] = useState('07:00');
  const [shiftEnd, setShiftEnd] = useState('19:00');

  // Display preferences
  const [compactView, setCompactView] = useState(false);
  const [showPatientPhotos, setShowPatientPhotos] = useState(true);
  const [showVitalTrends, setShowVitalTrends] = useState(true);
  const [autoRefreshQueue, setAutoRefreshQueue] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');

  // Privacy
  const [activityLog, setActivityLog] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'shift', label: 'Shift & Schedule', icon: <Clock className="w-4 h-4" /> },
    { id: 'display', label: 'Display', icon: <Monitor className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <Settings className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Workspace Settings
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Customize your nursing workstation preferences and notifications.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <Clock className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="text-xs font-bold text-slate-800">{dateLabel}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* ── Notifications Tab ─────────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <Section title="Clinical Alerts">
              <Toggle
                checked={criticalAlerts}
                onChange={setCriticalAlerts}
                label="Critical Patient Alerts"
                description="Immediate push notification for deteriorating patient vitals or critical lab values"
                icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
              />
              <Toggle
                checked={vitalAlerts}
                onChange={setVitalAlerts}
                label="Vital Signs Out of Range"
                description="Alert when a patient's vitals fall outside defined normal ranges"
                icon={<Activity className="w-4 h-4 text-teal-500" />}
              />
              <Toggle
                checked={labAlerts}
                onChange={setLabAlerts}
                label="Laboratory Result Notifications"
                description="Notify when lab orders are resulted or require nursing action"
                icon={<FlaskConical className="w-4 h-4 text-indigo-500" />}
              />
              <Toggle
                checked={medicationAlerts}
                onChange={setMedicationAlerts}
                label="Medication Administration Reminders"
                description="Scheduled reminders for due medications in your assigned ward"
                icon={<Pill className="w-4 h-4 text-purple-500" />}
              />
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Task & Schedule">
              <Toggle
                checked={taskReminders}
                onChange={setTaskReminders}
                label="Nursing Task Reminders"
                description="Reminders 15 minutes before assigned tasks are due"
                icon={<Heart className="w-4 h-4 text-pink-500" />}
              />
              <Toggle
                checked={appointmentAlerts}
                onChange={setAppointmentAlerts}
                label="Appointment Check-In Notifications"
                description="Alert when a patient assigned to your ward checks in"
                icon={<Bell className="w-4 h-4 text-blue-500" />}
              />
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Delivery Preferences">
              <Toggle
                checked={soundEnabled}
                onChange={setSoundEnabled}
                label="Alert Sounds"
                description="Play audio tones for critical and high-priority notifications"
                icon={soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              />
              <Toggle
                checked={emailDigest}
                onChange={setEmailDigest}
                label="Daily Email Summary"
                description="Receive an end-of-shift email digest with completed tasks and key patient events"
                icon={<Smartphone className="w-4 h-4 text-slate-500" />}
              />
            </Section>
          </div>
        )}

        {/* ── Shift & Schedule Tab ───────────────────────────────────── */}
        {activeTab === 'shift' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <Section title="Default Shift Hours">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Shift Start</label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Shift End</label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 px-1">Used for break reminders and overtime alerts. Does not affect official scheduling.</p>
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Shift Alerts">
              <Toggle
                checked={autoClockIn}
                onChange={setAutoClockIn}
                label="Auto Clock-In Reminder"
                description="Show a reminder prompt 5 minutes before your shift is scheduled to start"
                icon={<Clock className="w-4 h-4 text-teal-600" />}
              />
              <Toggle
                checked={breakReminder}
                onChange={setBreakReminder}
                label="Break Time Reminders"
                description="Suggest a break after 3.5 hours of consecutive active time"
                icon={<Sun className="w-4 h-4 text-amber-500" />}
              />
              <Toggle
                checked={shiftEndAlert}
                onChange={setShiftEndAlert}
                label="End of Shift Alert"
                description="Alert 20 minutes before your shift ends to prepare handover notes"
                icon={<Moon className="w-4 h-4 text-indigo-500" />}
              />
              <Toggle
                checked={overtimeWarning}
                onChange={setOvertimeWarning}
                label="Overtime Warning"
                description="Warn when you've been active for more than 1 hour past your shift end"
                icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
              />
            </Section>
          </div>
        )}

        {/* ── Display Tab ───────────────────────────────────────────── */}
        {activeTab === 'display' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <Section title="Layout & Views">
              <Toggle
                checked={compactView}
                onChange={setCompactView}
                label="Compact Patient List View"
                description="Show more patients on screen by reducing row height"
                icon={<Monitor className="w-4 h-4 text-slate-600" />}
              />
              <Toggle
                checked={showPatientPhotos}
                onChange={setShowPatientPhotos}
                label="Show Patient Avatars"
                description="Display patient photo placeholders in lists and details panels"
                icon={<Eye className="w-4 h-4 text-blue-500" />}
              />
              <Toggle
                checked={showVitalTrends}
                onChange={setShowVitalTrends}
                label="Vital Trend Sparklines"
                description="Show mini trend charts next to vital readings for quick at-a-glance assessment"
                icon={<Activity className="w-4 h-4 text-teal-600" />}
              />
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Auto-Refresh">
              <Toggle
                checked={autoRefreshQueue}
                onChange={setAutoRefreshQueue}
                label="Auto-Refresh Patient Queue"
                description="Automatically reload the patient queue at a set interval"
                icon={<RefreshCw className="w-4 h-4 text-indigo-500" />}
              />
              {autoRefreshQueue && (
                <div className="px-3.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-2">Refresh Interval</label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
                  >
                    <option value="15">Every 15 seconds</option>
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every 1 minute</option>
                    <option value="300">Every 5 minutes</option>
                  </select>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── Privacy Tab ───────────────────────────────────────────── */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <Section title="Activity & Audit">
              <Toggle
                checked={activityLog}
                onChange={setActivityLog}
                label="Enable Activity Logging"
                description="Record your clinical actions (vitals entry, medication admin, task updates) for audit purposes"
                icon={<Eye className="w-4 h-4 text-indigo-500" />}
              />
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 text-xs text-blue-800">
                <span className="font-bold">Note:</span> Activity logs are required for clinical compliance and cannot be fully disabled. Some actions are always recorded by the system regardless of this setting.
              </div>
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Session Management">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-800 mb-1">Auto Session Timeout</label>
                <p className="text-[11px] text-slate-400 mb-3">
                  Automatically lock your workstation after a period of inactivity
                </p>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="0">Never (not recommended)</option>
                </select>
              </div>
            </Section>
          </div>
        )}

        {/* ── Security Tab ──────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <Section title="Digital Signature">
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/40 flex items-start gap-3">
                <Shield className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Electronic Signature — Active</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Key SHA-256: a12c...8f3b (Issued by MCMS Certificate Authority)
                  </div>
                  <div className="text-[11px] text-teal-700 mt-2 font-semibold">
                    ✓ Valid — Used for medication administration records and nursing assessments
                  </div>
                </div>
              </div>
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Access Management">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div>
                  <div className="text-xs font-bold text-slate-800">Change Password</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                    Passwords must be at least 10 characters with a mix of letters, numbers, and symbols.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
                    />
                  </div>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Changes apply immediately after saving.</span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
