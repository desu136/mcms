import React from 'react';
import {
  FileBarChart2,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
  Printer,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  REPORTS_KPI_STATS,
  TEST_VOLUME_TREND_DATA,
  TEST_TYPE_DISTRIBUTION_DATA,
  TURNAROUND_TIME_DATA,
  RECENT_TEST_REPORTS,
} from '../../components/lab/reportsMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function ReportsPage() {
  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Laboratory Analytics & Diagnostic Reports
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Comprehensive throughput metrics, analytical turnaround time (TAT), and volume logs.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Exporting comprehensive lab analytics report to CSV...')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Tests Performed" value={REPORTS_KPI_STATS.totalTestsPerformed.value} change={{ change: REPORTS_KPI_STATS.totalTestsPerformed.change, trend: 'up' }} color="blue" />
      <LabStatCard title="Avg Turnaround (TAT)" value={REPORTS_KPI_STATS.avgTurnaroundTime.value} change={{ change: REPORTS_KPI_STATS.avgTurnaroundTime.change, trend: 'down' }} color="emerald" />
      <LabStatCard title="Abnormal Results" value={REPORTS_KPI_STATS.abnormalResults.value} color="rose" />
      <LabStatCard title="Samples Processed" value={REPORTS_KPI_STATS.samplesProcessed.value} color="cyan" />
      <LabStatCard title="Result Release Rate" value={REPORTS_KPI_STATS.resultReleaseRate.value} change={{ change: REPORTS_KPI_STATS.resultReleaseRate.change, trend: 'up' }} color="amber" />
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent}>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Test Volume Trend Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Weekly Test Volume by Bench
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/80">
              Past 7 Days
            </span>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TEST_VOLUME_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line type="monotone" dataKey="Hematology" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Biochemistry" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Microbiology" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Turnaround Time Benchmarks */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Turnaround Time (TAT) by Department
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
              Benchmark &lt; 4 hrs
            </span>
          </div>

          <div className="space-y-2.5 py-1">
            {TURNAROUND_TIME_DATA.map((t) => (
              <div key={t.department} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">{t.department}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-cyan-700">{t.tat}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      t.status === 'On Target' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Diagnostic Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Generated Official Test Reports
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Total: {RECENT_TEST_REPORTS.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Test</th>
                <th className="py-2.5 px-3">Result Finding</th>
                <th className="py-2.5 px-3">Date Released</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_TEST_REPORTS.map((rep) => (
                <tr key={rep.reportId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">{rep.reportId}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{rep.patientName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{rep.testName}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        rep.resultStatus === 'Normal'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {rep.resultStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{rep.date}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => alert(`Printing report ${rep.reportId}...`)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-cyan-600 transition cursor-pointer"
                      title="Print Report"
                    >
                      <Printer className="w-4 h-4" />
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

export default ReportsPage;
