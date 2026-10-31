'use client';

import React from 'react';

export interface NursePageShellProps {
  /** Top banner (title, date badge, primary action buttons) */
  banner?: React.ReactNode;
  /** Optional compact KPI stat cards row */
  kpis?: React.ReactNode;
  /** Optional sub-navigation or search filter bar */
  subnav?: React.ReactNode;
  /** Main column or left content (table, schedule, form, etc.) */
  children: React.ReactNode;
  /** Optional right-side panel (patient details, quick actions, contact info, etc.) */
  rightPanel?: React.ReactNode;
  /** Custom width for right panel (defaults to lg:w-[380px] xl:w-[410px] 2xl:w-[430px]) */
  rightPanelWidth?: string;
  /** Optional custom class for the main scroll container */
  mainClassName?: string;
  /** Optional custom class for the right panel container */
  rightPanelClassName?: string;
  /** Optional container max-width (defaults to max-w-[1780px]) */
  maxWidth?: string;
  /** Optional full-page scroll mode (e.g. for dashboard or full reports) */
  scrollMode?: 'split' | 'single';
}

function NursePageShell({
  banner,
  kpis,
  subnav,
  children,
  rightPanel,
  rightPanelWidth = 'lg:w-[380px] xl:w-[410px] 2xl:w-[430px]',
  mainClassName = '',
  rightPanelClassName = '',
  maxWidth = 'max-w-[1780px]',
  scrollMode = 'split',
}: NursePageShellProps) {
  if (scrollMode === 'single') {
    return (
      <div className="h-full w-full flex flex-col min-h-0 min-w-0 overflow-y-auto">
        <div className={`w-full ${maxWidth} mx-auto p-4 sm:p-5 lg:p-6 space-y-4`}>
          {banner && <div className="shrink-0">{banner}</div>}
          {kpis && <div className="shrink-0">{kpis}</div>}
          {subnav && <div className="shrink-0">{subnav}</div>}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full w-full ${maxWidth} mx-auto p-4 sm:p-5 lg:p-6 flex flex-col min-h-0 min-w-0 overflow-hidden`}
    >
      {/* ── Fixed Top Controls (Banner, Compact KPIs, Subnav) ── */}
      {(banner || kpis || subnav) && (
        <div className="shrink-0 space-y-3 mb-3">
          {banner && <div>{banner}</div>}
          {kpis && <div>{kpis}</div>}
          {subnav && <div>{subnav}</div>}
        </div>
      )}

      {/* ── Scrollable Body Area ── */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-4 sm:gap-5 overflow-hidden">
        {/* Main Column */}
        <div
          className={`flex-1 min-h-0 min-w-0 flex flex-col overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 ${mainClassName}`}
        >
          {children}
        </div>

        {/* Right Side Panel */}
        {rightPanel && (
          <aside
            className={`shrink-0 ${rightPanelWidth} flex flex-col min-h-0 min-w-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 ${rightPanelClassName}`}
          >
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

export default React.memo(NursePageShell);
