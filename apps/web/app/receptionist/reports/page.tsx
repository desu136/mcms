'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  Receipt,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  FileText,
  DollarSign,
  Activity,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import {
  REPORTS_KPIS,
  PATIENT_REG_SUMMARY_TABLE,
  APPOINTMENT_SUMMARY_TABLE,
  VISIT_TYPES_REPORT_DONUT,
  PAYMENT_METHODS_REPORT_DONUT,
  RECENT_REGISTRATIONS_REPORT,
  RECENT_PAYMENTS_REPORT,
} from '../../../components/receptionist/receptionistMockData';

export default function ReceptionistReportsPage() {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Registration' | 'Appointments' | 'Queue' | 'Billing' | 'Patients' | 'Custom'>('Overview');
  const [period, setPeriod] = useState<'Today' | 'This Week' | 'This Month' | 'Custom'>('This Week');
  const [startDate, setStartDate] = useState('2026-10-13');
  const [endDate, setEndDate] = useState('2026-10-19');

  return (
    <ReceptionistPageShell
      banner={
        <ReceptionistBanner
          title="Reports"
          subtitle="Generate and view reports for registration, appointments, queue, billing and other clinic activities."
          icon={BarChart3}
          actionElement={
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Generate Report
            </button>
          }
        />
      }
      subnav={
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto text-xs font-bold">
          {[
            { id: 'Overview', label: 'Overview' },
            { id: 'Registration', label: 'Patient Registration' },
            { id: 'Appointments', label: 'Appointments' },
            { id: 'Queue', label: 'Queue & Check-in' },
            { id: 'Billing', label: 'Billing & Payments' },
            { id: 'Patients', label: 'Patients' },
            { id: 'Custom', label: 'Custom Report' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      }
      kpis={
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {REPORTS_KPIS.map((kpi, idx) => (
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
      {/* ─── Row 1: Report Period Filter | Patient Reg Summary | Appointment Summary ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Report Period Filter Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Report Period</h3>
            </div>

            {/* Period Pills */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 text-[11px] font-bold text-center mb-3">
              {(['Today', 'This Week', 'This Month', 'Custom'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`py-1 rounded-lg transition-colors ${
                    period === p ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Department</label>
                <select className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs">
                  <option>All Departments</option>
                  <option>General</option>
                  <option>Internal Medicine</option>
                  <option>Gynecology</option>
                  <option>Pediatrics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Doctor</label>
                <select className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs">
                  <option>All Doctors</option>
                  <option>Dr. Tadesse</option>
                  <option>Dr. Sara</option>
                  <option>Dr. Mekonnen</option>
                  <option>Dr. Abebe</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Generate Report
          </button>
        </div>

        {/* Patient Registration Summary Table */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Patient Registration Summary</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                View Details
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">New Patients</th>
                    <th className="pb-2 font-medium">Total Patients</th>
                    <th className="pb-2 font-medium">Male</th>
                    <th className="pb-2 font-medium">Female</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PATIENT_REG_SUMMARY_TABLE.map((row) => (
                    <tr key={row.date} className="hover:bg-slate-50/70">
                      <td className="py-1.5 font-medium text-slate-600">{row.date}</td>
                      <td className="py-1.5 font-bold text-blue-600">{row.newPatients}</td>
                      <td className="py-1.5 text-slate-800 font-semibold">{row.totalPatients}</td>
                      <td className="py-1.5 text-slate-600">{row.male}</td>
                      <td className="py-1.5 text-slate-600">{row.female}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-slate-200 bg-slate-50/50">
                    <td className="py-2 text-slate-800">Total</td>
                    <td className="py-2 text-blue-600">156</td>
                    <td className="py-2 text-slate-400">—</td>
                    <td className="py-2 text-slate-400">—</td>
                    <td className="py-2 text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Appointment Summary Table */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Appointment Summary</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                View Details
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Completed</th>
                    <th className="pb-2 font-medium">Cancelled</th>
                    <th className="pb-2 font-medium">No Show</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {APPOINTMENT_SUMMARY_TABLE.map((row) => (
                    <tr key={row.type} className="hover:bg-slate-50/70">
                      <td className="py-2 font-semibold text-slate-800">{row.type}</td>
                      <td className="py-2 font-bold text-blue-600">{row.total}</td>
                      <td className="py-2 text-emerald-600 font-medium">{row.completed}</td>
                      <td className="py-2 text-rose-500 font-medium">{row.cancelled}</td>
                      <td className="py-2 text-amber-600 font-medium">{row.noShow}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-slate-200 bg-slate-50/50">
                    <td className="py-2 text-slate-800">Total</td>
                    <td className="py-2 text-blue-600">324</td>
                    <td className="py-2 text-emerald-600">295</td>
                    <td className="py-2 text-rose-500">20</td>
                    <td className="py-2 text-amber-600">9</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Visit Types Donut | Queue Performance | Payment Methods Donut ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Patient Visit Types Donut */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Patient Visit Types</h3>
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

          <div className="space-y-1.5 pt-1">
            {VISIT_TYPES_REPORT_DONUT.map((v) => (
              <div key={v.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="text-slate-600 font-medium">{v.name}</span>
                </div>
                <div className="font-bold text-slate-800">
                  {v.percent}% <span className="font-normal text-slate-400">({v.value})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Performance */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Queue Performance</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Total Check-ins</span>
              <span className="font-black text-slate-900 text-sm">298</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-800">
              <span className="font-medium">Average Waiting Time</span>
              <span className="font-black text-amber-900 text-sm">18 min</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-800">
              <span className="font-medium">Average Consultation Time</span>
              <span className="font-black text-emerald-900 text-sm">12 min</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-rose-800">
              <span className="font-medium">Peak Waiting Time</span>
              <span className="font-black text-rose-900 text-sm">45 min</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Donut */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Payment Methods</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
              View Details
            </span>
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
              <span className="text-xs font-black text-slate-900 leading-tight">ETB 124,580</span>
              <span className="text-[10px] font-semibold text-slate-400">Total Revenue</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {PAYMENT_METHODS_REPORT_DONUT.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-600 font-medium">{p.name}</span>
                </div>
                <div className="font-bold text-slate-800">
                  {p.percent}% <span className="font-normal text-slate-400">({p.value})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Row 3: Recent Registrations | Recent Payments | Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Recent Registrations</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
              View All
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2 font-medium">Date &amp; Time</th>
                  <th className="pb-2 font-medium">Patient Name</th>
                  <th className="pb-2 font-medium">Age</th>
                  <th className="pb-2 font-medium">Gender</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2 font-medium">Doctor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_REGISTRATIONS_REPORT.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2 text-slate-400 text-[11px] whitespace-nowrap">{row.time}</td>
                    <td className="py-2 font-bold text-slate-800 whitespace-nowrap">{row.name}</td>
                    <td className="py-2 text-slate-600">{row.age}</td>
                    <td className="py-2 text-slate-600">{row.gender}</td>
                    <td className="py-2 text-slate-600 whitespace-nowrap">{row.phone}</td>
                    <td className="py-2 text-slate-700 whitespace-nowrap">{row.doctor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Recent Payments</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
              View All
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2 font-medium">Date &amp; Time</th>
                  <th className="pb-2 font-medium">Invoice #</th>
                  <th className="pb-2 font-medium">Patient Name</th>
                  <th className="pb-2 font-medium">Amount (ETB)</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_PAYMENTS_REPORT.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2 text-slate-400 text-[11px] whitespace-nowrap">{row.time}</td>
                    <td className="py-2 font-bold text-blue-600">{row.invoice}</td>
                    <td className="py-2 font-bold text-slate-800 whitespace-nowrap">{row.name}</td>
                    <td className="py-2 font-semibold text-slate-900">{row.amount}</td>
                    <td className="py-2 text-slate-600">{row.method}</td>
                    <td className="py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-800">Quick Actions</div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">Registration Report</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">Appointment Report</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">Queue Report</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <Receipt className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">Billing Report</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">Patient List Report</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-700">Export to Excel</span>
            </button>
          </div>
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

