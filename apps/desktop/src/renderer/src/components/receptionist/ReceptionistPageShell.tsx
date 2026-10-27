import React from 'react';

export interface ReceptionistPageShellProps {
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
  /** Custom width for right panel (defaults to lg:w-[360px] xl:w-[400px] 2xl:w-[430px]) */
  rightPanelWidth?: string;
  /** Optional custom class for the main scroll container */
  mainClassName?: string;
  /** Optional custom class for the right panel container */
  rightPanelClassName?: string;
  /** Optional container max-width (defaults to max-w-[1750px]) */
  maxWidth?: string;
  /** Optional full-page scroll mode (e.g. for dashboard or full reports) */
  scrollMode?: 'split' | 'single';
}

export function ReceptionistPageShell({
  banner,
  kpis,
  subnav,
  children,
  rightPanel,
  rightPanelWidth = 'lg:w-[360px] xl:w-[400px] 2xl:w-[430px]',
  mainClassName = '',
  rightPanelClassName = '',
  maxWidth = 'max-w-[1750px]',
  scrollMode = 'split',
}: ReceptionistPageShellProps) {
  if (scrollMode === 'single') {
    return (
      <div className="h-full w-full flex flex-col min-h-0 min-w-0 overflow-y-auto">
        <div className={`w-full ${maxWidth} mx-auto p-3.5 sm:p-4.5 lg:p-5 space-y-3.5 sm:space-y-4`}>
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
      className={`h-full w-full ${maxWidth} mx-auto p-3 sm:p-4 lg:p-4.5 flex flex-col min-h-0 min-w-0 overflow-hidden`}
    >
      {/* Fixed Top Controls (Banner, Compact KPIs, Subnav) */}
      {(banner || kpis || subnav) && (
        <div className="shrink-0 space-y-2.5 mb-2.5 sm:mb-3">
          {banner && <div>{banner}</div>}
          {kpis && <div>{kpis}</div>}
          {subnav && <div>{subnav}</div>}
        </div>
      )}

      {/* Desktop Split Viewport with Independent Scrolling */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-3 sm:gap-3.5 max-lg:overflow-y-auto lg:overflow-hidden">
        {/* Main Content Column */}
        <div
          className={`flex-1 min-h-0 min-w-0 flex flex-col lg:overflow-y-auto lg:pr-1.5 space-y-3 sm:space-y-3.5 ${mainClassName}`}
        >
          {children}
        </div>

        {/* Right-Side Panel */}
        {rightPanel && (
          <aside
            className={`w-full ${rightPanelWidth} shrink-0 min-h-0 lg:overflow-y-auto lg:pr-1 space-y-3 sm:space-y-3.5 ${rightPanelClassName}`}
          >
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

export default React.memo(ReceptionistPageShell);
