'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Calendar,
  XCircle,
  FileSpreadsheet,
  Clock,
  Printer,
  Users,
  Activity,
  CheckCircle2,
} from 'lucide-react';

import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';

const NewAppointmentModal = dynamic(() => import('../../../components/receptionist/NewAppointmentModal'), { ssr: false });
import {
  APPOINTMENTS_TODAY_LIST,
  UPCOMING_APPOINTMENTS_LIST,
  DOCTOR_AVAILABILITY_LIST,
  RECENT_APPOINTMENT_ACTIVITIES,
  CALENDAR_TIME_SLOTS,
  CALENDAR_EVENTS_LIST,
} from '../../../components/receptionist/receptionistMockData';

export default function AppointmentsPage() {
  const [filterTab, setFilterTab] = useState<'All' | 'Upcoming' | 'Today' | 'This Week' | 'This Month'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [activeDay, setActiveDay] = useState(19);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  const daysOfWeek = [
    { name: 'Sun', day: 18 },
    { name: 'Mon', day: 19 },
    { name: 'Tue', day: 20 },
    { name: 'Wed', day: 21 },
    { name: 'Thu', day: 22 },
    { name: 'Fri', day: 23 },
    { name: 'Sat', day: 24 },
  ];

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Appointments"
            subtitle="Schedule, manage and view patient appointments."
            icon={CalendarDays}
            actionElement={
              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Appointment
              </button>
            }
          />
        }
        subnav={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'Upcoming', 'Today', 'This Week', 'This Month'] as const).map((tab) => {
                const isActive = filterTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient name, phone number, or doctor..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>

              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        }
        rightPanelWidth="lg:w-[320px] xl:w-[350px] 2xl:w-[380px]"
        rightPanel={
          <div className="space-y-3.5">
            {/* Doctor Availability */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Doctor Availability</h2>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                  View All
                </span>
              </div>

              <div className="space-y-2.5">
                {DOCTOR_AVAILABILITY_LIST.map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={doc.avatar} alt={doc.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 leading-tight truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 truncate">
                          {doc.specialty}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {doc.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-medium mt-1">
                        {doc.hours}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAppointmentModalOpen(true)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Book Appt</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Reschedule</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-700">Cancel</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Patient Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Print Schedule</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Report</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Recent Activity</h2>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                  View All
                </span>
              </div>

              <div className="space-y-2.5">
                {RECENT_APPOINTMENT_ACTIVITIES.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className={`p-1.5 rounded-lg ${act.iconColor} shrink-0 mt-0.5`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate">{act.user}</span>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                        {act.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        {/* ─── Main Content Grid: Calendar (xl:5) + Today & Upcoming Tables (xl:7) ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-4">
          {/* ─── LEFT: Appointment Calendar (5 cols on xl) ─── */}
          <div className="xl:col-span-5 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Appointment Calendar</h2>
              </div>
            </div>

            {/* Month Header + View Mode Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>October 2026</span>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex p-0.5 rounded-lg bg-slate-100 text-[11px] font-bold">
                {(['Day', 'Week', 'Month'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      viewMode === m ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Days of week strip */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map((d) => {
                const isSelected = activeDay === d.day;
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDay(d.day)}
                    className={`py-1 px-0.5 rounded-xl flex flex-col items-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium">{d.name}</span>
                    <span className="text-xs font-bold mt-0.5">{d.day}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive visual time schedule grid */}
            <div className="relative border border-slate-200 rounded-xl p-2.5 max-h-[520px] overflow-y-auto">
              {CALENDAR_TIME_SLOTS.map((slot) => (
                <div key={slot} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0">
                  <span className="text-[10px] font-semibold text-slate-400 w-14 shrink-0">{slot}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
              ))}

              {/* Scheduled Event Blocks */}
              <div className="absolute inset-x-2.5 top-0 bottom-0 pointer-events-none pl-16 pr-2">
                <div className="relative w-full h-full">
                  {CALENDAR_EVENTS_LIST.map((evt, idx) => (
                    <div
                      key={idx}
                      className={`absolute left-0 right-0 p-1.5 rounded-lg text-left shadow-2xs pointer-events-auto ${evt.topOffset} ${evt.height} ${evt.colorClass}`}
                    >
                      <div className="text-[10px] font-bold leading-none">{evt.timeRange}</div>
                      <div className="text-xs font-black truncate leading-tight mt-0.5">
                        {evt.patientName}
                      </div>
                      <div className="text-[10px] font-medium opacity-80 truncate">
                        {evt.department}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── MIDDLE: Today's Appointments & Upcoming (7 cols on xl) ─── */}
          <div className="xl:col-span-7 space-y-3.5 sm:space-y-4">
            {/* Today's Appointments */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Today&apos;s Appointments (Oct 19, 2026)</h2>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                  View All
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2.5 font-medium">Time</th>
                      <th className="pb-2.5 font-medium">Patient Name</th>
                      <th className="pb-2.5 font-medium">Doctor</th>
                      <th className="pb-2.5 font-medium">Department</th>
                      <th className="pb-2.5 font-medium">Type</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {APPOINTMENTS_TODAY_LIST.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 font-medium text-slate-500 whitespace-nowrap">
                          {apt.time}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={apt.avatar}
                              alt={apt.patientName}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-800 leading-tight">
                                {apt.patientName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                                {apt.pid}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{apt.doctor}</td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{apt.department}</td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{apt.type}</td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.status === 'Checked In'
                                ? 'bg-emerald-100 text-emerald-700'
                                : apt.status === 'Waiting'
                                ? 'bg-amber-100 text-amber-700'
                                : apt.status === 'Confirmed'
                                ? 'bg-teal-100 text-teal-700'
                                : apt.status === 'Pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <button
                              type="button"
                              className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Upcoming Appointments</h2>
                </div>
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                  View All
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2.5 font-medium">Time</th>
                      <th className="pb-2.5 font-medium">Patient Name</th>
                      <th className="pb-2.5 font-medium">Doctor</th>
                      <th className="pb-2.5 font-medium">Type</th>
                      <th className="pb-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {UPCOMING_APPOINTMENTS_LIST.map((apt, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 font-medium text-slate-500 whitespace-nowrap">{apt.time}</td>
                        <td className="py-2.5 font-bold text-slate-800 whitespace-nowrap">{apt.patientName}</td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{apt.doctor}</td>
                        <td className="py-2.5 text-slate-600">{apt.type}</td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
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
        </div>
      </ReceptionistPageShell>

      {/* Book Appointment Modal */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
        />
      )}
    </>
  );
}
