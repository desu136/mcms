import React from 'react';

export interface NursePageShellProps {
  /** Optional top banner/header section (title, date badge, primary action buttons) */
  banner?: React.ReactNode;
  header?: React.ReactNode;
  /** Optional compact KPI stat cards row */
  kpis?: React.ReactNode;
  /** Main column content (table, schedule, form, etc.) */
  children: React.ReactNode;
  /** Optional right-side panel (patient details, quick actions, mini calendar, etc.) */
  rightPanel?: React.ReactNode;
  /** Custom width for right panel (defaults to lg:w-[320px] xl:w-[360px]) */
  rightPanelWidth?: string;
  /** Optional custom class for the main scroll container */
  mainClassName?: string;
  /** Optional custom class for the right panel container */
  rightPanelClassName?: string;
  /** Optional container max-width (defaults to max-w-[1750px]) */
  maxWidth?: string;
}

export function NursePageShell({
  banner,
  header,
  kpis,
  children,
  rightPanel,
  rightPanelWidth = 'lg:w-[320px] xl:w-[360px]',
  mainClassName = '',
  rightPanelClassName = '',
  maxWidth = 'max-w-[1750px]',
}: NursePageShellProps) {
  const topHeader = banner ?? header;

  return (
    <div
      className={`h-full w-full ${maxWidth} mx-auto p-3 lg:p-4 flex flex-col min-h-0 min-w-0 overflow-hidden bg-[#F4F7FC]`}
    >
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-3.5 max-lg:overflow-y-auto lg:overflow-hidden">
        {/* Main Content Column */}
        <div
          className={`flex-1 min-h-0 min-w-0 flex flex-col lg:overflow-hidden ${mainClassName}`}
        >
          {/* Top Header Section */}
          {topHeader && <div className="shrink-0 mb-3">{topHeader}</div>}

          {/* Compact KPI Row */}
          {kpis && <div className="shrink-0 mb-3">{kpis}</div>}

          {/* Scrollable Children */}
          <div className="flex-1 min-h-0 min-w-0 lg:overflow-y-auto lg:pr-1.5 space-y-3.5">
            {children}
          </div>
        </div>

        {/* Right-Side Panel */}
        {rightPanel && (
          <aside
            className={`w-full ${rightPanelWidth} shrink-0 min-h-0 lg:overflow-y-auto lg:pr-1 space-y-3.5 ${rightPanelClassName}`}
          >
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

export default React.memo(NursePageShell);
