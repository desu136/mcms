'use client';

import React, { useState } from 'react';
import { Settings, Bell, Lock, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';

export default function DoctorSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalLabAlerts, setCriticalLabAlerts] = useState(true);
  const [autoSignNotes, setAutoSignNotes] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const settingsHeader = (
    <div className="flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
        <Settings className="w-5 h-5 stroke-[2.2]" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Doctor Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Customize notification preferences, digital signature security, and consultation defaults.
        </p>
      </div>
    </div>
  );

  return (
    <DoctorPageShell header={settingsHeader} maxWidth="max-w-4xl">

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              Clinical Notification Preferences
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure real-time alerts for incoming lab critical values and pharmacy dispensations.
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Critical Laboratory Value Alerts</div>
                  <div className="text-[11px] text-slate-400">
                    Immediate notification when cardiac markers or electrolytes exceed critical thresholds
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={criticalLabAlerts}
                  onChange={(e) => setCriticalLabAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Appointment Schedule Updates</div>
                  <div className="text-[11px] text-slate-400">
                    Notify when triage marks patient as checked-in or when appointments are rescheduled
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Electronic Signature & Security
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Cryptographic signing key parameters for EMR notes and prescriptions.
            </p>

            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Digital Signature Status:</span> Verified & Active
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Key SHA-256: 8f4e...291a (Issued by MCMS Certificate Authority)
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                Valid
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Settings take effect immediately across all sessions.</span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </DoctorPageShell>
  );
}
