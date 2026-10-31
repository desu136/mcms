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
import DoctorPageShell from '../../components/doctor/DoctorPageShell';
import DoctorStatCard from '../../components/doctor/DoctorStatCard';

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

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Stethoscope className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Welcome Back, {CURRENT_DOCTOR.name}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Here&apos;s what&apos;s happening with your patients and appointments today.
          </p>
        </div>
      </div>

      {/* Date Card */}
      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs self-start md:self-auto">
        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="text-right">
          <div className="text-xs font-bold text-slate-800 tracking-tight">Oct 19, 2026</div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">Monday</div>
        </div>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-4 gap-2 sm:gap-2.5 xl:gap-3">
      <DoctorStatCard
        title="Today's Appointments"
        value={9}
        color="blue"
        change={{ value: '+2', trend: 'up', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Patients Seen Today"
        value={7}
        color="emerald"
        change={{ value: '+3', trend: 'up', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Pending Prescriptions"
        value={4}
        color="purple"
        change={{ value: '-2', trend: 'down', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Lab Results Pending"
        value={6}
        color="orange"
        change={{ value: '+1', trend: 'up', label: 'vs. yesterday' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Quick Actions Card — matching design with blue header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-blue-600 px-4 py-3 flex items-center gap-2 text-white">
          <Zap className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold text-white tracking-wide">Quick Actions</h3>
        </div>
        <div className="p-3.5 grid grid-cols-2 gap-2.5">
          {[
            { icon: CalendarDays, label: 'View Appointments',  href: '/doctor/appointments' },
            { icon: Pill,         label: 'Add Prescription',   href: null },
            { icon: FlaskConical, label: 'Order Lab Test',     href: null },
            { icon: FileText,     label: 'View Patient Records',href: '/doctor/medical-records' },
          ].map(({ icon: Icon, label, href }) =>
            href ? (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group"
              >
                <Icon className="w-5 h-5 text-blue-600 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-bold text-slate-700 leading-tight">{label}</span>
              </Link>
            ) : (
              <button
                key={label}
                onClick={() => label.includes('Prescription') ? setPrescriptionModalOpen(true) : setLabModalOpen(true)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center cursor-pointer group"
              >
                <Icon className="w-5 h-5 text-blue-600 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-bold text-slate-700 leading-tight">{label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Current Patient Card — matching design layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Current Patient</h3>
          </div>
          <button onClick={() => handleOpenPatient(currentPatient)} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">View Record</button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <img src={currentPatient.avatar} alt={currentPatient.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900">{currentPatient.name}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">In Consultation</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">{currentPatient.pid}</p>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-[11px]">
          {[
            { label: 'Age / Gender', value: `${currentPatient.age} years / ${currentPatient.gender}` },
            { label: 'Phone',        value: currentPatient.phone },
            { label: 'Department',   value: currentPatient.department },
            { label: 'Visit Type',   value: 'Follow-up Visit' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">{label}</span>
              <span className="font-bold text-slate-800">{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleOpenPatient(currentPatient)}
          className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          View Full Profile
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Upcoming Appointments</h3>
          </div>
          <Link href="/doctor/appointments" className="text-[11px] font-bold text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="mt-2 space-y-2.5">
          {[
            { time: '11:00 AM', name: 'Lidya Kebede',    reason: 'Follow-up Visit', status: 'Upcoming' },
            { time: '01:00 PM', name: 'Samuel Girma',    reason: 'Consultation',    status: 'Upcoming' },
            { time: '02:00 PM', name: 'Betlehem Abebe',  reason: 'Consultation',    status: 'Upcoming' },
            { time: '03:00 PM', name: 'Daniel Wondimu',  reason: 'Follow-up Visit', status: 'Upcoming' },
          ].map(({ time, name, reason, status }) => (
            <div key={name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="text-[10px] font-bold text-slate-500 w-14 shrink-0">{time}</div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">{name}</div>
                  <div className="text-[10px] text-slate-400">{reason}</div>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 shrink-0">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Mini Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-slate-800">October 2026</div>
          <div className="flex items-center gap-1 text-slate-400">
            <button className="p-1 rounded hover:bg-slate-100 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="p-1 rounded hover:bg-slate-100 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
          {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
          {[null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d, i) => (
            d === null ? <span key={i} /> :
            d === 19 ? (
              <button key={d} onClick={() => setCalendarSelectedDay(19)} className="py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] cursor-pointer">{d}</button>
            ) : (
              <button key={d} onClick={() => setCalendarSelectedDay(d)} className={`py-1 rounded-full font-medium text-[11px] cursor-pointer transition-colors ${ calendarSelectedDay === d ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}>{d}</button>
            )
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={rightPanelContent}
        rightPanelWidth="lg:w-[320px] xl:w-[360px] 2xl:w-[390px]"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {/* Column 1: Today's Schedule & Motivational Banner */}
          <div className="space-y-5">
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
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-slate-500 w-28 sm:w-32 shrink-0">
                        {item.time}
                      </span>
                      <img
                        src={item.avatar}
                        alt={item.patientName}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {item.patientName}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">{item.reason}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="hidden xl:inline-block text-xs font-medium text-slate-500">
                        {item.department}
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
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

            {/* Motivational Banner Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/80 border border-blue-100/70 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80"
                  alt="Doctor"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0 shadow-2xs"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 tracking-tight">Better care, together</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Your dedication makes a difference. Thank you for being part of our healthcare team.
                  </div>
                </div>
              </div>
              <Heart className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
            </div>
          </div>

          {/* Column 2: Patient Overview Chart, Recent Patients, Quick Stats */}
          <div className="space-y-5">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Smile className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-800">95%</div>
                    <div className="text-[10px] font-medium text-slate-500 leading-tight">Patient Satisfaction</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-800">98%</div>
                    <div className="text-[10px] font-medium text-slate-500 leading-tight">On-time Appointments</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-800">100%</div>
                    <div className="text-[10px] font-medium text-slate-500 leading-tight">System Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DoctorPageShell>
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
    </>
  );
}
