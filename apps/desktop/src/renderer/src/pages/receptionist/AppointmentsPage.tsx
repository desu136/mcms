import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Database,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  UserCheck,
  XCircle,
  CalendarClock,
  Printer,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import NewAppointmentModal from '../../components/receptionist/NewAppointmentModal';
import RescheduleAppointmentModal from '../../components/receptionist/RescheduleAppointmentModal';
import QueueTicketModal, { TicketPrintData } from '../../components/receptionist/QueueTicketModal';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import {
  fetchAppointments,
  updateAppointment,
  fetchDoctors,
  fetchDepartments,
  addToQueue,
} from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { AppointmentDTO, DoctorDTO, ClinicDepartmentDTO } from '@mcms/contracts';

interface AppointmentsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function AppointmentsPage({ onNavigateTab }: AppointmentsPageProps) {
  const { enqueueOperation } = useSync();
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Today' | 'Upcoming' | 'Confirmed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentDTO | null>(null);
  const [ticketPrintData, setTicketPrintData] = useState<TicketPrintData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [doctorsList, setDoctorsList] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Load appointments from backend
  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const [aptData, docData, deptData] = await Promise.allSettled([
        fetchAppointments(accessToken),
        fetchDoctors(accessToken),
        fetchDepartments(accessToken),
      ]);

      if (aptData.status === 'fulfilled' && aptData.value) {
        setAppointments(aptData.value);
      }
      if (docData.status === 'fulfilled' && docData.value) {
        setDoctorsList(docData.value);
      }
      if (deptData.status === 'fulfilled' && deptData.value) {
        setDepartments(deptData.value);
      }
    } catch (err) {
      console.warn('Failed to fetch appointments from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  // Handle Status Transitions
  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
  ) => {
    setActionLoadingId(id);

    try {
      await updateAppointment(id, { status: newStatus }, accessToken);
      await enqueueOperation('appointment', id, 'UPDATE', {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      showFeedback(`Appointment status updated to ${newStatus}`);
      await loadAppointments();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1-Click Check In to Queue
  const handleCheckInToQueue = async (apt: AppointmentDTO) => {
    setActionLoadingId(apt.id);
    try {
      const qRes = await addToQueue(
        {
          patientId: apt.patientId,
          assignedDoctorId: apt.doctorId || undefined,
          departmentId: apt.departmentId || undefined,
          priority: 'NORMAL',
        },
        accessToken,
      );

      await updateAppointment(apt.id, { status: 'CHECKED_IN' }, accessToken);
      await enqueueOperation('appointment', apt.id, 'UPDATE', { status: 'CHECKED_IN' });

      showFeedback(`Checked in! Ticket #${qRes.ticketNumber} issued for ${apt.patientName}`);
      setTicketPrintData({
        ticketNumber: qRes.ticketNumber,
        patientName: apt.patientName,
        patientPid: apt.patientPid,
        departmentName: departments.find((d) => d.id === apt.departmentId)?.name || 'General Clinic',
        doctorName: apt.doctorName,
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: 'Normal',
      });
      await loadAppointments();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to check in appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (apt: AppointmentDTO) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment for ${apt.patientName}?`)) return;
    setActionLoadingId(apt.id);
    try {
      await updateAppointment(apt.id, { status: 'CANCELLED' }, accessToken);
      await enqueueOperation('appointment', apt.id, 'UPDATE', { status: 'CANCELLED' });
      showFeedback('Appointment cancelled');
      await loadAppointments();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to cancel appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = apt.appointmentDate ? apt.appointmentDate.split('T')[0] : '';
      const s = (apt.status || '').toUpperCase();

      let matchesTab = true;
      if (filterTab === 'Today') {
        matchesTab = s === 'CHECKED_IN' || aptDate === todayStr;
      } else if (filterTab === 'Confirmed') {
        matchesTab = s === 'CONFIRMED';
      } else if (filterTab === 'Upcoming') {
        matchesTab = (s === 'SCHEDULED' || s === 'CONFIRMED') && (!aptDate || aptDate >= todayStr);
      }

      const matchesDoc = selectedDoctorFilter === 'ALL' || apt.doctorId === selectedDoctorFilter;
      const matchesDept = selectedDeptFilter === 'ALL' || apt.departmentId === selectedDeptFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientPid.toLowerCase().includes(q) ||
        (apt.doctorName ?? '').toLowerCase().includes(q) ||
        apt.type.toLowerCase().includes(q) ||
        (apt.reason && apt.reason.toLowerCase().includes(q));

      return matchesTab && matchesDoc && matchesDept && matchesSearch;
    });
  }, [appointments, filterTab, searchQuery, selectedDoctorFilter, selectedDeptFilter, todayStr]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      today: appointments.filter((a) => (a.status || '').toUpperCase() === 'CHECKED_IN' || (a.appointmentDate?.split('T')[0] === todayStr)).length,
      upcoming: appointments.filter((a) => {
        const s = (a.status || '').toUpperCase();
        const d = a.appointmentDate?.split('T')[0] ?? '';
        return (s === 'SCHEDULED' || s === 'CONFIRMED') && (!d || d >= todayStr);
      }).length,
      confirmed: appointments.filter((a) => (a.status || '').toUpperCase() === 'CONFIRMED').length,
    };
  }, [appointments, todayStr]);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Appointment Scheduling"
            subtitle="View, book, and reschedule clinic appointments across all medical departments."
            icon={CalendarDays}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadAppointments}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh Appointments"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            }
          />
        }
        subnav={
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterTab('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'All'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'All' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('Today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'Today'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Today</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'Today' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {counts.today}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('Upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'Upcoming'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Upcoming</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'Upcoming' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {counts.upcoming}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('Confirmed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'Confirmed'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Confirmed</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'Confirmed' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {counts.confirmed}
                </span>
              </button>
            </div>

            {/* Search Bar & Filters */}
            <div className="flex items-center gap-2">
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Doctors</option>
                {doctorsList.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.displayName}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        }
        rightPanel={
          <div className="space-y-3.5">
            {/* Doctor Availability Panel */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Doctor Roster</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {doctorsList.length} Active
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {doctorsList.length === 0 ? (
                  <div className="text-slate-400 text-xs py-4 text-center">
                    No doctors registered yet.
                  </div>
                ) : (
                  doctorsList.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{doc.displayName}</div>
                        <div className="text-[10px] text-slate-400">{doc.specialty || doc.departmentName || 'Medical Doctor'}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Available
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Feedback Banner */}
            {feedback && (
              <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-md animate-in fade-in space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Notification
                </div>
                <div className="text-xs font-bold">{feedback}</div>
              </div>
            )}

            {/* Offline SQLite Notice */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Offline SQLite Scheduled</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Bookings, check-ins and cancellations are queued locally to SQLite and automatically pushed to the PostgreSQL backend server.
              </p>
            </div>
          </div>
        }
      >
        {/* Appointments Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Time</th>
                  <th className="pb-2.5">Patient Details</th>
                  <th className="pb-2.5">Doctor</th>
                  <th className="pb-2.5">Type & Reason</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span>Loading appointments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No appointments matching the current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((apt) => {
                    const isBusy = actionLoadingId === apt.id;
                    const s = (apt.status || '').toUpperCase();
                    const aptDate = apt.appointmentDate ? apt.appointmentDate.split('T')[0] : '';
                    const deptName = departments.find((d) => d.id === apt.departmentId)?.name || 'General Clinic';

                    return (
                      <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5">
                          <div className="font-mono font-bold text-blue-700">{apt.startTime || '09:00'}</div>
                          {aptDate && <div className="text-[10px] text-slate-400 font-mono">{aptDate}</div>}
                        </td>
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900">{apt.patientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{apt.patientPid}</div>
                        </td>
                        <td className="py-2.5 font-medium text-slate-700">
                          <div>{apt.doctorName || 'Assigned Doctor'}</div>
                          <div className="text-[10px] text-slate-400">{deptName}</div>
                        </td>
                        <td className="py-2.5">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                            {apt.type || 'General'}
                          </span>
                          {apt.reason && (
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">
                              {apt.reason}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              s === 'CHECKED_IN'
                                ? 'bg-cyan-100 text-cyan-800'
                                : s === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-700'
                                : s === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {apt.status || 'Scheduled'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(s === 'SCHEDULED' || s === 'PENDING') && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                  className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                  title="Confirm appointment"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Confirm</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleCheckInToQueue(apt)}
                                  className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                  title="Check in patient"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Check In</span>
                                </button>
                              </>
                            )}

                            {s === 'CONFIRMED' && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleCheckInToQueue(apt)}
                                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                title="Check in patient"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Check In</span>
                              </button>
                            )}

                            {s === 'CHECKED_IN' && (
                              <button
                                type="button"
                                onClick={() => onNavigateTab('queue')}
                                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>In Queue</span>
                              </button>
                            )}

                            {s !== 'CANCELLED' && s !== 'COMPLETED' && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => setRescheduleTarget(apt)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Reschedule appointment"
                                >
                                  <CalendarClock className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleCancelAppointment(apt)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Cancel appointment"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
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
      </ReceptionistPageShell>

      {/* Book Appointment Modal */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          onAppointmentBooked={() => {
            void loadAppointments();
            setAppointmentModalOpen(false);
          }}
        />
      )}

      {/* Reschedule Appointment Modal */}
      {rescheduleTarget && (
        <RescheduleAppointmentModal
          isOpen={!!rescheduleTarget}
          appointment={rescheduleTarget}
          doctors={doctorsList}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={() => {
            void loadAppointments();
            setRescheduleTarget(null);
          }}
        />
      )}

      {/* Ticket Print Modal */}
      {ticketPrintData && (
        <QueueTicketModal
          isOpen={!!ticketPrintData}
          ticket={ticketPrintData}
          onClose={() => setTicketPrintData(null)}
        />
      )}
    </>
  );
}

export default React.memo(AppointmentsPage);
