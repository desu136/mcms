import React from 'react';

export interface DoctorPageShellProps {
  /** Optional top header section (title, date badge, primary action buttons) */
  header?: React.ReactNode;
  /** Optional compact KPI stat cards row */
  kpis?: React.ReactNode;
  /** Main column content (table, schedule, form, etc.) */
  children: React.ReactNode;
  /** Optional right-side panel (patient details, quick actions, mini calendar, etc.) */
  rightPanel?: React.ReactNode;
  /** Custom width for right panel (defaults to lg:w-[360px] xl:w-[390px]) */
  rightPanelWidth?: string;
  /** Optional custom class for the main scroll container */
  mainClassName?: string;
  /** Optional custom class for the right panel container */
  rightPanelClassName?: string;
  /** Optional container max-width (defaults to max-w-[1750px]) */
  maxWidth?: string;
}

export function DoctorPageShell({
  header,
  kpis,
  children,
  rightPanel,
  rightPanelWidth = 'lg:w-[340px] xl:w-[380px]',
  mainClassName = '',
  rightPanelClassName = '',
  maxWidth = 'max-w-[1750px]',
}: DoctorPageShellProps) {
  return (
    <div
      className={`h-full w-full ${maxWidth} mx-auto p-3 lg:p-4 flex flex-col min-h-0 min-w-0 overflow-hidden`}
    >
      {/* ── Scrollable Body Area ──
          Desktop (lg+): Flex row, parent is overflow-hidden.
          Main content column on the left contains the page header, the KPI summary cards,
          and page body/table/schedule, so top cards never cover the right-side panel.
          Right-side panel starts right at the top alongside the main column.
      */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col lg:flex-row gap-4 max-lg:overflow-y-auto lg:overflow-hidden">
        {/* Main Content Column */}
        <div
          className={`flex-1 min-h-0 min-w-0 flex flex-col lg:overflow-hidden ${mainClassName}`}
        >
          {/* Top Header Section (Title, Badges & Actions) */}
          {header && <div className="shrink-0 mb-3">{header}</div>}

          {/* Compact KPI Row (Only spans main column, not right panel) */}
          {kpis && <div className="shrink-0 mb-3">{kpis}</div>}

          {/* Scrollable Children */}
          <div className="flex-1 min-h-0 min-w-0 lg:overflow-y-auto lg:pr-1.5 space-y-4">
            {children}
          </div>
        </div>

        {/* Right-Side Panel — starts at top level, scrolls independently on desktop */}
        {rightPanel && (
          <aside
            className={`w-full ${rightPanelWidth} shrink-0 min-h-0 lg:overflow-y-auto lg:pr-1 space-y-4 ${rightPanelClassName}`}
          >
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
export default DoctorPageShell;
