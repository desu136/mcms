'use client';

import React from 'react';

export interface LabPageShellProps {
  /** Top header section (page icon, title, subtitle, date selector, main action button) */
  header?: React.ReactNode;
  /** 5 KPI stat cards row */
  kpis?: React.ReactNode;
  /** Main column content */
  children: React.ReactNode;
  /** Optional right-side panel */
  rightPanel?: React.ReactNode;
  rightPanelWidth?: string;
  mainClassName?: string;
  rightPanelClassName?: string;
  maxWidth?: string;
}

export default function LabPageShell({
  header,
  kpis,
  children,
  rightPanel,
  rightPanelWidth = 'lg:w-[360px] xl:w-[390px] 2xl:w-[420px]',
  mainClassName = '',
  rightPanelClassName = '',
  maxWidth = 'max-w-[1920px]',
}: LabPageShellProps) {
  return (
    <div
      className={`min-h-screen w-full ${maxWidth} mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5 bg-[#F4F7FB]`}
    >
      {/* Top Header Row spanning full width */}
      {header && <div className="shrink-0">{header}</div>}

      {/* Main Two-Column Layout */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column (KPIs, Tabs, Search, Table, Bottom Widgets) */}
        <div className={`flex-1 min-w-0 w-full space-y-4 ${mainClassName}`}>
          {kpis && <div>{kpis}</div>}
          {children}
        </div>

        {/* Right Column (Selected Test Details, Patient Info, Test Info, Stepper, Actions) */}
        {rightPanel && (
          <aside
            className={`w-full ${rightPanelWidth} shrink-0 space-y-4 ${rightPanelClassName}`}
          >
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

