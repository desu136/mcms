import React, { useState } from 'react';
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

export function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem>({
    id: 'apt-detail-1',
    time: '08:00 AM - 08:20 AM',
    patientName: 'Aster Mulu',
    patientId: 'PID-001024',
    age: 28,
    gender: 'Female',
    reason: 'Follow-up Visit',
    department: 'Cardiology',
    doctorName: 'Dr. Fitsum Alemu',
    status: 'In Progress',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPatient, setDrawerPatient] = useState<PatientItem | null>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const todayAppointments: AppointmentItem[] = [
    {
      id: 'apt-t1',
      time: '08:00 AM - 08:20 AM',
      patientName: 'Aster Mulu',
      patientId: 'PID-001024',
      age: 28,
      gender: 'Female',
      reason: 'Follow-up Visit',
      department: 'Cardiology',
      doctorName: 'Dr. Fitsum Alemu',
      status: 'In Progress',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'apt-t2',
      time: '10:30 AM - 10:50 AM',
      patientName: 'Samuel Girma',
      patientId: 'PID-001087',
      age: 42,
      gender: 'Male',
      reason: 'Consultation',
      department: 'Cardiology',
      doctorName: 'Dr. Fitsum Alemu',
      status: 'Upcoming',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'apt-t3',
      time: '11:15 AM - 11:35 AM',
      patientName: 'Betlehem Abebe',
      patientId: 'PID-001098',
      age: 32,
      gender: 'Female',
      reason: 'Medication Review',
      department: 'Cardiology',
      doctorName: 'Dr. Fitsum Alemu',
      status: 'Upcoming',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleOpenPatientProfile = () => {
    const match = INITIAL_PATIENTS.find((p) => p.name === selectedAppointment.patientName) || INITIAL_PATIENTS[0]!;
    setDrawerPatient(match);
    setDrawerOpen(true);
  };

  const currentList =
    activeTab === 'today'
      ? todayAppointments
      : activeTab === 'upcoming'
      ? UPCOMING_APPOINTMENTS_PAGE
      : activeTab === 'completed'
      ? todayAppointments.filter((a) => a.status === 'Completed' || a.status === 'In Progress')
      : todayAppointments.filter((a) => a.status === 'Cancelled');

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
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your daily clinical schedule, patient consultations, and follow-ups.
          </p>
        </div>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="kpi-grid">
      <DoctorStatCard
        title="Total Appointments"
        value={8}
        icon={CalendarDays}
        color="blue"
        change={{ value: '+2', trend: 'up', label: 'vs. last week' }}
      />
      <DoctorStatCard
        title="Completed"
        value={5}
        icon={CheckCircle2}
        color="emerald"
        change={{ value: '+1', trend: 'up', label: 'vs. last week' }}
      />
      <DoctorStatCard
        title="Upcoming"
        value={2}
        icon={Clock}
        color="cyan"
        change={{ value: '+1', trend: 'up', label: 'vs. last week' }}
      />
      <DoctorStatCard
        title="Cancelled"
        value={1}
        icon={XCircle}
        color="orange"
        change={{ value: '0', trend: 'neutral', label: 'vs. last week' }}
      />
    </div>
  );

  const rightPanelContent = (
    <>
      {/* Selected Appointment Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Appointment Details</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedAppointment.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : selectedAppointment.status === 'In Progress'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {selectedAppointment.status}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Scheduled Time:</span>
            <span className="font-bold text-slate-800">{selectedAppointment.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Appointment ID:</span>
            <span className="font-mono font-bold text-slate-700">{selectedAppointment.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Department:</span>
            <span className="font-bold text-slate-800">{selectedAppointment.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Consultation Type:</span>
            <span className="font-bold text-slate-800">{selectedAppointment.reason}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2">
          <button
            onClick={handleOpenPatientProfile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Start / View Consultation
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPrescriptionModalOpen(true)}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescribe
            </button>
            <button
              onClick={() => setLabModalOpen(true)}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-orange-500" /> Order Lab
            </button>
          </div>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800">Patient Profile</h3>
          </div>
          <button
            onClick={handleOpenPatientProfile}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Full Profile
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <img
            src={selectedAppointment.avatar}
            alt={selectedAppointment.patientName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div>
            <div className="text-sm font-bold text-slate-800">{selectedAppointment.patientName}</div>
            <div className="text-[11px] text-blue-600 font-semibold">{selectedAppointment.patientId}</div>
            <div className="text-[10px] text-slate-400">
              {selectedAppointment.age} years • {selectedAppointment.gender}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>+251 912 345 678</span>
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
        rightPanelWidth="lg:w-[320px] xl:w-[360px]"
      >
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Tabs & Search Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'today', label: "Today's Appointments (8)" },
                { id: 'upcoming', label: 'Upcoming (12)' },
                { id: 'completed', label: 'Completed (5)' },
                { id: 'cancelled', label: 'Cancelled (1)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
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
              <button
                type="button"
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Filter options"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
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
                  const isSelected = selectedAppointment.id === apt.id;
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
