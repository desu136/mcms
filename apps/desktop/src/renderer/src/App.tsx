import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    mcmsDesktop?: {
      getSyncStatus: () => Promise<{
        ready: boolean;
        pendingOperations: number;
        cursor: string | null;
      }>;
      getVersion: () => Promise<string>;
    };
  }
}

export function App() {
  const [syncStatus, setSyncStatus] = useState<{
    ready: boolean;
    pendingOperations: number;
    cursor: string | null;
  }>({
    ready: false,
    pendingOperations: 0,
    cursor: null,
  });

  useEffect(() => {
    if (window.mcmsDesktop) {
      window.mcmsDesktop.getSyncStatus().then(setSyncStatus).catch(console.error);
    }
  }, []);

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <header
        style={{ borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#38bdf8' }}>
          MCMS Clinical Workstation (Desktop)
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
          Electron + React + TypeScript + Local SQLite Architecture
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            background: '#1e293b',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Local SQLite Storage
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginTop: '8px',
              color: syncStatus.ready ? '#4ade80' : '#f87171',
            }}
          >
            {syncStatus.ready ? 'SQLite Engine Active' : 'Initializing / Browser Mode'}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Dedicated local database for workstation resilience
          </div>
        </div>

        <div
          style={{
            background: '#1e293b',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Pending Outbound Queue
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px', color: '#f8fafc' }}>
            {syncStatus.pendingOperations} operations
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Sync cursor: {syncStatus.cursor ?? 'Initial (none)'}
          </div>
        </div>

        <div
          style={{
            background: '#1e293b',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Security Architecture
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px', color: '#38bdf8' }}>
            Isolated Preload Bridge
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            contextIsolation: true &bull; sandbox: true
          </div>
        </div>
      </div>
    </div>
  );
}
