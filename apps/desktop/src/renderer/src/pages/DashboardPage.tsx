import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

interface SyncStatus {
  ready: boolean;
  pendingOperations: number;
  cursor: string | null;
}

declare global {
  interface Window {
    mcmsDesktop?: {
      getSyncStatus: () => Promise<SyncStatus>;
      getVersion: () => Promise<string>;
    };
  }
}

const STYLES = `
  .dash-root {
    min-height: 100vh;
    background: #0f172a;
    display: flex;
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* ── Sidebar ── */
  .dash-sidebar {
    width: 240px;
    background: rgba(15,23,42,0.95);
    border-right: 1px solid #1e293b;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .dash-sidebar-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 24px 20px;
    border-bottom: 1px solid #1e293b;
  }

  .dash-sidebar-logo-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  .dash-sidebar-logo-text { font-size: 16px; font-weight: 700; color: #f8fafc; }
  .dash-sidebar-logo-sub { font-size: 11px; color: #475569; margin-top: 1px; }

  .dash-nav { padding: 16px 12px; flex: 1; }

  .dash-nav-section-label {
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    color: #475569; padding: 0 8px; margin-bottom: 8px; margin-top: 16px;
  }
  .dash-nav-section-label:first-child { margin-top: 0; }

  .dash-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px; cursor: pointer;
    font-size: 13px; font-weight: 500; color: #94a3b8;
    transition: background 0.15s, color 0.15s;
    border: none; background: none; width: 100%; text-align: left;
    font-family: inherit;
  }
  .dash-nav-item:hover { background: rgba(51,65,85,0.5); color: #e2e8f0; }
  .dash-nav-item.active { background: rgba(56,189,248,0.1); color: #38bdf8; }
  .dash-nav-item-icon { font-size: 16px; width: 20px; text-align: center; }

  .dash-sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid #1e293b;
  }

  .dash-user-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    background: rgba(30,41,59,0.6);
    border: 1px solid #1e293b;
  }

  .dash-user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #0f172a;
    flex-shrink: 0;
  }

  .dash-user-name { font-size: 12px; font-weight: 600; color: #e2e8f0; }
  .dash-user-role { font-size: 11px; color: #64748b; text-transform: capitalize; }

  .dash-logout-btn {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 8px 12px; margin-top: 8px;
    background: none; border: 1px solid #1e293b; border-radius: 8px;
    font-size: 12px; font-weight: 500; color: #ef4444; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    font-family: inherit;
  }
  .dash-logout-btn:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); }

  /* ── Main ── */
  .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .dash-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid #1e293b;
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(8px);
  }

  .dash-topbar-title { font-size: 18px; font-weight: 700; color: #f8fafc; }
  .dash-topbar-sub { font-size: 13px; color: #64748b; margin-top: 2px; }

  .dash-status-pill {
    display: flex; align-items: center; gap: 6px;
    background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
    border-radius: 999px; padding: 5px 12px; font-size: 12px; font-weight: 500; color: #4ade80;
  }
  .dash-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }

  .dash-content { flex: 1; overflow-y: auto; padding: 32px; }

  /* ── Stat cards ── */
  .dash-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: rgba(30,41,59,0.7);
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 20px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .stat-card:hover { border-color: #334155; transform: translateY(-2px); }

  .stat-card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #475569; }
  .stat-card-value { font-size: 28px; font-weight: 700; color: #f8fafc; margin: 8px 0 4px; }
  .stat-card-meta { font-size: 12px; color: #64748b; }
  .stat-card-icon { font-size: 24px; float: right; margin-top: -4px; opacity: 0.7; }

  /* ── Sections ── */
  .dash-section-title {
    font-size: 14px; font-weight: 600; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 14px; margin-top: 28px;
  }
  .dash-section-title:first-of-type { margin-top: 0; }

  /* ── Info panel ── */
  .info-panel {
    background: rgba(30,41,59,0.7);
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
  }

  .info-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #1e293b;
    font-size: 13px;
  }
  .info-row:last-child { border-bottom: none; }
  .info-row-label { color: #64748b; }
  .info-row-value { color: #e2e8f0; font-weight: 500; font-family: 'Menlo', 'Consolas', monospace; font-size: 12px; }
  .info-row-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
    border-radius: 999px; padding: 2px 10px; font-size: 11px; color: #4ade80;
  }
  .info-row-badge.warn {
    background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.25); color: #fbbf24;
  }
  .info-row-badge.muted {
    background: rgba(100,116,139,0.1); border-color: rgba(100,116,139,0.25); color: #94a3b8;
  }
`;

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', id: 'dashboard' },
  { icon: '👥', label: 'Patients', id: 'patients' },
  { icon: '📅', label: 'Appointments', id: 'appointments' },
  { icon: '🩺', label: 'Consultations', id: 'consultations' },
  { icon: '💊', label: 'Prescriptions', id: 'prescriptions' },
  { icon: '🔬', label: 'Lab Results', id: 'lab' },
];

const SETTINGS_ITEMS = [
  { icon: '⚙️', label: 'Settings', id: 'settings' },
  { icon: '🔄', label: 'Sync Status', id: 'sync' },
];

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ ready: false, pendingOperations: 0, cursor: null });
  const [appVersion, setAppVersion] = useState<string>('—');

  useEffect(() => {
    if (window.mcmsDesktop) {
      window.mcmsDesktop.getSyncStatus().then(setSyncStatus).catch(() => {});
      window.mcmsDesktop.getVersion().then(setAppVersion).catch(() => {});
    }
  }, []);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : '?';

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-root">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar-logo">
            <div className="dash-sidebar-logo-icon">🏥</div>
            <div>
              <div className="dash-sidebar-logo-text">MCMS</div>
              <div className="dash-sidebar-logo-sub">Desktop Workstation</div>
            </div>
          </div>

          <nav className="dash-nav">
            <div className="dash-nav-section-label">Clinical</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`dash-nav-item${activeNav === item.id ? ' active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="dash-nav-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="dash-nav-section-label">System</div>
            {SETTINGS_ITEMS.map(item => (
              <button
                key={item.id}
                className={`dash-nav-item${activeNav === item.id ? ' active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="dash-nav-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="dash-sidebar-footer">
            <div className="dash-user-card">
              <div className="dash-user-avatar">{initials}</div>
              <div>
                <div className="dash-user-name">{displayName}</div>
                <div className="dash-user-role">{user?.role ?? 'Unknown'}</div>
              </div>
            </div>
            <button className="dash-logout-btn" onClick={logout}>
              <span>⬅</span> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="dash-main">
          <div className="dash-topbar">
            <div>
              <div className="dash-topbar-title">
                {NAV_ITEMS.find(i => i.id === activeNav)?.label ??
                  SETTINGS_ITEMS.find(i => i.id === activeNav)?.label ??
                  'Dashboard'}
              </div>
              <div className="dash-topbar-sub">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="dash-status-pill">
              <div className="dash-status-dot" />
              {syncStatus.ready ? 'SQLite Active' : 'Offline Mode'}
            </div>
          </div>

          <div className="dash-content">
            {/* Stats row */}
            <div className="dash-stats">
              <div className="stat-card">
                <span className="stat-card-icon">👥</span>
                <div className="stat-card-label">Total Patients</div>
                <div className="stat-card-value">—</div>
                <div className="stat-card-meta">Coming in next phase</div>
              </div>
              <div className="stat-card">
                <span className="stat-card-icon">📅</span>
                <div className="stat-card-label">Today's Appointments</div>
                <div className="stat-card-value">—</div>
                <div className="stat-card-meta">Coming in next phase</div>
              </div>
              <div className="stat-card">
                <span className="stat-card-icon">🔄</span>
                <div className="stat-card-label">Pending Sync Ops</div>
                <div className="stat-card-value">{syncStatus.pendingOperations}</div>
                <div className="stat-card-meta">Outbound queue</div>
              </div>
              <div className="stat-card">
                <span className="stat-card-icon">💾</span>
                <div className="stat-card-label">Local Storage</div>
                <div className="stat-card-value" style={{ fontSize: 18 }}>
                  {syncStatus.ready ? 'Active' : 'Init…'}
                </div>
                <div className="stat-card-meta">SQLite engine</div>
              </div>
            </div>

            {/* System info */}
            <div className="dash-section-title">Workstation Status</div>
            <div className="info-panel">
              <div className="info-row">
                <span className="info-row-label">Local SQLite Engine</span>
                <span className={`info-row-badge${syncStatus.ready ? '' : ' warn'}`}>
                  {syncStatus.ready ? '● Active' : '● Initializing'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Sync Cursor</span>
                <span className="info-row-value">{syncStatus.cursor ?? 'Initial (none)'}</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Application Version</span>
                <span className="info-row-value">{appVersion}</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Security Model</span>
                <span className="info-row-badge">contextIsolation · sandbox</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Authenticated User</span>
                <span className="info-row-value">{user?.email ?? '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Role</span>
                <span className={`info-row-badge${user?.role === 'ADMIN' ? '' : ' muted'}`}>
                  {user?.role ?? '—'}
                </span>
              </div>
            </div>

            <div className="dash-section-title">Architecture</div>
            <div className="info-panel">
              <div className="info-row">
                <span className="info-row-label">Database Authority</span>
                <span className="info-row-value">apps/api (PostgreSQL via Prisma)</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Local Persistence</span>
                <span className="info-row-value">better-sqlite3 · IPC main process</span>
              </div>
              <div className="info-row">
                <span className="info-row-label">Sync Protocol</span>
                <span className="info-row-value">@mcms/sync-core · cursor-based</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
