'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  X,
  Check,
  Zap,
  Tag,
  Download,
  CalendarDays,
  TestTube2,
  Users,
  LineChart,
  FileDown,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import LabStatCard from '../../../components/lab/LabStatCard';
import {
  REPORTS_KPI_STATS,
  TEST_VOLUME_TREND_DATA,
  TEST_TYPE_DISTRIBUTION_DATA,
  TURNAROUND_TIME_DATA,
  RECENT_TEST_REPORTS,
  STAFF_PERFORMANCE_DATA,
  ABNORMAL_RESULTS_SUMMARY,
  REPORT_ANALYTICS_DATA,
  RECENT_EXPORTS_DATA,
} from '../../../components/lab/reportsMockData';

export default function LabReportsPage() {
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [dateRange, setDateRange] = useState('Oct 19, 2026 - Oct 19, 2026');
  const [department, setDepartment] = useState('All Departments');
  const [testType, setTestType] = useState('All Test Types');
  const [reportType, setReportType] = useState('All Reports');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<(typeof RECENT_TEST_REPORTS)[0] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4 bg-[#F4F7FB]">
      {/* 1. Page Header matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle with Analytics/BarChart Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <BarChart2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Laboratory Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              View analytics, performance metrics, and generate detailed laboratory reports.
            </p>
          </div>
        </div>

        {/* Date Selector & + Generate Report Button */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">{calendarDate}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Tuesday</div>
            </div>
            <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setCalendarDate('Oct 18, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCalendarDate('Oct 20, 2026')}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Stat Cards - Compact & displayed at one row without icons */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
        <LabStatCard
          title="Total Tests Performed"
          value={REPORTS_KPI_STATS.totalTestsPerformed.value}
          color="cyan"
          change={REPORTS_KPI_STATS.totalTestsPerformed}
        />
        <LabStatCard
          title="Average Turnaround Time"
          value={REPORTS_KPI_STATS.avgTurnaroundTime.value}
          color="amber"
          change={REPORTS_KPI_STATS.avgTurnaroundTime}
        />
        <LabStatCard
          title="Abnormal Results"
          value={REPORTS_KPI_STATS.abnormalResults.value}
          color="rose"
          change={REPORTS_KPI_STATS.abnormalResults}
        />
        <LabStatCard
          title="Samples Processed"
          value={REPORTS_KPI_STATS.samplesProcessed.value}
          color="blue"
          change={REPORTS_KPI_STATS.samplesProcessed}
        />
        <LabStatCard
          title="Result Release Rate"
          value={REPORTS_KPI_STATS.resultReleaseRate.value}
          color="emerald"
          change={REPORTS_KPI_STATS.resultReleaseRate}
        />
      </div>

      {/* 3. Main Dashboard Layout: Left/Center Main Area (9 cols) + Right Column (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ================= LEFT / CENTER MAIN COLUMN (9 cols) ================= */}
        <div className="lg:col-span-9 space-y-4">
          {/* Section A: Charts & Turnaround Row (3 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Card 1: Test Volume Trend (5.5 cols) */}
            <div className="md:col-span-5 xl:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                    <LineChart className="w-4 h-4 text-blue-600" />
                    <span>Test Volume Trend</span>
                  </div>
                  <select className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Last 14 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>

                {/* Composed Bar + Line Chart */}
                <div className="h-48 w-full mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={TEST_VOLUME_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="Hematology" fill="#2563EB" radius={[3, 3, 0, 0]} barSize={8} />
                      <Bar dataKey="Biochemistry" fill="#06B6D4" radius={[3, 3, 0, 0]} barSize={8} />
                      <Bar dataKey="Microbiology" fill="#8B5CF6" radius={[3, 3, 0, 0]} barSize={8} />
                      <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend matching screenshot */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] font-semibold text-slate-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                  <span>Hematology</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#06B6D4]" />
                  <span>Biochemistry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" />
                  <span>Microbiology</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 rounded-full bg-[#10B981]" />
                  <span>Total Tests</span>
                </div>
              </div>
            </div>

            {/* Card 2: Test Type Distribution (3.5 cols) */}
            <div className="md:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Test Type Distribution</span>
                  </div>
                  <select className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none cursor-pointer">
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>

                {/* Donut Chart with center label */}
                <div className="relative h-40 w-full mt-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={TEST_TYPE_DISTRIBUTION_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {TEST_TYPE_DISTRIBUTION_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-extrabold text-slate-800 leading-tight">1,248</span>
                    <span className="text-[9px] font-bold text-slate-400">Total Tests</span>
                  </div>
                </div>
              </div>

              {/* Legend on right/bottom */}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                {TEST_TYPE_DISTRIBUTION_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 text-[10px]">
                      {item.percentage} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Turnaround Time (TAT) (3 cols) */}
            <div className="md:col-span-3 xl:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Turnaround Time (TAT)</span>
                  </div>
                  <select className="px-1.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none cursor-pointer">
                    <option>This Month</option>
                  </select>
                </div>

                <div className="pt-3 space-y-2.5 text-xs">
                  {TURNAROUND_TIME_DATA.map((tat) => (
                    <div key={tat.department} className="flex items-center justify-between py-1">
                      <span className="font-semibold text-slate-700 text-[11px]">{tat.department}</span>
                      <span className="font-bold text-slate-800 text-[11px]">{tat.tat}</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tat.status === 'On Target'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                        }`}
                      >
                        {tat.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center">
                Target TAT benchmark: ≤ 3.0 hrs
              </div>
            </div>
          </div>

          {/* Section B: Recent Test Reports & Staff Performance (2 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Card 1: Recent Test Reports (6 cols) */}
            <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Recent Test Reports</span>
                </div>
                <button
                  onClick={() => showToast('Opening all recent reports...')}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="pt-2 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5">Report ID</th>
                      <th className="py-2.5">Patient Name</th>
                      <th className="py-2.5">Test Name</th>
                      <th className="py-2.5">Result Status</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {RECENT_TEST_REPORTS.map((rep) => (
                      <tr key={rep.reportId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 font-semibold text-slate-700 whitespace-nowrap text-[11px]">
                          {rep.reportId}
                        </td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap text-[11px]">
                          {rep.patientName}
                        </td>
                        <td className="py-2 text-slate-600 whitespace-nowrap text-[11px]">
                          {rep.testName}
                        </td>
                        <td className="py-2 whitespace-nowrap">
                          {rep.resultStatus === 'Normal' ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              Normal
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                              Abnormal
                            </span>
                          )}
                        </td>
                        <td className="py-2 whitespace-nowrap text-[10px] text-slate-400">
                          <div>{rep.date.split(' ').slice(0, 3).join(' ')}</div>
                          <div>{rep.date.split(' ').slice(3).join(' ')}</div>
                        </td>
                        <td className="py-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => setViewingReport(rep)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 transition"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 2: Staff Performance (6 cols) */}
            <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Staff Performance</span>
                </div>
                <select className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none cursor-pointer">
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>

              <div className="pt-2 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5">Staff Name</th>
                      <th className="py-2.5">Tests Processed</th>
                      <th className="py-2.5">Accuracy</th>
                      <th className="py-2.5 text-right">Avg. TAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {STAFF_PERFORMANCE_DATA.map((staff) => (
                      <tr key={staff.name} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-800 text-[11px]">{staff.name}</div>
                              <div className="text-[9px] text-slate-400">{staff.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap text-[11px]">
                          {staff.testsProcessed}
                        </td>
                        <td className="py-2 font-bold text-emerald-600 whitespace-nowrap text-[11px]">
                          {staff.accuracy}
                        </td>
                        <td className="py-2 text-right font-semibold text-slate-700 whitespace-nowrap text-[11px]">
                          {staff.avgTat}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section C: Bottom Row (3 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Card 1: Abnormal Results Summary (4 cols) */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Abnormal Results Summary</span>
                </div>
                <button
                  onClick={() => showToast('Opening abnormal results log...')}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="pt-2 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2">Test Name</th>
                      <th className="py-2">Count</th>
                      <th className="py-2">Percentage</th>
                      <th className="py-2 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                    {ABNORMAL_RESULTS_SUMMARY.map((abn) => (
                      <tr key={abn.name} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 font-semibold text-slate-800 whitespace-nowrap">
                          {abn.name}
                        </td>
                        <td className="py-2 font-bold text-slate-700 whitespace-nowrap">
                          {abn.count}
                        </td>
                        <td className="py-2 text-slate-500 whitespace-nowrap">
                          {abn.percentage}
                        </td>
                        <td className="py-2 text-right font-bold text-rose-500 whitespace-nowrap">
                          {abn.trend}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 2: Report Analytics (4 cols) */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    <span>Report Analytics</span>
                  </div>
                  <select className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none cursor-pointer">
                    <option>Last 30 Days</option>
                  </select>
                </div>

                <div className="h-44 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REPORT_ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="department" tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#2563EB" radius={[3, 3, 0, 0]} barSize={10} name="Total Tests" />
                      <Bar dataKey="abnormal" fill="#F59E0B" radius={[3, 3, 0, 0]} barSize={10} name="Abnormal" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <span>Total Tests</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span>Abnormal</span>
                </div>
              </div>
            </div>

            {/* Card 3: Recent Exports (4 cols) */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Recent Exports</span>
                </div>
                <button
                  onClick={() => showToast('Viewing all export history...')}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="pt-2.5 space-y-2.5">
                {RECENT_EXPORTS_DATA.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-[11px] truncate">{exp.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{exp.timestamp}</div>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                      {exp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Filters & Quick Actions) (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Report Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Report Filters</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Date Range</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-[11px] truncate">{dateRange}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Immunology">Immunology</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="All Test Types">All Test Types</option>
                  <option value="CBC">CBC</option>
                  <option value="RBS">RBS</option>
                  <option value="Urine Analysis">Urine Analysis</option>
                  <option value="LFT">LFT</option>
                  <option value="KFT">KFT</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="All Reports">All Reports</option>
                  <option value="Summary Report">Summary Report</option>
                  <option value="Turnaround Time (TAT)">Turnaround Time (TAT)</option>
                  <option value="Staff Analytics">Staff Analytics</option>
                  <option value="Abnormal Results Log">Abnormal Results Log</option>
                </select>
              </div>

              <button
                onClick={() => showToast('Filters applied successfully.')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-[0.98]"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Card 2: Quick Actions (2x3 Grid) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Quick Actions</span>
            </div>

            <div className="pt-3.5 grid grid-cols-2 gap-2.5">
              {/* 1. Generate Test Report */}
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <FileText className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Generate Test Report
                </span>
              </button>

              {/* 2. Export Data */}
              <button
                onClick={() => showToast('Exporting analytics data to CSV / Excel...')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <Download className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Export Data
                </span>
              </button>

              {/* 3. Print Reports */}
              <button
                onClick={() => showToast('Printing summary reports...')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <Printer className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Print Reports
                </span>
              </button>

              {/* 4. Print Labels */}
              <button
                onClick={() => showToast('Generating specimen barcoded labels...')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <Tag className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Print Labels
                </span>
              </button>

              {/* 5. View Analytics */}
              <button
                onClick={() => showToast('Switching to detailed laboratory analytics view...')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <BarChart2 className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  View Analytics
                </span>
              </button>

              {/* 6. Schedule Report */}
              <button
                onClick={() => showToast('Opening report scheduling dialog...')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-center"
              >
                <CalendarDays className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  Schedule Report
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer Row matching screenshot */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
        <div>MCMS | Laboratory Information System | Accurate Results. Better Care.</div>
        <div>Version 1.0.0</div>
      </div>

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Generate Custom Report</h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsGenerateModalOpen(false);
                showToast('Report generated successfully and added to Recent Exports.');
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  defaultValue="Laboratory Monthly Overview (Oct 2026)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>All Departments</option>
                    <option>Hematology</option>
                    <option>Biochemistry</option>
                    <option>Microbiology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Format</label>
                  <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>PDF Document (.pdf)</option>
                    <option>Excel Spreadsheet (.xlsx)</option>
                    <option>CSV Data (.csv)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate & Export</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Detail Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Report Details</h3>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Report ID:</span>
                <span className="font-bold text-slate-800">{viewingReport.reportId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-slate-800">{viewingReport.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Test:</span>
                <span className="font-semibold text-slate-700">{viewingReport.testName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-600">{viewingReport.resultStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Generated:</span>
                <span className="text-slate-600">{viewingReport.date}</span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setViewingReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewingReport(null);
                  showToast(`Printed ${viewingReport.reportId}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

