import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  User,
  Phone,
  Eye,
  Pill,
  FlaskConical,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  UPCOMING_APPOINTMENTS_PAGE,
  AppointmentItem,
  PatientItem,
} from '../../components/doctor/doctorMockData';
import { DoctorPatientDrawer } from '../../components/doctor/DoctorPatientDrawer';
import { DoctorPrescriptionModal } from '../../components/doctor/DoctorPrescriptionModal';
import { DoctorLabOrderModal } from '../../components/doctor/DoctorLabOrderModal';
import { DoctorPageShell } from '../../components/doctor/DoctorPageShell';
import { DoctorStatCard } from '../../components/doctor/DoctorStatCard';
import { useAuth } from '../../auth/AuthContext';
import { fetchAppointments, updateAppointment } from '../../api/appointments';
import type { AppointmentDTO } from '@mcms/contracts';

function mapDtoToAppointmentItem(dto: AppointmentDTO): AppointmentItem {
  const statusMap: Record<string, AppointmentItem['status']> = {
    CONFIRMED: 'Upcoming',
    SCHEDULED: 'Scheduled',
    CHECKED_IN: 'In Progress',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return {
    id: dto.id,
    time: `${dto.startTime}${dto.endTime ? ` - ${dto.endTime}` : ''}`,
    date: dto.appointmentDate,
    fullDateTime: `${dto.appointmentDate} ${dto.startTime}`,
    patientName: dto.patientName,
    patientId: dto.patientPid,
    age: 35,
    gender: 'Female',
    reason: dto.reason || dto.type || 'Consultation',
    department: 'General OPD',
    doctorName: dto.doctorName || 'Attending Physician',
    status: statusMap[dto.status.toUpperCase()] || 'Upcoming',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.patientName)}&size=150&background=dbeafe&color=1e40af`,
  };
}

export function AppointmentsPage() {
  const { accessToken } = useAuth();
  const [appointmentsList, setAppointmentsList] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPatient, setDrawerPatient] = useState<PatientItem | null>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAppointments(accessToken);
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDtoToAppointmentItem);
        setAppointmentsList(mapped);
        if (!selectedAppointment) setSelectedAppointment(mapped[0]!);
      } else {
        setAppointmentsList(UPCOMING_APPOINTMENTS_PAGE);
        if (!selectedAppointment) setSelectedAppointment(UPCOMING_APPOINTMENTS_PAGE[0]!);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch appointments');
      setAppointmentsList(UPCOMING_APPOINTMENTS_PAGE);
      if (!selectedAppointment) setSelectedAppointment(UPCOMING_APPOINTMENTS_PAGE[0]!);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const handleStatusChange = async (aptId: string, nextStatus: 'COMPLETED' | 'CANCELLED') => {
    try {
      await updateAppointment(aptId, { status: nextStatus }, accessToken);
      void loadAppointments();
    } catch {
      // Offline fallback: enqueue to SQLite
      try {
        await (window as any).electron?.ipcRenderer?.invoke('enqueue-operation', {
          type: 'UPDATE_APPOINTMENT',
          payload: { id: aptId, status: nextStatus },
        });
        // Optimistically update
        setAppointmentsList((prev) =>
          prev.map((a) => (a.id === aptId ? { ...a, status: nextStatus === 'COMPLETED' ? 'Completed' : 'Cancelled' } : a))
        );
      } catch {
        // ignore
      }
    }
  };

  const handleOpenPatientProfile = () => {
    if (!selectedAppointment) return;
    const match = INITIAL_PATIENTS.find((p) => p.name === selectedAppointment.patientName) || INITIAL_PATIENTS[0]!;
    setDrawerPatient(match);
    setDrawerOpen(true);
  };

  const currentList = appointmentsList.filter((a) => {
    if (activeTab === 'today') return a.status === 'In Progress' || a.status === 'Upcoming' || a.status === 'Scheduled';
    if (activeTab === 'upcoming') return a.status === 'Upcoming' || a.status === 'Scheduled';
    if (activeTab === 'completed') return a.status === 'Completed';
    return a.status === 'Cancelled';
  });

  const filteredAppointments = currentList.filter((a) =>
    searchQuery.trim()
      ? a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <CalendarDays className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Consultation Schedule
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Daily clinical queue, timed consultations, and patient visits.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => void loadAppointments()}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );

  const totalToday = appointmentsList.filter((a) => a.status !== 'Cancelled').length;
  const completedToday = appointmentsList.filter((a) => a.status === 'Completed').length;
  const inProgressToday = appointmentsList.filter((a) => a.status === 'In Progress').length;
  const cancelledToday = appointmentsList.filter((a) => a.status === 'Cancelled').length;

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Appointments"
        value={loading ? '—' : totalToday}
        icon={CalendarDays}
        color="blue"
        change={{ value: '', trend: 'up', label: 'live schedule' }}
      />
      <DoctorStatCard
        title="Completed"
        value={loading ? '—' : completedToday}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '', trend: 'up', label: 'finished' }}
      />
      <DoctorStatCard
        title="In Progress"
        value={loading ? '—' : inProgressToday}
        icon={Clock}
        color="amber"
        change={{ value: '', trend: 'up', label: 'active' }}
      />
      <DoctorStatCard
        title="Cancelled"
        value={loading ? '—' : cancelledToday}
        icon={XCircle}
        color="rose"
        change={{ value: '', trend: 'down', label: 'cancelled' }}
      />
    </div>
  );

  const rightPanelContent = selectedAppointment ? (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Visit Summary</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              selectedAppointment.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : selectedAppointment.status === 'In Progress'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : selectedAppointment.status === 'Cancelled'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {selectedAppointment.status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={selectedAppointment.avatar}
            alt={selectedAppointment.patientName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
              {selectedAppointment.patientName}
            </h4>
            <div className="text-xs font-mono font-bold text-blue-600 mt-0.5">
              {selectedAppointment.patientId}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {selectedAppointment.age} yrs • {selectedAppointment.gender}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Scheduled Time:</span>
            <span className="font-bold text-slate-800">{selectedAppointment.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Visit Reason:</span>
            <span className="font-semibold text-slate-800">{selectedAppointment.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Department:</span>
            <span className="font-medium text-slate-700">{selectedAppointment.department}</span>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={handleOpenPatientProfile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Patient Chart
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPrescriptionModalOpen(true)}
              className="py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescribe
            </button>
            <button
              onClick={() => setLabModalOpen(true)}
              className="py-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-orange-600" /> Order Lab
            </button>
          </div>

          {selectedAppointment.status !== 'Completed' && selectedAppointment.status !== 'Cancelled' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => void handleStatusChange(selectedAppointment.id, 'COMPLETED')}
                className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete Visit
              </button>
              <button
                onClick={() => void handleStatusChange(selectedAppointment.id, 'CANCELLED')}
                className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Visit
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={rightPanelContent}
        rightPanelWidth="lg:w-[320px] xl:w-[360px]"
      >
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(['today', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer shrink-0 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter schedule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Loading schedule…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-5">Patient Name</th>
                    <th className="py-3 px-5">Reason</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAppointments.map((apt) => {
                    const isSelected = selectedAppointment?.id === apt.id;
                    return (
                      <tr
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-5 font-semibold text-slate-600">{apt.time}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={apt.avatar}
                              alt={apt.patientName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{apt.patientName}</div>
                              <div className="text-[11px] text-slate-400">
                                {apt.patientId} • {apt.age} yrs
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-700">{apt.reason}</td>
                        <td className="py-3.5 px-5 text-slate-500">{apt.department}</td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              apt.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : apt.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : apt.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                              handleOpenPatientProfile();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DoctorPageShell>

      {/* Patient Drawer & Modals */}
      <DoctorPatientDrawer
        patient={drawerPatient}
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
export default AppointmentsPage;
