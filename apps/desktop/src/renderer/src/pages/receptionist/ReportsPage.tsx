import React, { useState } from 'react';
import {
  BarChart2,
  Calendar,
  Download,
  Printer,
  Users,
  CreditCard,
  Clock,
  TrendingUp,
  FileText,
  Database,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import {
  REPORTS_KPIS,
  KpiMetric,
  VISIT_TYPES_REPORT_DONUT,
  PAYMENT_METHODS_REPORT_DONUT,
} from '../../components/receptionist/receptionistMockData';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface ReportsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function ReportsPage({ onNavigateTab }: ReportsPageProps) {
  const [reportRange, setReportRange] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  return (
    <ReceptionistPageShell
      banner={
        <ReceptionistBanner
          title="Reception Clinic Reports & Audits"
          subtitle="Real-time patient intake summaries, queue wait analytics, and revenue collection reports."
          icon={BarChart2}
          actionElement={
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setReportRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reportRange === range
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          }
        />
      }
      kpis={
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          {REPORTS_KPIS.map((kpi: KpiMetric, idx: number) => (
            <ReceptionistStatCard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              prefix={kpi.prefix}
              suffix={kpi.suffix}
              change={kpi.change}
              trend={kpi.trend}
              trendLabel={kpi.trendLabel}
              iconName={kpi.iconName}
              color={kpi.color}
            />
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Visit Types Donut */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Patient Visit Distribution</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">324 Total Visits</span>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VISIT_TYPES_REPORT_DONUT}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {VISIT_TYPES_REPORT_DONUT.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-black text-slate-900 leading-none">324</span>
              <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Visits</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            {VISIT_TYPES_REPORT_DONUT.map((v) => (
              <div key={v.name} className="flex items-center justify-between text-xs p-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                  <span className="text-slate-600 truncate">{v.name}</span>
                </div>
                <span className="font-bold text-slate-900">{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown Donut */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Revenue Collections</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-600">ETB 124,580</span>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PAYMENT_METHODS_REPORT_DONUT}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="percent"
                  isAnimationActive={false}
                >
                  {PAYMENT_METHODS_REPORT_DONUT.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xs font-black text-slate-900">ETB 124,580</span>
              <span className="text-[10px] font-semibold text-slate-400">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            {PAYMENT_METHODS_REPORT_DONUT.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs p-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

export default React.memo(ReportsPage);
