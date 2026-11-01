'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Loader2,
  RefreshCw,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchAppointments, updateAppointment, fetchDoctors } from '../../../lib/api';
import type { AppointmentDTO, DoctorDTO } from '@mcms/contracts';

const NewAppointmentModal = dynamic(() => import('../../../components/receptionist/NewAppointmentModal'), { ssr: false });

export default function AppointmentsPage() {
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Upcoming' | 'Today' | 'This Week' | 'This Month'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);

  // Selected date defaults to today
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [apptsData, docsData] = await Promise.all([
        fetchAppointments(accessToken),
        fetchDoctors(accessToken),
      ]);
      setAppointments(apptsData);
      setDoctors(docsData);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Generate 7-day strip around selected date
  const daysOfWeek = useMemo(() => {
    const base = new Date();
    const list = [];
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0] ?? '';
      list.push({
        iso,
        day: d.getDate(),
        name: names[d.getDay()] ?? 'Day',
        isToday: iso === todayStr,
      });
    }
    return list;
  }, [todayStr]);

  // Status updates
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!accessToken) return;
    setUpdatingId(id);
    try {
      await updateAppointment(id, { status: newStatus }, accessToken);
      await loadData();
    } catch {
      // Ignore
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Tab filter
      let matchesTab = true;
      const aptDate = apt.appointmentDate?.split('T')[0] ?? '';

      if (filterTab === 'Today') {
        matchesTab = aptDate === todayStr;
      } else if (filterTab === 'Upcoming') {
        matchesTab = aptDate >= todayStr;
      }

      // Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientPid.toLowerCase().includes(q) ||
        (apt.doctorName ?? '').toLowerCase().includes(q) ||
        apt.type.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [appointments, filterTab, searchQuery, todayStr]);

  // Today's appointments list
  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = a.appointmentDate?.split('T')[0] ?? '';
      return d === todayStr;
    });
  }, [appointments, todayStr]);

  // Upcoming appointments list (after today)
  const upcomingAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = a.appointmentDate?.split('T')[0] ?? '';
      return d > todayStr;
    });
  }, [appointments, todayStr]);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Appointments"
            subtitle="Schedule, manage and view real patient appointments with healthcare staff."
            icon={CalendarDays}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadData()}
                  title="Refresh Appointments"
                  className="flex items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold shadow-2xs border border-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Appointment
                </button>
              </div>
            }
          />
        }
        subnav={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'Upcoming', 'Today'] as const).map((tab) => {
                const isActive = filterTab === tab;
                const count =
                  tab === 'All'
                    ? appointments.length
                    : tab === 'Today'
                      ? todayAppointments.length
                      : upcomingAppointments.length;

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
                    {tab} ({count})
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
                  placeholder="Search patient name, PID, or doctor..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
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
                  <h2 className="text-sm font-bold text-slate-800">Doctor Directory</h2>
                </div>
                <span className="text-xs font-bold text-blue-600">
                  {doctors.length} Doctors
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {doctors.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">No doctors registered yet.</div>
                ) : (
                  doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {doc.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 leading-tight truncate">
                            {doc.displayName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 truncate">
                            {doc.specialty || 'General Practitioner'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {doc.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
                  onClick={() => window.print()}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Print List</span>
                </button>
              </div>
            </div>
          </div>
        }
      >
        {/* Main Grid: Date Strip + Tables */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Days of week strip */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map((d) => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setSelectedDate(d.iso)}
                    className={`py-1.5 px-1 rounded-xl flex flex-col items-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : d.isToday
                          ? 'border border-blue-200 bg-blue-50/50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium">{d.name}</span>
                    <span className="text-xs font-bold mt-0.5">{d.day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  Appointments ({filteredAppointments.length})
                </h2>
              </div>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2.5 font-medium">Time</th>
                    <th className="pb-2.5 font-medium">Patient Name</th>
                    <th className="pb-2.5 font-medium">Doctor</th>
                    <th className="pb-2.5 font-medium">Type</th>
                    <th className="pb-2.5 font-medium">Date</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {loading ? 'Loading appointments...' : 'No appointments found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => {
                      const isUpdating = updatingId === apt.id;
                      const dateStr = apt.appointmentDate?.split('T')[0] ?? '';

                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 font-medium text-slate-700 whitespace-nowrap">
                            {apt.startTime}
                          </td>
                          <td className="py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {apt.patientName.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 leading-tight">
                                  {apt.patientName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium font-mono leading-none mt-0.5">
                                  {apt.patientPid}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600 whitespace-nowrap">
                            {apt.doctorName || 'Assigned Doctor'}
                          </td>
                          <td className="py-2.5 text-slate-600 whitespace-nowrap">{apt.type}</td>
                          <td className="py-2.5 text-slate-500 whitespace-nowrap">{dateStr}</td>
                          <td className="py-2.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : apt.status === 'CANCELLED'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {apt.status !== 'CONFIRMED' && apt.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void handleUpdateStatus(apt.id, 'CONFIRMED')}
                                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] transition disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                              )}
                              {apt.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void handleUpdateStatus(apt.id, 'CANCELLED')}
                                  className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] transition disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Book Appointment Modal */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          onSuccess={() => void loadData()}
        />
      )}
    </>
  );
}
