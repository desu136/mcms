import React, { useState } from 'react';
import {
  Settings,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Wifi,
  WifiOff,
  User,
  ShieldCheck,
  Server,
  Terminal,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import { useSync } from '../../context/SyncContext';
import { CURRENT_RECEPTIONIST } from '../../components/receptionist/receptionistMockData';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface SettingsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
  appVersion?: string;
}

export function SettingsPage({ onNavigateTab, appVersion = '0.0.1' }: SettingsPageProps) {
  const {
    syncStatus,
    isOnline,
    isSyncing,
    lastSyncedAt,
    lastSyncMessage,
    pendingOps,
    triggerSync,
    refreshSyncStatus,
  } = useSync();

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    const res = await triggerSync();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <ReceptionistPageShell
      banner={
        <ReceptionistBanner
          title="Workstation Settings & SQLite Sync Engine"
          subtitle="Configure local clinical storage, offline queue parameters, and monitor bidirectional synchronization."
          icon={Settings}
          actionElement={
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Force Sync Now'}</span>
            </button>
          }
        />
      }
    >
      <div className="space-y-4">
        {syncFeedback && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-blue-500 hover:text-blue-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sync Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>SQLite Engine</span>
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {syncStatus.ready ? 'Active (Local)' : 'Initializing'}
            </div>
            <div className="text-[11px] text-slate-400">
              better-sqlite3 journal mode WAL
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Pending Queue</span>
              <HardDrive className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {syncStatus.pendingOperations} operations
            </div>
            <div className="text-[11px] text-slate-400">
              {syncStatus.pendingOperations > 0 ? 'Queued to sync when online' : 'Clean & synchronized'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Central Server Connection</span>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <div className={`text-xl font-black ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isOnline ? 'Connected' : 'Offline Mode'}
            </div>
            <div className="text-[11px] text-slate-400">
              {lastSyncedAt
                ? `Last sync: ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Auto-sync active every 10s'}
            </div>
          </div>
        </div>

        {/* Live Pending Operations Queue Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Local SQLite Outbound Queue (`local_sync_queue`)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Cursor: {syncStatus.cursor || 'none (initial sync)'}
            </span>
          </div>

          {pendingOps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-2">Operation ID</th>
                    <th className="pb-2">Entity Type</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Client Timestamp</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {pendingOps.map((op, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 text-slate-700 font-bold">{op.operationId}</td>
                      <td className="py-2 text-blue-700 font-semibold">{op.entityType}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {op.operation}
                        </span>
                      </td>
                      <td className="py-2 text-slate-500 text-[11px]">
                        {new Date(op.clientTimestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          PENDING
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700">All local operations are synchronized</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New registrations, check-ins, or appointments will enqueue here and sync automatically.
              </p>
            </div>
          )}
        </div>

        {/* Workstation Details Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Workstation Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 text-[11px] block">Operator Profile</span>
              <span className="font-bold text-slate-800 block">{CURRENT_RECEPTIONIST.name}</span>
              <span className="text-slate-500 text-[11px] block">{CURRENT_RECEPTIONIST.role} • Front Desk Reception</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 text-[11px] block">Application Build</span>
              <span className="font-bold text-slate-800 block">MCMS Desktop v{appVersion}</span>
              <span className="text-slate-500 text-[11px] block">Electron 34 + React 19 + SQLite Engine</span>
            </div>
          </div>
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

export default React.memo(SettingsPage);
