import React, { useState } from 'react';
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
  Database,
  RefreshCw,
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

import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import NewAppointmentModal from '../../components/receptionist/NewAppointmentModal';
import CheckInModal from '../../components/receptionist/CheckInModal';
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
import { useSync } from '../../context/SyncContext';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface DashboardPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function DashboardPage({ onNavigateTab }: DashboardPageProps) {
  const { syncStatus, isOnline, triggerSync, isSyncing } = useSync();
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Receptionist Workstation"
            subtitle="Manage patient registration, appointments, check-ins, queue and billing with SQLite offline sync."
            icon={Users}
            actionElement={
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-200" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold leading-none">Clinic Open</div>
                    <div className="text-[9px] text-blue-100 font-medium leading-none mt-0.5">
                      8:00 AM - 5:00 PM
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckInModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Check In Patient
                </button>
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
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
        {/* Quick Action Station */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-xl sm:rounded-2xl p-3.5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-2">
                <span>Reception Operations Panel</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isOnline ? 'Online Synced' : 'Offline Mode'}
                </span>
              </div>
              <div className="text-[11px] text-blue-100 font-normal">
                {syncStatus.pendingOperations > 0
                  ? `${syncStatus.pendingOperations} operations waiting in local SQLite queue`
                  : 'Workstation ready. All registrations & queue tickets synced.'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('registration')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Register Patient</span>
            </button>
            <button
              onClick={() => setAppointmentModalOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => onNavigateTab('billing')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Process Bill</span>
            </button>
          </div>
        </div>

        {/* Charts & Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
          {/* Patient Flow Bar Chart */}
          <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">Weekly Patient Flow</h2>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" /> Registered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Appointments
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> Checked In
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

          {/* Patient Types Donut Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
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
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {PATIENT_TYPES_DONUT.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dual Columns: Today's Appointments & Live Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Today's Appointments Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                  Today&apos;s Appointments
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All (35)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Doctor</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TODAY_DASHBOARD_APPOINTMENTS.slice(0, 5).map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 font-mono font-bold text-slate-700">{apt.time}</td>
                      <td className="py-2 font-bold text-slate-900">{apt.patientName}</td>
                      <td className="py-2 text-slate-600">{apt.doctor}</td>
                      <td className="py-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'Checked In'
                              ? 'bg-blue-100 text-blue-700'
                              : apt.status === 'Waiting'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
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

          {/* Live Queue Overview */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                  Live Queue Waiting List
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('queue')}
                className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Queue (8)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {CURRENT_QUEUE_ITEMS.slice(0, 4).map((q) => (
                <div
                  key={q.queueNumber}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      {q.queueNumber}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{q.patientName}</div>
                      <div className="text-[10px] text-slate-400">
                        {q.type}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-blue-600 block">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Dynamic Modals */}
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

export default React.memo(DashboardPage);
