'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  UserPlus,
  CalendarDays,
  UserCheck,
  FileText,
  CreditCard,
  Printer,
  BarChart2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Stethoscope,
  FlaskConical,
  Pill,
  HeartPulse,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';

const NewAppointmentModal = dynamic(() => import('../../components/receptionist/NewAppointmentModal'), { ssr: false });
const CheckInModal = dynamic(() => import('../../components/receptionist/CheckInModal'), { ssr: false });
import {
  DASHBOARD_KPIS,
  TODAY_DASHBOARD_APPOINTMENTS,
  PATIENT_FLOW_CHART,
  PATIENT_TYPES_DONUT,
  RECENT_REGISTRATIONS_DATA,
  CURRENT_QUEUE_ITEMS,
  TODAY_STATS_MINI,
  RECENT_BILLS_DATA,
  TODAY_MESSAGES_DATA,
} from '../../components/receptionist/receptionistMockData';

export default function ReceptionistDashboardPage() {
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Receptionist Dashboard"
            subtitle="Manage patient registration, appointments, check-ins and clinic operations."
            icon={Users}
            actionElement={
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
                <Clock className="w-3.5 h-3.5 text-blue-200" />
                <div className="text-left">
                  <div className="text-[11px] font-bold leading-none">Clinic Open</div>
                  <div className="text-[9px] text-blue-100 font-medium leading-none mt-0.5">
                    8:00 AM - 5:00 PM
                  </div>
                </div>
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {DASHBOARD_KPIS.map((kpi, idx) => (
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
        {/* ─── Row 1: Today's Appointments | Patient Flow | Patient Types ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Today's Appointments */}
        <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Today&apos;s Appointments</h2>
              </div>
              <Link
                href="/receptionist/appointments"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-1.5 font-medium">Time</th>
                    <th className="pb-1.5 font-medium">Patient Name</th>
                    <th className="pb-1.5 font-medium">Doctor</th>
                    <th className="pb-1.5 font-medium">Type</th>
                    <th className="pb-1.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TODAY_DASHBOARD_APPOINTMENTS.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 font-medium text-slate-500 whitespace-nowrap">
                        {apt.time}
                      </td>
                      <td className="py-1.5 font-bold text-slate-800 whitespace-nowrap">
                        {apt.patientName}
                      </td>
                      <td className="py-1.5 text-slate-500 whitespace-nowrap">{apt.doctor}</td>
                      <td className="py-1.5 text-slate-500 whitespace-nowrap">{apt.type}</td>
                      <td className="py-1.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.status === 'Checked In'
                              ? 'bg-emerald-100 text-emerald-700'
                              : apt.status === 'Waiting'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Patient Flow (Last 7 Days) */}
        <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Patient Flow (Last 7 Days)</h2>
              </div>
              <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1E6BFF]" />
                  Registered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Appointments
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  Checked In
                </span>
              </div>
            </div>

            <div className="h-44 sm:h-48 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PATIENT_FLOW_CHART} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 80]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="registered" fill="#1E6BFF" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="appointments" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="checkedIn" fill="#8B5CF6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Patient Types Donut Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">Patient Types</h2>
            </div>

            <div className="relative h-36 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PATIENT_TYPES_DONUT}
                    innerRadius={45}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {PATIENT_TYPES_DONUT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400">Total</span>
                <span className="text-lg font-black text-slate-900 leading-none">214</span>
              </div>
            </div>

            <div className="space-y-1 mt-1">
              {PATIENT_TYPES_DONUT.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <div className="font-bold text-slate-800">
                    {item.percent}% <span className="font-normal text-slate-400">({item.value})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Recent Registrations | Queue / Check-in Status | Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Recent Patient Registrations */}
        <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Recent Patient Registrations</h2>
              </div>
              <Link
                href="/receptionist/registration"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-1.5 font-medium">Time</th>
                    <th className="pb-1.5 font-medium">Patient Name</th>
                    <th className="pb-1.5 font-medium">Phone</th>
                    <th className="pb-1.5 font-medium">Gender</th>
                    <th className="pb-1.5 font-medium">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_REGISTRATIONS_DATA.map((reg, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 font-medium text-slate-500 whitespace-nowrap">
                        {reg.time}
                      </td>
                      <td className="py-1.5 font-bold text-slate-800 whitespace-nowrap">
                        {reg.patientName}
                      </td>
                      <td className="py-1.5 text-slate-500 whitespace-nowrap">{reg.phone}</td>
                      <td className="py-1.5 text-slate-500 whitespace-nowrap">{reg.gender}</td>
                      <td className="py-1.5 font-semibold text-slate-700 whitespace-nowrap">
                        {reg.age}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Queue / Check-in Status */}
        <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Queue / Check-in Status</h2>
              </div>
              <Link
                href="/receptionist/queue"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            {/* 3 mini status badges */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-amber-700 leading-tight">Waiting</div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">7</div>
                  <div className="text-[9px] text-slate-400">Patients</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-blue-700 leading-tight">In Consult</div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">6</div>
                  <div className="text-[9px] text-slate-400">Patients</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-emerald-700 leading-tight">Completed</div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">15</div>
                  <div className="text-[9px] text-slate-400">Today</div>
                </div>
              </div>
            </div>

            {/* Current Queue Table */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Current Queue
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-1.5 font-medium">#</th>
                      <th className="pb-1.5 font-medium">Patient Name</th>
                      <th className="pb-1.5 font-medium">Type</th>
                      <th className="pb-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CURRENT_QUEUE_ITEMS.map((item) => (
                      <tr key={item.queueNumber} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-1.5 font-bold text-blue-600">{item.queueNumber}</td>
                        <td className="py-1.5 font-semibold text-slate-800">{item.patientName}</td>
                        <td className="py-1.5 text-slate-500">{item.type}</td>
                        <td className="py-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Checked In'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'Waiting'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (2x4 Grid) */}
        <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/receptionist/registration"
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Register Patient
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Book Appt
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCheckInModalOpen(true)}
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Check In
                </span>
              </button>

              <Link
                href="/receptionist/billing"
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Create Bill
                </span>
              </Link>

              <Link
                href="/receptionist/billing"
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Payment
                </span>
              </Link>

              <Link
                href="/receptionist/patients"
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Patients
                </span>
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Print Queue
                </span>
              </button>

              <Link
                href="/receptionist/reports"
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
                  Reports
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Today's Statistics | Recent Bills | Today's Messages ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Today's Statistics */}
        <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">Today&apos;s Statistics</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TODAY_STATS_MINI.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between"
                >
                  <div className="text-[10px] font-semibold text-slate-500">{stat.label}</div>
                  <div className="text-xl font-black text-slate-900 my-0.5">{stat.value}</div>
                  <div
                    className={`flex items-center justify-center gap-0.5 text-[9px] font-bold ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-emerald-600'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Recent Bills</h2>
              </div>
              <Link
                href="/receptionist/billing"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-1.5 font-medium">Time</th>
                    <th className="pb-1.5 font-medium">Patient Name</th>
                    <th className="pb-1.5 font-medium">Amount</th>
                    <th className="pb-1.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_BILLS_DATA.map((bill, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 font-medium text-slate-500 whitespace-nowrap">
                        {bill.time}
                      </td>
                      <td className="py-1.5 font-bold text-slate-800 whitespace-nowrap">
                        {bill.patientName}
                      </td>
                      <td className="py-1.5 font-semibold text-slate-800 whitespace-nowrap">
                        {bill.amount}
                      </td>
                      <td className="py-1.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bill.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Today's Messages */}
        <div className="lg:col-span-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Today&apos;s Messages</h2>
              </div>
              <Link
                href="/receptionist/messages"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {TODAY_MESSAGES_DATA.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div
                    className={`w-6 h-6 rounded-full ${msg.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}
                  >
                    {msg.sender.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">{msg.sender}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      </ReceptionistPageShell>

      {/* Modals */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
        />
      )}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
        />
      )}
    </>
  );
}

