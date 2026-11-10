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
  FileText,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import NewAppointmentModal from '../../components/receptionist/NewAppointmentModal';
import {
  APPOINTMENTS_TODAY_LIST,
  DOCTOR_AVAILABILITY_LIST,
} from '../../components/receptionist/receptionistMockData';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import {
  fetchAppointments,
  updateAppointment,
  fetchDoctors,
} from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { AppointmentDTO, DoctorDTO } from '@mcms/contracts';

interface AppointmentsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

interface DisplayAppointment {
  id: string;
  time: string;
  date: string;
  patientName: string;
  pid: string;
  doctor: string;
  department: string;
  status: string;
  type: string;
  reason?: string | undefined;
}

export function AppointmentsPage({ onNavigateTab }: AppointmentsPageProps) {
  const { enqueueOperation } = useSync();
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Today' | 'Upcoming' | 'Confirmed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<DisplayAppointment[]>(() =>
    APPOINTMENTS_TODAY_LIST.map((apt) => ({
      id: apt.id,
      time: apt.time,
      date: new Date().toISOString().split('T')[0] ?? '',
      patientName: apt.patientName,
      pid: apt.pid,
      doctor: apt.doctor,
      department: apt.department,
      status: apt.status,
      type: apt.type,
      reason: 'General Consultation',
    })),
  );

  const [doctorsList, setDoctorsList] = useState<DoctorDTO[]>([]);

  // Load appointments from backend
  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const [aptData, docData] = await Promise.allSettled([
        fetchAppointments(accessToken),
        fetchDoctors(accessToken),
      ]);

      if (aptData.status === 'fulfilled' && aptData.value && aptData.value.length > 0) {
        const mapped: DisplayAppointment[] = aptData.value.map((dto: AppointmentDTO) => {
          let formattedStatus = 'Scheduled';
          const s = (dto.status || '').toUpperCase();
          if (s === 'CONFIRMED') formattedStatus = 'Confirmed';
          else if (s === 'CHECKED_IN') formattedStatus = 'Checked In';
          else if (s === 'IN_PROGRESS') formattedStatus = 'In Progress';
          else if (s === 'COMPLETED') formattedStatus = 'Completed';
          else if (s === 'CANCELLED') formattedStatus = 'Cancelled';

          return {
            id: dto.id,
            time: dto.startTime || '09:00',
            date: dto.appointmentDate ? dto.appointmentDate.split('T')[0] ?? '' : '',
            patientName: dto.patientName || 'Patient',
            pid: dto.patientPid || 'PID-Pending',
            doctor: dto.doctorName || 'Assigned Doctor',
            department: dto.departmentId ? 'Department' : 'General OPD',
            status: formattedStatus,
            type: dto.type || 'General',
            reason: dto.reason ?? undefined,
          };
        });
        setAppointments(mapped);
      }

      if (docData.status === 'fulfilled' && docData.value && docData.value.length > 0) {
        setDoctorsList(docData.value);
      }
    } catch (err) {
      console.warn('Failed to fetch appointments from backend, staying with local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Handle Status Transitions
  const handleUpdateStatus = async (
    id: string,
    newStatus: 'Confirmed' | 'Checked In' | 'Cancelled' | 'Completed',
  ) => {
    setActionLoadingId(id);
    const backendStatus =
      newStatus === 'Confirmed'
        ? 'CONFIRMED'
        : newStatus === 'Checked In'
        ? 'CHECKED_IN'
        : newStatus === 'Completed'
        ? 'COMPLETED'
        : 'CANCELLED';

    // 1. Optimistic UI update
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt)),
    );

    // 2. Local SQLite Sync Queue
    try {
      await enqueueOperation('appointment', id, 'UPDATE', {
        status: backendStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to enqueue local appointment update:', err);
    }

    // 3. Live API call
    try {
      await updateAppointment(id, { status: backendStatus }, accessToken);
    } catch (err) {
      console.warn('Live API appointment update failed, queued locally:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAppointmentBooked = (newApt: any) => {
    setAppointments((prev) => [
      {
        id: newApt.id || `apt-${Date.now()}`,
        time: newApt.time || '09:00',
        date: newApt.date || (new Date().toISOString().split('T')[0] ?? ''),
        patientName: newApt.patientName || 'Registered Patient',
        pid: newApt.pid || 'P-2026-9999',
        doctor: newApt.doctor || 'Dr. Specialist',
        department: newApt.department || 'Outpatient Clinic',
        status: 'Scheduled',
        type: newApt.priority || 'General',
        reason: newApt.reason || 'Consultation',
      },
      ...prev,
    ]);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesFilter =
        filterTab === 'All' ||
        (filterTab === 'Today' && (apt.status === 'Checked In' || apt.date === todayStr)) ||
        (filterTab === 'Confirmed' && apt.status === 'Confirmed') ||
        (filterTab === 'Upcoming' && (apt.status === 'Scheduled' || apt.status === 'Confirmed'));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.pid.toLowerCase().includes(q) ||
        apt.doctor.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q) ||
        (apt.reason && apt.reason.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [appointments, filterTab, searchQuery, todayStr]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      today: appointments.filter((a) => a.status === 'Checked In' || a.date === todayStr).length,
      upcoming: appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Confirmed').length,
      confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
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

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, doctor, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
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
                  Active
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {doctorsList.length > 0 ? (
                  doctorsList.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{doc.displayName}</div>
                        <div className="text-[10px] text-slate-400">{doc.specialty || 'General Practitioner'}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Available
                      </span>
                    </div>
                  ))
                ) : (
                  DOCTOR_AVAILABILITY_LIST.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.specialty}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

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
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5">
                          <div className="font-mono font-bold text-blue-700">{apt.time}</div>
                          {apt.date && <div className="text-[10px] text-slate-400 font-mono">{apt.date}</div>}
                        </td>
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900">{apt.patientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{apt.pid}</div>
                        </td>
                        <td className="py-2.5 font-medium text-slate-700">
                          <div>{apt.doctor}</div>
                          <div className="text-[10px] text-slate-400">{apt.department}</div>
                        </td>
                        <td className="py-2.5">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                            {apt.type}
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
                              apt.status === 'Checked In'
                                ? 'bg-cyan-100 text-cyan-800'
                                : apt.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'Completed'
                                ? 'bg-slate-100 text-slate-700'
                                : apt.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {apt.status === 'Scheduled' && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                                  className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Confirm appointment"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Confirm</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(apt.id, 'Checked In')}
                                  className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Check in patient"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Check In</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Cancel appointment"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {apt.status === 'Confirmed' && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(apt.id, 'Checked In')}
                                  className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Check in patient"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Check In</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Cancel appointment"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {apt.status === 'Checked In' && (
                              <button
                                type="button"
                                onClick={() => onNavigateTab('queue')}
                                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>Go to Queue</span>
                              </button>
                            )}

                            {apt.status === 'In Progress' && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <span>Complete</span>
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
      </ReceptionistPageShell>

      {/* Book Appointment Modal */}
      {appointmentModalOpen && (
        <NewAppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          onAppointmentBooked={handleAppointmentBooked}
        />
      )}
    </>
  );
}

export default React.memo(AppointmentsPage);
