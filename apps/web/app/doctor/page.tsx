'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Users,
  Pill,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Building2,
  FileText,
  Heart,
  Smile,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CURRENT_DOCTOR,
  INITIAL_PATIENTS,
  TODAY_SCHEDULE,
  PATIENT_OVERVIEW_CHART_DATA,
  PatientItem,
  AppointmentItem,
} from '../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../components/doctor/DoctorLabOrderModal';

export default function DoctorDashboardPage() {
  const currentPatient = INITIAL_PATIENTS[0]!;
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(currentPatient);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('This Week');
  const [calendarSelectedDay, setCalendarSelectedDay] = useState(19);

  const handleOpenPatient = (p: PatientItem) => {
    setSelectedPatient(p);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Welcome Banner & Date Bar ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <Stethoscope className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Welcome Back, {CURRENT_DOCTOR.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Here&apos;s what&apos;s happening with your patients and appointments today.
            </p>
          </div>
        </div>

        {/* Date Card (matching screenshot) */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs self-start md:self-auto">
          <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 tracking-tight">Oct 19, 2026</div>
            <div className="text-[11px] text-slate-400 font-medium leading-none">Monday</div>
          </div>
        </div>
      </div>

      {/* ─── 4 Top KPI Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Appointments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500">Today&apos;s Appointments</div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">9</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2 vs. yesterday</span>
          </div>
        </div>

        {/* Card 2: Patients Seen Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500">Patients Seen Today</div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">7</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3 vs. yesterday</span>
          </div>
        </div>

        {/* Card 3: Pending Prescriptions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500">Pending Prescriptions</div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">4</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-2 vs. yesterday</span>
          </div>
        </div>

        {/* Card 4: Lab Results Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500">Lab Results Pending</div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">6</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1 vs. yesterday</span>
          </div>
        </div>
      </div>

      {/* ─── Main Two-Column Dashboard Layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Left / Center Major Column (7 of 12 cols) ────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Schedule Card (Matching exact screenshot list) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Today&apos;s Schedule</h3>
              </div>
              <Link
                href="/doctor/appointments"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {TODAY_SCHEDULE.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const match = INITIAL_PATIENTS.find((p) => p.name === item.patientName);
                    if (match) handleOpenPatient(match);
                  }}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="text-xs font-semibold text-slate-500 w-32 shrink-0">
                      {item.time}
                    </span>
                    <img
                      src={item.avatar}
                      alt={item.patientName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {item.patientName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{item.reason}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
                      {item.department}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : item.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                      }`}
                    >
                      {item.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Overview Line Chart (Matching screenshot dual-line chart) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Patient Overview</h3>
              </div>

              <div className="flex items-center gap-4">
                {/* Legend */}
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E6BFF]" />
                    <span>New Patients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D09C]" />
                    <span>Returning Patients</span>
                  </div>
                </div>

                <select
                  value={chartTimeframe}
                  onChange={(e) => setChartTimeframe(e.target.value)}
                  className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none"
                >
                  <option value="This Week">This Week</option>
                  <option value="Last Week">Last Week</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PATIENT_OVERVIEW_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    domain={[0, 20]}
                    ticks={[0, 5, 10, 15, 20]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newPatients"
                    name="New Patients"
                    stroke="#1E6BFF"
                    strokeWidth={2.5}
                    dot={{ fill: '#1E6BFF', r: 3.5 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="returningPatients"
                    name="Returning Patients"
                    stroke="#00D09C"
                    strokeWidth={2.5}
                    dot={{ fill: '#00D09C', r: 3.5 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Patients Table Card (Matching screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Recent Patients</h3>
              </div>
              <Link
                href="/doctor/patients"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Age</th>
                    <th className="py-3 px-5">Visit Type</th>
                    <th className="py-3 px-5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {INITIAL_PATIENTS.slice(0, 5).map((patient, idx) => (
                    <tr
                      key={patient.id}
                      onClick={() => handleOpenPatient(patient)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={patient.avatar}
                            alt={patient.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                            {patient.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{patient.age}</td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{patient.lastVisitReason}</td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">
                        {['08:00 AM', '08:40 AM', '09:20 AM', '10:00 AM', '11:00 AM'][idx]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Footer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              Quick Stats
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-800">95%</div>
                  <div className="text-[11px] font-medium text-slate-500">Patient Satisfaction</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-800">98%</div>
                  <div className="text-[11px] font-medium text-slate-500">On-time Appointments</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-800">100%</div>
                  <div className="text-[11px] font-medium text-slate-500">System Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Banner Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/80 border border-blue-100/70 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 tracking-tight">Better care, together</div>
              <div className="text-[11px] text-slate-500">
                Your dedication makes a difference. Thank you for being part of our healthcare team.
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Sidebar / Panel Column (5 of 12 cols) ──────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions Card (2x2 grid of actions matching screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/doctor/appointments"
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                  View Appointments
                </span>
              </Link>

              <button
                onClick={() => setPrescriptionModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Pill className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                  Add Prescription
                </span>
              </button>

              <button
                onClick={() => setLabModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-orange-500 hover:bg-orange-50/40 transition-all text-left flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-orange-700">
                  Order Lab Test
                </span>
              </button>

              <Link
                href="/doctor/patients"
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-cyan-700">
                  View Patient Records
                </span>
              </Link>
            </div>
          </div>

          {/* Current Patient Card (Aster Mulu) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Current Patient</h3>
              </div>
              <button
                onClick={() => handleOpenPatient(currentPatient)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View Record
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={currentPatient.avatar}
                  alt={currentPatient.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">{currentPatient.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{currentPatient.pid}</div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                In Consultation
              </span>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Age / Gender
                </span>
                <span className="font-semibold text-slate-800">
                  {currentPatient.age} years / {currentPatient.gender}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="font-semibold text-slate-800">{currentPatient.phone}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Department
                </span>
                <span className="font-semibold text-slate-800">{currentPatient.department}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Visit Type
                </span>
                <span className="font-semibold text-slate-800">{currentPatient.lastVisitReason}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenPatient(currentPatient)}
              className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all text-center"
            >
              View Full Profile
            </button>
          </div>

          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Upcoming Appointments</h3>
              </div>
              <Link
                href="/doctor/appointments"
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { time: '11:00 AM', name: 'Lidya Kebede', reason: 'Follow-up Visit' },
                { time: '01:00 PM', name: 'Samuel Girma', reason: 'Consultation' },
                { time: '02:00 PM', name: 'Betlehem Abebe', reason: 'Consultation' },
                { time: '03:00 PM', name: 'Daniel Wondimu', reason: 'Follow-up Visit' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 w-16">{item.time}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.reason}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100">
                    Upcoming
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Calendar Card (Matching screenshot October 2026) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-800">October 2026</span>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Day numbers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <span className="py-1 text-slate-300">28</span>
              <span className="py-1 text-slate-300">29</span>
              <span className="py-1 text-slate-300">30</span>
              <span className="py-1 font-medium text-slate-700">1</span>
              <span className="py-1 font-medium text-slate-700">2</span>
              <span className="py-1 font-medium text-slate-700">3</span>
              <span className="py-1 font-medium text-slate-700">4</span>

              <span className="py-1 font-medium text-slate-700">5</span>
              <span className="py-1 font-medium text-slate-700">6</span>
              <span className="py-1 font-medium text-slate-700">7</span>
              <span className="py-1 font-medium text-slate-700">8</span>
              <span className="py-1 font-medium text-slate-700">9</span>
              <span className="py-1 font-medium text-slate-700">10</span>
              <span className="py-1 font-medium text-slate-700">11</span>

              <span className="py-1 font-medium text-slate-700">12</span>
              <span className="py-1 font-medium text-slate-700">13</span>
              <span className="py-1 font-medium text-slate-700">14</span>
              <span className="py-1 font-medium text-slate-700">15</span>
              <span className="py-1 font-medium text-slate-700">16</span>
              <span className="py-1 font-medium text-slate-700">17</span>
              <span className="py-1 font-medium text-slate-700">18</span>

              {/* Day 19 (Active highlighted day) */}
              <button
                onClick={() => setCalendarSelectedDay(19)}
                className="py-1 font-bold text-white bg-blue-600 rounded-full shadow-md shadow-blue-500/30 flex items-center justify-center mx-auto w-6 h-6"
              >
                19
              </button>
              <button
                onClick={() => setCalendarSelectedDay(20)}
                className={`py-1 font-medium ${
                  calendarSelectedDay === 20 ? 'bg-blue-100 text-blue-700 rounded-full' : 'text-slate-700'
                }`}
              >
                20
              </button>
              <button
                onClick={() => setCalendarSelectedDay(21)}
                className={`py-1 font-medium ${
                  calendarSelectedDay === 21 ? 'bg-blue-100 text-blue-700 rounded-full' : 'text-slate-700'
                }`}
              >
                21
              </button>
              <span className="py-1 font-medium text-slate-700">22</span>
              <span className="py-1 font-medium text-slate-700">23</span>
              <span className="py-1 font-medium text-slate-700">24</span>
              <span className="py-1 font-medium text-slate-700">25</span>

              <span className="py-1 font-medium text-slate-700">26</span>
              <span className="py-1 font-medium text-slate-700">27</span>
              <span className="py-1 font-medium text-slate-700">28</span>
              <span className="py-1 font-medium text-slate-700">29</span>
              <span className="py-1 font-medium text-slate-700">30</span>
              <span className="py-1 font-medium text-slate-700">31</span>
              <span className="py-1 text-slate-300">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals & Slide-over Drawers ───────────────────────────────────────── */}
      <DoctorPatientDrawer
        patient={selectedPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={(pid) => setPrescriptionModalOpen(true)}
        onOpenLabModal={(pid) => setLabModalOpen(true)}
      />

      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        defaultPatientId={selectedPatient?.id || 'p-1'}
      />

      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId={selectedPatient?.id || 'p-1'}
      />
    </div>
  );
}
