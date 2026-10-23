import React from 'react';
import { Database, ShieldCheck, RefreshCw, Server, HardDrive } from 'lucide-react';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';

export interface SettingsPageProps {
  appVersion?: string;
  pendingSyncOps?: number;
}

export function SettingsPage({ appVersion = '0.0.1', pendingSyncOps = 0 }: SettingsPageProps) {
  return (
    <DoctorPageShell>
      <div
        style={{
          background: 'rgba(21,30,51,0.65)',
          border: '1px solid rgba(30,41,59,0.9)',
          borderRadius: '14px',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="#38bdf8" /> Offline-First Workstation Engine
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(15,23,42,0.6)', borderRadius: '10px', border: '1px solid #1e293b', overflow: 'hidden' }}>
          {[
            { label: 'Local SQLite Database', val: 'mcms_desktop_local.sqlite (better-sqlite3)', status: 'Active' },
            { label: 'Sync Architecture', val: '@mcms/sync-core (Cursor-based delta)', status: 'Enabled' },
            { label: 'Pending Outbound Operations', val: `${pendingSyncOps} operations in local queue`, status: 'Ready' },
            { label: 'Backend Authority Server', val: 'http://localhost:3001/api/v1 (PostgreSQL)', status: 'Connected' },
            { label: 'Desktop Application Version', val: appVersion, status: 'v0.0.1' },
            { label: 'Process Isolation & Sandbox', val: 'contextIsolation=true, sandbox=true', status: 'Secure' },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(30,41,59,0.5)',
                fontSize: '12px',
              }}
            >
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>{row.label}</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginTop: '2px', fontFamily: 'monospace' }}>
                  {row.val}
                </div>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 600,
                  background: 'rgba(56,189,248,0.1)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56,189,248,0.2)',
                }}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DoctorPageShell>
  );
}
