import React, { useState } from 'react';
import {
  FlaskConical,
  TestTube2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Scan,
  PlusCircle,
  Printer,
  Activity,
  Layers,
  ChevronRight,
  Clock,
  Settings,
  ShieldAlert,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  CURRENT_LAB_TECH,
  EXACT_SCREENSHOT_ORDERS,
  TEST_TYPE_DISTRIBUTION,
  LABORATORY_ALERTS,
  LabTestOrderItem,
} from '../../components/lab/labMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
  onOpenNewOrder?: () => void;
  onOpenCollectSample?: () => void;
  onOpenEnterResult?: (order: LabTestOrderItem) => void;
}

// 5 KPI Stat Cards
const STAT_CARDS = [
  {
    title: 'Total Samples',
    value: 48,
    change: '↑ 12%',
    trend: 'up' as const,
    label: 'vs. yesterday',
    color: 'cyan' as const,
  },
  {
    title: 'Pending Tests',
    value: 15,
    change: '↑ 7%',
    trend: 'up' as const,
    label: 'vs. yesterday',
    color: 'amber' as const,
  },
  {
    title: 'In Processing',
    value: 12,
    change: '↑ 20%',
    trend: 'up' as const,
    label: 'vs. yesterday',
    color: 'blue' as const,
  },
  {
    title: 'Completed Tests',
    value: 21,
    change: '↑ 18%',
    trend: 'up' as const,
    label: 'vs. yesterday',
    color: 'emerald' as const,
  },
  {
    title: 'Abnormal Results',
    value: 3,
    change: '↓ 50%',
    trend: 'down' as const,
    label: 'vs. yesterday',
    color: 'rose' as const,
  },
];

const PROCESSING_OVERVIEW_DATA = [
  { date: '10/13', completed: 18, pending: 8, inProcess: 10 },
  { date: '10/14', completed: 24, pending: 12, inProcess: 14 },
  { date: '10/15', completed: 20, pending: 9, inProcess: 8 },
  { date: '10/16', completed: 30, pending: 15, inProcess: 16 },
  { date: '10/17', completed: 26, pending: 11, inProcess: 12 },
  { date: '10/18', completed: 22, pending: 14, inProcess: 10 },
  { date: '10/19', completed: 34, pending: 15, inProcess: 12 },
];

const TODAYS_SUMMARY_DATA = [
  { name: 'Completed', value: 21, percent: '44%', color: '#10b981' },
  { name: 'In Processing', value: 12, percent: '25%', color: '#3b82f6' },
  { name: 'Pending', value: 15, percent: '31%', color: '#f59e0b' },
];

const EQUIPMENT_STATUS = [
  { name: 'Mindray BC-5000', type: 'Hematology Analyzer', status: 'Ready', health: '99%', nextCal: 'In 14 days' },
  { name: 'Roche Cobas c311', type: 'Clinical Chemistry', status: 'Running', health: '96%', nextCal: 'In 6 days' },
  { name: 'BioMérieux Bact/ALERT', type: 'Blood Culture System', status: 'Ready', health: '100%', nextCal: 'In 21 days' },
  { name: 'Eppendorf 5810R', type: 'Centrifuge Station', status: 'Idle', health: '98%', nextCal: 'In 30 days' },
];

export function DashboardPage({
  onNavigateTab,
  onOpenNewOrder,
  onOpenCollectSample,
  onOpenEnterResult,
}: DashboardPageProps) {
  const [selectedOrder, setSelectedOrder] = useState<LabTestOrderItem | null>(null);

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
          <FlaskConical className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
            Welcome Back, {CURRENT_LAB_TECH.name}
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-tight">
            Diagnostic Pathology & Clinical Laboratory Station • Offline SQLite Active
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        <button
          onClick={onOpenNewOrder || (() => onNavigateTab?.('tests'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Test Order</span>
        </button>

        <button
          onClick={onOpenCollectSample || (() => onNavigateTab?.('samples'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <TestTube2 className="w-3.5 h-3.5" />
          <span>Collect Specimen</span>
        </button>

        {/* Date Card */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
          <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 tracking-tight">Today</div>
            <div className="text-[10px] text-slate-400 font-medium leading-none">Nov 2026</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 5 Compact Cards in 1 Row without icons
  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      {STAT_CARDS.map((card, idx) => (
        <LabStatCard
          key={idx}
          title={card.title}
          value={card.value}
          change={{
            change: card.change,
            trend: card.trend,
            label: card.label,
          }}
          color={card.color}
        />
      ))}
    </div>
  );

  const rightPanelContent = (
    <div className="space-y-3.5">
      {/* Today's Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
            Today&apos;s Summary
          </h3>
          <button
            onClick={() => onNavigateTab?.('reports')}
            className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 transition cursor-pointer"
          >
            View Analytics
          </button>
        </div>

        <div className="flex items-center gap-4 py-1">
          {/* Donut Chart */}
          <div className="relative w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TODAYS_SUMMARY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={34}
                  outerRadius={48}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {TODAYS_SUMMARY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-black text-slate-900 leading-none">48</span>
              <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                Samples
              </span>
            </div>
          </div>

          {/* Legend List */}
          <div className="space-y-2 flex-1 min-w-0 text-xs">
            {TODAYS_SUMMARY_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium truncate text-[11px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0 text-xs">
                  {item.value} ({item.percent})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Alerts Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
              Urgent Attention
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
            {LABORATORY_ALERTS.length} Alerts
          </span>
        </div>

        <div className="space-y-2">
          {LABORATORY_ALERTS.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                if (alert.severity === 'critical') onNavigateTab?.('results');
                else if (alert.severity === 'warning') onNavigateTab?.('tests');
                else if (alert.severity === 'maintenance') onNavigateTab?.('settings');
              }}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                <span className="text-[10px] font-black text-rose-600 bg-rose-100/60 px-1.5 py-0.2 rounded-md">
                  {alert.count}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{alert.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Telemetry */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600" />
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
              Analyzer Telemetry
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab?.('settings')}
            className="text-[11px] font-bold text-cyan-600 hover:underline cursor-pointer"
          >
            QC Logs
          </button>
        </div>

        <div className="space-y-2.5">
          {EQUIPMENT_STATUS.map((eq) => (
            <div key={eq.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <div className="font-bold text-slate-800 leading-tight">{eq.name}</div>
                <div className="text-[10px] text-slate-400">{eq.type}</div>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                    eq.status === 'Ready'
                      ? 'bg-emerald-100 text-emerald-800'
                      : eq.status === 'Running'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {eq.status}
                </span>
                <div className="text-[9px] text-slate-400 mt-0.5">QC: {eq.health}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <LabPageShell
      banner={bannerContent}
      kpis={kpisContent}
      rightPanel={rightPanelContent}
    >
      {/* ── ROW 1: Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: Sample Processing Overview */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
                Sample Processing (Last 7 Days)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/80">
              Live Feed
            </span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PROCESSING_OVERVIEW_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="inProcess" name="In Process" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Test Type Distribution */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
              Test Distribution by Bench
            </h3>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={TEST_TYPE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {TEST_TYPE_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 text-xs">
              {TEST_TYPE_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.value} ({item.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Recent Laboratory Orders Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-cyan-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Active Laboratory Orders
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab?.('tests')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Test Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {EXACT_SCREENSHOT_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">
                    {order.orderId}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{order.patientName}</div>
                    <div className="text-[10px] text-slate-400">{order.patientId} • {order.patientRoom}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {order.testName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {order.department}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        order.priority === 'High'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700'
                          : order.status === 'Abnormal'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onOpenEnterResult?.(order) || onNavigateTab?.('results')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 text-cyan-700 hover:text-cyan-800 font-bold text-[11px] transition cursor-pointer"
                    >
                      Process Result
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LabPageShell>
  );
}

export default DashboardPage;
