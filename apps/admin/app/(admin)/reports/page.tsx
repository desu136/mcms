'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Calendar,
  FlaskConical,
  DollarSign,
  Clock,
  MoreHorizontal,
  Download,
  Plus,
  ChevronRight,
  FileText,
  BarChart2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PageHeader, AdminCard, TabBar } from '../components/AdminUI';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/StatCard';

// NOTE: All data below is from static fixtures.
// Backend endpoints required:
// - GET /api/v1/reports (list reports)
// - POST /api/v1/reports/generate (generate report)
// - GET /api/v1/reports/stats (aggregate stats)
// These will be wired once the backend exposes these report endpoints.

const TABS = ['Overview', 'Patient Reports', 'Appointment Reports', 'Department Reports', 'Laboratory Reports', 'Billing & Revenue', 'Staff Reports'];

const patientTrendData = [
  { date: 'Oct 13', totalVisits: 65, newPatients: 18 },
  { date: 'Oct 14', totalVisits: 95, newPatients: 28 },
  { date: 'Oct 15', totalVisits: 100, newPatients: 32 },
  { date: 'Oct 16', totalVisits: 108, newPatients: 35 },
  { date: 'Oct 17', totalVisits: 120, newPatients: 40 },
  { date: 'Oct 18', totalVisits: 145, newPatients: 52 },
  { date: 'Oct 19', totalVisits: 118, newPatients: 45 },
];

const deptData = [
  { name: 'General Medicine', value: 34, color: '#2979FF' },
  { name: 'Pediatrics', value: 18, color: '#00C853' },
  { name: 'Gynecology & Obstetrics', value: 14, color: '#FF9100' },
  { name: 'Laboratory', value: 12, color: '#AA00FF' },
  { name: 'Pharmacy', value: 9, color: '#00BCD4' },
  { name: 'Others', value: 13, color: '#9E9E9E' },
];

const revenueData = [
  { date: 'Oct 13', payments: 3200, insurance: 1800 },
  { date: 'Oct 14', payments: 4500, insurance: 2200 },
  { date: 'Oct 15', payments: 3800, insurance: 2000 },
  { date: 'Oct 16', payments: 5200, insurance: 3100 },
  { date: 'Oct 17', payments: 4800, insurance: 2800 },
  { date: 'Oct 18', payments: 6100, insurance: 3500 },
  { date: 'Oct 19', payments: 5200, insurance: 3000 },
];

const recentReports = [
  { name: 'Patient Visit Report', type: 'Patient', dateRange: 'Oct 12, 2026 – Oct 18, 2026', generatedBy: 'Desu Kasaye', status: 'Completed' },
  { name: 'Appointment Statistics', type: 'Appointment', dateRange: 'Oct 12, 2026 – Oct 18, 2026', generatedBy: 'Aster Mulu', status: 'Completed' },
  { name: 'Department Performance', type: 'Department', dateRange: 'Oct 01, 2026 – Oct 18, 2026', generatedBy: 'Lidya Kebede', status: 'Completed' },
  { name: 'Laboratory Report', type: 'Laboratory', dateRange: 'Oct 10, 2026 – Oct 19, 2026', generatedBy: 'Getachew Tadesse', status: 'Completed' },
  { name: 'Billing & Revenue Report', type: 'Financial', dateRange: 'Oct 01, 2026 – Oct 19, 2026', generatedBy: 'Samuel Girma', status: 'Completed' },
  { name: 'Staff Activity Report', type: 'Staff', dateRange: 'Oct 12, 2026 – Oct 18, 2026', generatedBy: 'Betlehem Abebe', status: 'Completed' },
  { name: 'Patient Demographics', type: 'Patient', dateRange: 'Oct 01, 2026 – Oct 19, 2026', generatedBy: 'Admin', status: 'Completed' },
  { name: 'Queue Performance', type: 'Operational', dateRange: 'Oct 12, 2026 – Oct 18, 2026', generatedBy: 'Getachew Tadesse', status: 'Completed' },
];

const reportCategories = [
  { icon: Users, label: 'Patient Reports', desc: 'Visits, demographics, patient history', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Calendar, label: 'Appointment Reports', desc: 'Schedules, cancellations, check-ins', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: BarChart2, label: 'Department Reports', desc: 'Department performance and statistics', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: FlaskConical, label: 'Laboratory Reports', desc: 'Tests, results, and turnaround time', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: DollarSign, label: 'Billing & Revenue', desc: 'Payments, invoices, revenue', color: 'text-teal-500', bg: 'bg-teal-50' },
  { icon: Users, label: 'Staff Reports', desc: 'Activity, performance, attendance', color: 'text-pink-500', bg: 'bg-pink-50' },
];

const recentActivity = [
  { icon: FileText, bg: 'bg-blue-50', color: 'text-blue-500', label: 'Patient visit report generated', sub: 'By Desu Kasaye', time: '2 hours ago' },
  { icon: Download, bg: 'bg-green-50', color: 'text-green-500', label: 'Revenue report exported (PDF)', sub: 'By Aster Mulu', time: '4 hours ago' },
  { icon: BarChart2, bg: 'bg-purple-50', color: 'text-purple-500', label: 'Department report generated', sub: 'By Lidya Kebede', time: '6 hours ago' },
  { icon: Calendar, bg: 'bg-orange-50', color: 'text-orange-500', label: 'Appointment statistics viewed', sub: 'By Getachew Tadesse', time: '8 hours ago' },
];

const quickActions = [
  { icon: Plus, label: 'Generate Report', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Download, label: 'Export Data', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Calendar, label: 'Schedule Report', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: FileText, label: 'View Report Templates', color: 'text-orange-500', bg: 'bg-orange-50' },
];

const typeColorMap: Record<string, string> = {
  Patient: 'info',
  Appointment: 'purple',
  Department: 'success',
  Laboratory: 'orange',
  Financial: 'teal',
  Staff: 'neutral',
  Operational: 'warning',
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Overview');

  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        icon={<BarChart3 size={20} className="text-blue-500" />}
        title="Reports"
        subtitle="View clinic activity, performance and operational reports."
        dateRange={dateStr}
        dateSubtitle="Last 7 days"
        systemStatus="online"
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard title="Total Patients" value="1,248" icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" change="12%" changeDir="up" changeLabel="vs. last 7 days" />
            <StatCard title="Total Visits" value="2,346" icon={BarChart3} iconBg="bg-green-50" iconColor="text-green-500" change="8%" changeDir="up" changeLabel="vs. last 7 days" />
            <StatCard title="Appointments" value="432" icon={Calendar} iconBg="bg-purple-50" iconColor="text-purple-500" change="15%" changeDir="up" changeLabel="vs. last 7 days" />
            <StatCard title="Laboratory Tests" value="318" icon={FlaskConical} iconBg="bg-orange-50" iconColor="text-orange-500" change="10%" changeDir="up" changeLabel="vs. last 7 days" />
            <StatCard title="Total Revenue" value="$24,680" icon={DollarSign} iconBg="bg-teal-50" iconColor="text-teal-500" change="18%" changeDir="up" changeLabel="vs. last 7 days" />
            <StatCard title="Avg. Wait Time" value="18 min" icon={Clock} iconBg="bg-pink-50" iconColor="text-pink-500" change="22%" changeDir="down" changeLabel="vs. last 7 days" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Patient Visits Trend */}
            <div className="xl:col-span-1">
              <AdminCard title="Patient Visits Trend" titleIcon={<Users size={15} className="text-blue-500" />}>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={patientTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6EEFF', fontSize: 11 }} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="totalVisits" name="Total Visits" stroke="#2979FF" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="newPatients" name="New Patients" stroke="#00C853" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </AdminCard>
            </div>

            {/* Visits by Department */}
            <div className="xl:col-span-1">
              <AdminCard title="Visits by Department" titleIcon={<BarChart2 size={15} className="text-blue-500" />}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <PieChart width={150} height={130}>
                      <Pie data={deptData} cx={70} cy={60} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                        {deptData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-sm font-bold text-gray-900">2,346</span>
                      <span className="text-[9px] text-gray-500">Total Visits</span>
                    </div>
                  </div>
                  <div className="w-full space-y-1 mt-1">
                    {deptData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-gray-600 truncate max-w-[120px]">{d.name}</span>
                        </div>
                        <span className="text-gray-400">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminCard>
            </div>

            {/* Revenue Overview */}
            <div className="xl:col-span-1">
              <AdminCard title="Revenue Overview" titleIcon={<DollarSign size={15} className="text-blue-500" />}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={8} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E6EEFF', fontSize: 11 }} formatter={(v) => `$${Number(v ?? 0).toLocaleString()}`} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="payments" name="Payments" fill="#2979FF" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="insurance" name="Insurance" fill="#00C853" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AdminCard>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Recent Reports Table */}
            <div className="xl:col-span-2">
              <AdminCard
                title="Recent Reports"
                titleIcon={<FileText size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left font-medium text-gray-500 px-5 py-2.5">Report Name</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Type</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Date Range</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Generated By</th>
                        <th className="text-left font-medium text-gray-500 px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.map((r) => (
                        <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2">
                              <FileText size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="font-medium text-gray-800 truncate max-w-[150px]">{r.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusBadge
                              variant={(typeColorMap[r.type] as any) ?? 'neutral'}
                              label={r.type}
                            />
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.dateRange}</td>
                          <td className="px-3 py-2.5 text-gray-600">{r.generatedBy}</td>
                          <td className="px-3 py-2.5">
                            <StatusBadge variant="success" label={r.status} />
                          </td>
                          <td className="px-3 py-2.5">
                            <button className="text-gray-300 hover:text-gray-500 transition">
                              <MoreHorizontal size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </div>

            {/* Right: Report Categories + Quick Actions + Recent Activity */}
            <div className="space-y-4">
              {/* Report Categories */}
              <AdminCard title="Report Categories" titleIcon={<BarChart3 size={15} className="text-blue-500" />}>
                <div className="space-y-1.5">
                  {reportCategories.map(({ icon: Icon, label, desc, bg, color }) => (
                    <button
                      key={label}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon size={13} className={color} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-gray-800">{label}</p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[140px]">{desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-gray-400 group-hover:text-gray-600 transition" />
                    </button>
                  ))}
                </div>
              </AdminCard>

              {/* Quick Actions */}
              <AdminCard title="Quick Actions" titleIcon={<BarChart3 size={15} className="text-blue-500" />}>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(({ icon: Icon, label, bg, color }) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-1.5 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition group text-center"
                    >
                      <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon size={14} className={color} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-700 leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </AdminCard>

              {/* Recent Activity */}
              <AdminCard
                title="Recent Activity"
                titleIcon={<Clock size={15} className="text-blue-500" />}
                action={<button className="text-xs text-[#2979FF] font-medium hover:underline">View All</button>}
              >
                <div className="space-y-3">
                  {recentActivity.map(({ icon: Icon, bg, color, label, sub, time }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={12} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 leading-tight">{label}</p>
                        <p className="text-[10px] text-gray-500">{sub}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{time}</span>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'Overview' && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">{activeTab}</p>
            <p className="text-xs text-gray-400 mt-1">Detailed {activeTab.toLowerCase()} view coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
