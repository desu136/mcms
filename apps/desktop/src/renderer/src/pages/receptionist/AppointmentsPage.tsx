import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  Printer,
  Users,
  CheckCircle2,
  Database,
  Filter,
} from 'lucide-react';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import NewAppointmentModal from '../../components/receptionist/NewAppointmentModal';
import {
  APPOINTMENTS_TODAY_LIST,
  DOCTOR_AVAILABILITY_LIST,
  CALENDAR_EVENTS_LIST,
} from '../../components/receptionist/receptionistMockData';
import { useSync } from '../../context/SyncContext';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface AppointmentsPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function AppointmentsPage({ onNavigateTab }: AppointmentsPageProps) {
  const { enqueueOperation } = useSync();
  const [filterTab, setFilterTab] = useState<'All' | 'Upcoming' | 'Today' | 'Confirmed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState(APPOINTMENTS_TODAY_LIST);

  const filtered = appointmentsList.filter((apt) => {
    const matchesFilter =
      filterTab === 'All' ||
      (filterTab === 'Today' && apt.status === 'Checked In') ||
      (filterTab === 'Confirmed' && apt.status === 'Confirmed') ||
      filterTab === 'Upcoming';
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAppointmentBooked = (newApt: any) => {
    setAppointmentsList((prev: any) => [
      {
        id: newApt.id,
        time: newApt.time,
        patientName: newApt.patientName,
        pid: newApt.pid || 'P-2026-9999',
        avatar: '',
        doctor: newApt.doctor,
        department: newApt.department,
        status: 'Scheduled',
        type: newApt.priority || 'General',
      },
      ...prev,
    ]);
  };

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Appointment Scheduling"
            subtitle="View, book, and reschedule clinic appointments across all medical departments."
            icon={CalendarDays}
            actionElement={
              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            }
          />
        }
        subnav={
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'Today', 'Upcoming', 'Confirmed'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
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
                  Available Now
                </span>
              </div>

              <div className="space-y-2">
                {DOCTOR_AVAILABILITY_LIST.map((doc, idx) => (
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
                ))}
              </div>
            </div>

            {/* Offline SQLite Notice */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Offline SQLite Scheduled</span>
              </div>
              <p className="text-[11px] text-blue-700">
                New appointments automatically sync locally and push to the clinic backend server.
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
                  <th className="pb-2.5">Patient Name</th>
                  <th className="pb-2.5">Doctor</th>
                  <th className="pb-2.5">Department</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-blue-700">{apt.time}</td>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{apt.pid}</div>
                    </td>
                    <td className="py-2.5 font-medium text-slate-700">{apt.doctor}</td>
                    <td className="py-2.5 text-slate-600">{apt.department}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {apt.type}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'Checked In'
                            ? 'bg-blue-100 text-blue-700'
                            : apt.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
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
