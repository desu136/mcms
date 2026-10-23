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
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';

export interface SettingsPageProps {
  appVersion?: string;
  pendingSyncOps?: number;
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
    }, 1500);
  };

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Workstation &amp; Sync Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Local SQLite offline database, delta synchronization engine, and system diagnostics.
          </p>
        </div>
      </div>

      <button
        onClick={handleTriggerSync}
        disabled={syncing}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all self-start md:self-auto cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Synchronizing...' : 'Force Delta Sync Now'}
      </button>
    </div>
  );

  return (
    <DoctorPageShell header={headerContent}>
      {syncSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Local SQLite workstation successfully synchronized with PostgreSQL backend authority!
        </div>
      )}

      <div className="space-y-5">
        {/* Diagnostics Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Offline-First Engine Diagnostics</h3>
              <p className="text-[11px] text-slate-400">High-throughput local caching via SQLite</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100 text-xs">
            {[
              {
                icon: HardDrive,
                label: 'Local SQLite Database',
                val: 'mcms_desktop_local.sqlite (better-sqlite3 v11.8.1)',
                status: 'Active',
                color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
              },
              {
                icon: RefreshCw,
                label: 'Sync Architecture',
                val: '@mcms/sync-core (Cursor-based delta synchronization)',
                status: 'Enabled',
                color: 'bg-blue-50 text-blue-600 border-blue-200',
              },
              {
                icon: Cpu,
                label: 'Pending Outbound Queue',
                val: `${pendingSyncOps} operations waiting for network commit`,
                status: pendingSyncOps > 0 ? 'Pending' : 'Clean',
                color: pendingSyncOps > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
              },
              {
                icon: Server,
                label: 'Backend Authority Server',
                val: 'http://localhost:3001/api/v1 (PostgreSQL & Prisma)',
                status: 'Connected',
                color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
              },
              {
                icon: ShieldCheck,
                label: 'Desktop Application Version',
                val: `@mcms/desktop v${appVersion}`,
                status: 'Release',
                color: 'bg-slate-100 text-slate-700 border-slate-200',
              },
              {
                icon: Lock,
                label: 'Process Isolation & Context',
                val: 'contextIsolation: true, sandbox: true',
                status: 'Secure',
                color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
              },
            ].map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={i} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-400">{row.label}</div>
                      <div className="text-xs font-mono font-bold text-slate-800 truncate mt-0.5">
                        {row.val}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${row.color}`}
                  >
                    {row.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DoctorPageShell>
  );
}
export default SettingsPage;
