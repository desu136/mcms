'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Clock,
  Save,
  CheckCircle2,
  Monitor,
  Eye,
  RefreshCw,
  Smartphone,
  AlertTriangle,
  Activity,
  FlaskConical,
  Pill,
  MessageSquare,
  FileText,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';

type TabId = 'notifications' | 'consultation' | 'display' | 'privacy' | 'security';

function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
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
        className="relative cursor-pointer shrink-0"
        style={{ width: 40, height: 22, marginTop: 2 }}
      >
        <div
          className={`w-full h-full rounded-full transition-all ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
        />
        <div
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all ${
            checked ? 'left-[20px]' : 'left-[2px]'
          }`}
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

export default function DoctorSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('notifications');
  const [saved, setSaved] = useState(false);

  /* Notifications */
  const [criticalLabAlerts, setCriticalLabAlerts] = useState(true);
  const [rxRefillAlerts, setRxRefillAlerts] = useState(true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(true);
  const [patientMsgAlerts, setPatientMsgAlerts] = useState(true);
  const [labResultAlerts, setLabResultAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  /* Consultation */
  const [autoSignNotes, setAutoSignNotes] = useState(false);
  const [showPreviousMeds, setShowPreviousMeds] = useState(true);
  const [showAllergyWarnings, setShowAllergyWarnings] = useState(true);
  const [showDrugInteractions, setShowDrugInteractions] = useState(true);
  const [defaultConsultDuration, setDefaultConsultDuration] = useState('20');
  const [consultationRoom, setConsultationRoom] = useState('Room 3');
  const [templateSignature, setTemplateSignature] = useState('Dr. [Name], [Specialty]\nMCMS Clinic');

  /* Display */
  const [compactView, setCompactView] = useState(false);
  const [showPatientAvatars, setShowPatientAvatars] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('60');

  /* Privacy / Session */
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [activityLog, setActivityLog] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayLabel = now.toLocaleDateString('en-US', { weekday: 'long' });

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'consultation', label: 'Consultation', icon: <Activity className="w-4 h-4" /> },
    { id: 'display', label: 'Display', icon: <Monitor className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Settings className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Doctor Workspace Settings
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Customize notification preferences, consultation defaults, and security settings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">{dateLabel}</div>
            <div className="text-[10px] text-slate-400 font-medium">{dayLabel}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* ── Notifications ─────────────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <Section title="Clinical Alerts">
              <Toggle
                checked={criticalLabAlerts}
                onChange={setCriticalLabAlerts}
                label="Critical Laboratory Value Alerts"
                description="Immediate notification when cardiac markers or electrolytes exceed critical thresholds"
                icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
              />
              <Toggle
                checked={labResultAlerts}
                onChange={setLabResultAlerts}
                label="Lab Result Ready Notifications"
                description="Notify when ordered lab tests are resulted and available for review"
                icon={<FlaskConical className="w-4 h-4 text-indigo-500" />}
              />
              <Toggle
                checked={rxRefillAlerts}
                onChange={setRxRefillAlerts}
                label="Prescription Refill Requests"
                description="Alert when pharmacy or patient requests a prescription renewal or verification"
                icon={<Pill className="w-4 h-4 text-purple-500" />}
              />
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Schedule & Communication">
              <Toggle
                checked={appointmentAlerts}
                onChange={setAppointmentAlerts}
                label="Appointment Schedule Updates"
                description="Notify when triage marks patient as checked-in or when appointments are rescheduled"
                icon={<Clock className="w-4 h-4 text-blue-500" />}
              />
              <Toggle
                checked={patientMsgAlerts}
                onChange={setPatientMsgAlerts}
                label="Patient Message Notifications"
                description="Real-time alerts for incoming messages from patients or nursing staff"
                icon={<MessageSquare className="w-4 h-4 text-teal-500" />}
              />
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Delivery Preferences">
              <Toggle
                checked={soundEnabled}
                onChange={setSoundEnabled}
                label="Alert Sounds"
                description="Play audio tones for critical and high-priority notifications"
                icon={soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              />
              <Toggle
                checked={emailDigest}
                onChange={setEmailDigest}
                label="Daily Email Summary"
                description="Receive an end-of-day summary with completed consultations and pending tasks"
                icon={<Smartphone className="w-4 h-4 text-slate-500" />}
              />
            </Section>
          </div>
        )}

        {/* ── Consultation ──────────────────────────────────────────── */}
        {activeTab === 'consultation' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <Section title="Clinical Decision Support">
              <Toggle
                checked={showPreviousMeds}
                onChange={setShowPreviousMeds}
                label="Show Previous Medications"
                description="Display the patient's current and past medication history when writing prescriptions"
                icon={<Pill className="w-4 h-4 text-purple-500" />}
              />
              <Toggle
                checked={showAllergyWarnings}
                onChange={setShowAllergyWarnings}
                label="Allergy Warnings"
                description="Alert when a prescribed drug matches a documented patient allergy"
                icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
              />
              <Toggle
                checked={showDrugInteractions}
                onChange={setShowDrugInteractions}
                label="Drug Interaction Checking"
                description="Flag potential drug-drug interactions when adding medications to prescriptions"
                icon={<Activity className="w-4 h-4 text-amber-500" />}
              />
              <Toggle
                checked={autoSignNotes}
                onChange={setAutoSignNotes}
                label="Auto-Sign Clinical Notes"
                description="Automatically apply your digital signature when saving consultation notes"
                icon={<FileText className="w-4 h-4 text-blue-500" />}
              />
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Scheduling Defaults">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Default Consultation Duration</label>
                  <select
                    value={defaultConsultDuration}
                    onChange={(e) => setDefaultConsultDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                  >
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Default Room</label>
                  <input
                    type="text"
                    value={consultationRoom}
                    onChange={(e) => setConsultationRoom(e.target.value)}
                    placeholder="e.g. Room 3"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                  />
                </div>
              </div>
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Note Signature Template">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Signature Block (appended to clinical notes)</label>
                <textarea
                  value={templateSignature}
                  onChange={(e) => setTemplateSignature(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white font-mono resize-none"
                />
              </div>
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
                label="Compact Patient List"
                description="Reduce row spacing to display more patients on screen at once"
                icon={<Monitor className="w-4 h-4 text-slate-600" />}
              />
              <Toggle
                checked={showPatientAvatars}
                onChange={setShowPatientAvatars}
                label="Show Patient Avatars"
                description="Display patient photo placeholders throughout the workspace"
                icon={<Eye className="w-4 h-4 text-blue-500" />}
              />
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Auto-Refresh">
              <Toggle
                checked={autoRefresh}
                onChange={setAutoRefresh}
                label="Auto-Refresh Dashboard"
                description="Automatically reload appointments and patient data at a set interval"
                icon={<RefreshCw className="w-4 h-4 text-indigo-500" />}
              />
              {autoRefresh && (
                <div className="px-3.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-2">Refresh Interval</label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                  >
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every 1 minute</option>
                    <option value="300">Every 5 minutes</option>
                    <option value="600">Every 10 minutes</option>
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
                description="Record your clinical actions for compliance and audit purposes"
                icon={<Eye className="w-4 h-4 text-indigo-500" />}
              />
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 text-xs text-blue-800">
                <span className="font-bold">Note:</span> Prescription issuances, lab orders, and clinical notes are always recorded regardless of this setting.
              </div>
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Session Management">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-800 mb-1">Auto Session Timeout</label>
                <p className="text-[11px] text-slate-400 mb-3">Lock the workstation after inactivity</p>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
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
            <Section title="Electronic Signature">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Digital Signature Status: Verified & Active</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Key SHA-256: 8f4e...291a (Issued by MCMS Certificate Authority)
                  </div>
                  <div className="text-[11px] text-blue-700 mt-2 font-semibold">
                    ✓ Valid — Authorized for prescriptions, lab orders, and clinical notes
                  </div>
                </div>
              </div>
            </Section>

            <div className="border-t border-slate-100 pt-4" />

            <Section title="Change Password">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <p className="text-[11px] text-slate-400 mb-2">
                  Passwords must be at least 10 characters with letters, numbers, and symbols.
                </p>
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                />
              </div>
            </Section>
          </div>
        )}

        {/* Save */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings take effect immediately across all sessions.</span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
