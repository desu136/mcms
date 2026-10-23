import React, { useState } from 'react';
import {
  CalendarDays,
  Users,
  Pill,
  FlaskConical,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Heart,
  Stethoscope,
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
} from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';

export interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
}

export function DashboardPage({ onNavigateTab }: DashboardPageProps) {
  const currentPatient = INITIAL_PATIENTS[0]!;
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
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
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Stethoscope className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
            Welcome Back, {CURRENT_DOCTOR.name}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium leading-tight">
            Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>

      {/* Date Card */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <div className="text-right">
          <div className="text-[11px] font-bold text-slate-800 tracking-tight">Oct 19, 2026</div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">Monday</div>
        </div>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Today's Appointments"
        value={9}
        icon={Users}
        color="blue"
        change={{ value: '+2', trend: 'up', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Patients Seen Today"
        value={7}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '+3', trend: 'up', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Pending Prescriptions"
        value={4}
        icon={Pill}
        color="purple"
        change={{ value: '-2', trend: 'down', label: 'vs. yesterday' }}
      />
      <DoctorStatCard
        title="Lab Results Pending"
        value={6}
        icon={FlaskConical}
        color="orange"
        change={{ value: '+1', trend: 'up', label: 'vs. yesterday' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Quick Actions Card with vibrant blue header */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-blue-600 px-3 py-2 flex items-center gap-2 text-white">
          <Zap className="w-3.5 h-3.5 text-white" />
          <h3 className="text-[11px] font-bold text-white tracking-wide">Quick Actions</h3>
        </div>
        <div className="p-2.5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigateTab?.('appointments')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">View Appointments</span>
          </button>

          <button
            onClick={() => setPrescriptionModalOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center cursor-pointer group"
          >
            <Pill className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Add Prescription</span>
          </button>

          <button
            onClick={() => setLabModalOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 transition-all text-center cursor-pointer group"
          >
            <FlaskConical className="w-4 h-4 text-orange-500 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Order Lab Test</span>
          </button>

          <button
            onClick={() => onNavigateTab?.('medical-records')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">View Patient Records</span>
          </button>
        </div>
      </div>

      {/* Current Patient Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-[11px] font-bold text-slate-800">Current Patient</h3>
          </div>
          <button
            onClick={() => handleOpenPatient(currentPatient)}
            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            View Record
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2.5">
          <img
            src={currentPatient.avatar}
            alt={currentPatient.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-black text-slate-900">{currentPatient.name}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                In Consultation
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">{currentPatient.pid}</p>
          </div>
        </div>

        <div className="mt-2 space-y-1.5 text-[10px]">
          {[
            { label: 'Age / Gender', value: `${currentPatient.age}y / ${currentPatient.gender}` },
            { label: 'Phone', value: currentPatient.phone },
            { label: 'Department', value: currentPatient.department },
            { label: 'Visit Type', value: 'Follow-up Visit' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">{label}</span>
              <span className="font-bold text-slate-700 text-right max-w-[55%] truncate">{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleOpenPatient(currentPatient)}
          className="mt-2 w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          View Full Profile
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-[11px] font-bold text-slate-800">Upcoming Appointments</h3>
          </div>
          <button
            onClick={() => onNavigateTab?.('appointments')}
            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="mt-1.5 space-y-1.5">
          {[
            { time: '11:00 AM', name: 'Lidya Kebede', reason: 'Follow-up Visit', status: 'Upcoming' },
            { time: '01:00 PM', name: 'Samuel Girma', reason: 'Consultation', status: 'Upcoming' },
            { time: '02:00 PM', name: 'Betlehem Abebe', reason: 'Consultation', status: 'Upcoming' },
            { time: '03:00 PM', name: 'Daniel Wondimu', reason: 'Follow-up Visit', status: 'Upcoming' },
          ].map(({ time, name, reason, status }) => (
            <div key={name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-[10px] font-bold text-slate-500 w-12 shrink-0">{time}</div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-800 truncate">{name}</div>
                  <div className="text-[9px] text-slate-400 truncate">{reason}</div>
                </div>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Mini Calendar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-slate-800">October 2026</div>
          <div className="flex items-center gap-1 text-slate-400">
            <button className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
          {[
            null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
            22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
          ].map((d, i) =>
            d === null ? (
              <span key={i} />
            ) : d === 19 ? (
              <button
                key={d}
                onClick={() => setCalendarSelectedDay(19)}
                className="py-1 rounded-full bg-blue-600 text-white font-bold text-[11px] cursor-pointer"
              >
                {d}
              </button>
            ) : (
              <button
                key={d}
                onClick={() => setCalendarSelectedDay(d)}
                className={`py-1 rounded-full font-medium text-[11px] cursor-pointer transition-colors ${
                  calendarSelectedDay === d ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            )
          )}
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
        rightPanelWidth="lg:w-[320px] xl:w-[360px] 2xl:w-[380px]"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          {/* Column 1: Today's Schedule & Motivational Banner */}
          <div className="space-y-4">
            {/* Today's Schedule Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Today&apos;s Schedule</h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('appointments')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {TODAY_SCHEDULE.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const match = INITIAL_PATIENTS.find((p) => p.name === item.patientName);
                      if (match) handleOpenPatient(match);
                    }}
                    className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-slate-500 w-24 shrink-0">
                        {item.time}
                      </span>
                      <img
                        src={item.avatar}
                        alt={item.patientName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {item.patientName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{item.reason}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden xl:inline-block text-[10px] font-medium text-slate-500">
                        {item.department}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : item.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                        }`}
                      >
                        {item.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Banner Card */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/80 border border-blue-100/70 flex items-center justify-between gap-3 shadow-2xs">
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

          {/* Column 2: Patient Overview Chart & Recent Patients */}
          <div className="space-y-4">
            {/* Patient Overview Line Chart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-3.5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Patient Overview</h3>
                </div>

                <div className="flex items-center gap-4">
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E6BFF]" />
                      <span>New</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00D09C]" />
                      <span>Returning</span>
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

              <div className="h-44 w-full">
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

            {/* Recent Patients Table Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Recent Patients</h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('patients')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                      <th className="py-2 px-3.5">Name</th>
                      <th className="py-2 px-3.5">Age</th>
                      <th className="py-2 px-3.5">Visit Type</th>
                      <th className="py-2 px-3.5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {INITIAL_PATIENTS.slice(0, 5).map((patient) => (
                      <tr
                        key={patient.id}
                        onClick={() => handleOpenPatient(patient)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-2 px-3.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="text-[11px] font-bold text-slate-800">{patient.name}</div>
                              <div className="text-[10px] text-slate-400">{patient.pid}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3.5 text-[11px] font-semibold text-slate-600">
                          {patient.age}y • {patient.gender}
                        </td>
                        <td className="py-2 px-3.5">
                          <span className="text-[11px] font-medium text-slate-700">{patient.lastVisitReason}</span>
                        </td>
                        <td className="py-2 px-3.5 text-[11px] font-medium text-slate-500">{patient.lastVisit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DoctorPageShell>

      {/* Patient Drawer & Modals */}
      <DoctorPatientDrawer
        patient={selectedPatient}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />
      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        defaultPatientId="p-1"
      />
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        defaultPatientId="p-1"
      />
    </>
  );
}
export default DashboardPage;
