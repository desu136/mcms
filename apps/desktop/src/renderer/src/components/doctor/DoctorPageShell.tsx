import React from 'react';

export interface DoctorPageShellProps {
  header?: React.ReactNode;
  kpis?: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  rightPanelWidth?: string;
}

export function DoctorPageShell({
  header,
  kpis,
  children,
  rightPanel,
  rightPanelWidth = '340px',
}: DoctorPageShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Main Content Column */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Section */}
        {header && <div style={{ flexShrink: 0, marginBottom: '14px' }}>{header}</div>}

        {/* Compact KPI Row */}
        {kpis && <div style={{ flexShrink: 0, marginBottom: '14px' }}>{kpis}</div>}

        {/* Scrollable Children */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingRight: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {children}
        </div>
      </div>

      {/* Right-Side Panel */}
      {rightPanel && (
        <aside
          style={{
            width: rightPanelWidth,
            flexShrink: 0,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingRight: '2px',
          }}
        >
          {rightPanel}
        </aside>
      )}
    </div>
  );
}
