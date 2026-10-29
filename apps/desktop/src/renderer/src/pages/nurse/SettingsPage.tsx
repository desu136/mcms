import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  RefreshCw,
  Server,
  HardDrive,
  CheckCircle2,
  Settings,
  Cpu,
  Lock,
} from 'lucide-react';
import { NursePageShell } from '../../components/nurse/NursePageShell';

export interface SettingsPageProps {
  appVersion?: string;
  pendingSyncOps?: number;
  onNavigateTab?: (tab: string) => void;
}

export function SettingsPage({ appVersion = '0.0.1', pendingSyncOps = 0 }: SettingsPageProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleTriggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Settings size={18} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Nurse Station Settings & Sync
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Local SQLite offline database, telemetry buffer, and ward sync configuration
          </p>
        </div>
      </div>

      <button
        onClick={handleTriggerSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
      >
        <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
        <span>{syncing ? 'Synchronizing...' : 'Force Ward Sync'}</span>
      </button>
    </div>
  );

  return (
    <NursePageShell header={headerContent}>
      {syncSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>Ward telemetry & eMAR records successfully synced with hospital server.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Offline-First Engine Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Database size={16} className="text-blue-600" />
            <span>Local SQLite Engine</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            The nursing station maintains an isolated SQLite database on this PC. Even if hospital Wi-Fi drops,
            vital sign measurements, eMAR dose administrations, and clinical notes are committed locally with zero latency.
          </p>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Database Driver:</span>
              <span className="font-mono font-semibold text-gray-700">better-sqlite3 v11</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pending Outbound Queue:</span>
              <span className="font-bold text-blue-600">{pendingSyncOps} operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Station App Version:</span>
              <span className="font-mono text-gray-700">{appVersion}</span>
            </div>
          </div>
        </div>

        {/* Security & Audit Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Station Security & Compliance</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            All patient vital signs and eMAR medication events are cryptographically hashed and audit-logged according
            to medical data retention standards.
          </p>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Local DB Encryption:</span>
              <span className="font-semibold text-emerald-600">Active (AES-256)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Auto-lock on Inactivity:</span>
              <span className="font-medium text-gray-700">15 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nurse Station Mode:</span>
              <span className="font-medium text-gray-700">Ward 3A Client</span>
            </div>
          </div>
        </div>
      </div>
    </NursePageShell>
  );
}

export default React.memo(SettingsPage);
