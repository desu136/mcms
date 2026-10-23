'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Heart,
  Pill,
  FlaskConical,
  FileText,
  MessageSquare,
  User,
  Phone,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  CURRENT_DOCTOR,
  INITIAL_PATIENTS,
  UPCOMING_APPOINTMENTS_PAGE,
  AppointmentItem,
  PatientItem,
} from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import DoctorStatCard from '../../../components/doctor/DoctorStatCard';

export default function DoctorAppointmentsPage() {
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
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  // Today's appointments list
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
  ];

  const handleSelectApt = (apt: AppointmentItem) => {
    setSelectedAppointment(apt);
  };

  const handleOpenPatientProfile = () => {
    const match = INITIAL_PATIENTS.find((p) => p.name === selectedAppointment.patientName) || INITIAL_PATIENTS[0];
    setDrawerOpen(true);
  };

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            View and manage your scheduled appointments.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs self-start md:self-auto">
        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
        <div>
          <div className="text-xs font-bold text-slate-800 tracking-tight">Oct 19, 2026</div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">Monday</div>
        </div>
        <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-2 text-slate-400">
          <button className="p-0.5 rounded hover:bg-slate-100 hover:text-slate-600">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-0.5 rounded hover:bg-slate-100 hover:text-slate-600">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
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
        color="rose"
        change={{ value: '0', trend: 'neutral', label: 'vs. last week' }}
      />
    </div>
  );

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={
          <>
          {/* Appointment Details Card (Matching screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Appointment Details</h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {selectedAppointment.status}
              </span>
            </div>

            {/* Patient Header */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
              <img
                src={selectedAppointment.avatar}
                alt={selectedAppointment.patientName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-2xs"
              />
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-slate-800 truncate">
                  {selectedAppointment.patientName}
                </div>
                <div className="text-xs text-blue-600 font-semibold mb-1">
                  {selectedAppointment.patientId}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedAppointment.age} years / {selectedAppointment.gender}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+251 912 345 678</span>
                </div>
              </div>
            </div>

            {/* Appointment Meta Info */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Appointment Time
                </span>
                <span className="font-bold text-slate-800">{selectedAppointment.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Department
                </span>
                <span className="font-bold text-slate-800">{selectedAppointment.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Reason
                </span>
                <span className="font-bold text-slate-800">{selectedAppointment.reason}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Doctor
                </span>
                <span className="font-bold text-slate-800">{selectedAppointment.doctorName}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleOpenPatientProfile}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" /> View Patient Profile
              </button>
              <button
                onClick={handleOpenPatientProfile}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Open Medical Record
              </button>
            </div>
          </div>

          {/* Quick Actions (Appointments Card) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPrescriptionModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group"
              >
                <Pill className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Add Prescription</div>
              </button>
              <button
                onClick={() => setLabModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group"
              >
                <FlaskConical className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Order Lab Test</div>
              </button>
              <button
                onClick={handleOpenPatientProfile}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group"
              >
                <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Add Medical Record</div>
              </button>
              <button
                onClick={() => alert(`Opening secure doctor messaging with ${selectedAppointment.patientName}`)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group"
              >
                <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Send Message</div>
              </button>
            </div>
          </div>

          {/* Today's Schedule Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Today&apos;s Schedule
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">08:00 AM • Aster Mulu</div>
                  <div className="text-[11px] text-slate-400">Follow-up Visit</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  In Progress
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">10:30 AM • Samuel Girma</div>
                  <div className="text-[11px] text-slate-400">Consultation</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-600">
                  Upcoming
                </span>
              </div>
            </div>
          </div>

          {/* Motivational Quote Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border border-blue-100/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Better care, healthier lives</div>
              <div className="text-[11px] text-slate-500">
                Your dedication makes a difference in every patient&apos;s journey.
              </div>
            </div>
          </div>
          </>
        }
        rightPanelWidth="lg:w-[380px] xl:w-[420px] 2xl:w-[460px]"
      >
          {/* Filter Tabs (Today, Upcoming, Completed, Cancelled) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'today', label: 'Today (2)' },
              { id: 'upcoming', label: 'Upcoming (5)' },
              { id: 'completed', label: 'Completed (25)' },
              { id: 'cancelled', label: 'Cancelled (3)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, phone, or ID..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs shrink-0">
              <Filter className="w-4 h-4 text-slate-500" />
              <span>Filter</span>
            </button>
          </div>

          {/* Section 1: Today's Appointments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Today&apos;s Appointments</h3>
                <p className="text-[11px] text-slate-400">2 appointments scheduled for today.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-5">Patient</th>
                    <th className="py-3 px-5">Age / Gender</th>
                    <th className="py-3 px-5">Reason</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {todayAppointments.map((apt) => {
                    const isSelected = selectedAppointment.id === apt.id;
                    return (
                      <tr
                        key={apt.id}
                        onClick={() => handleSelectApt(apt)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-700 whitespace-nowrap">
                          {apt.time.split(' - ')[0]}
                          <div className="text-[10px] text-slate-400 font-normal">
                            - {apt.time.split(' - ')[1]}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={apt.avatar}
                              alt={apt.patientName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{apt.patientName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{apt.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                          {apt.age} / {apt.gender}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">{apt.reason}</td>
                        <td className="py-3.5 px-5">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                            {apt.department}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                              apt.status === 'In Progress'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectApt(apt);
                                handleOpenPatientProfile();
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              View
                            </button>
                            <button className="p-1 rounded text-slate-400 hover:text-slate-600">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Upcoming Appointments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 px-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Upcoming Appointments</h3>
              <p className="text-[11px] text-slate-400">5 appointments scheduled in the future.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-5">Patient</th>
                    <th className="py-3 px-5">Age / Gender</th>
                    <th className="py-3 px-5">Reason</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {UPCOMING_APPOINTMENTS_PAGE.map((apt) => (
                    <tr
                      key={apt.id}
                      onClick={() => handleSelectApt(apt)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-bold text-slate-700">{apt.date}</div>
                        <div className="text-[10px] text-slate-400">{apt.time}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={apt.avatar}
                            alt={apt.patientName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{apt.patientName}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{apt.patientId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                        {apt.age} / {apt.gender}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{apt.reason}</td>
                      <td className="py-3.5 px-5">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                          {apt.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 whitespace-nowrap">
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectApt(apt);
                              handleOpenPatientProfile();
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            View
                          </button>
                          <button className="p-1 rounded text-slate-400 hover:text-slate-600">
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
      </DoctorPageShell>

      {/* Slide-over Patient Drawer */}
      <DoctorPatientDrawer
        patient={INITIAL_PATIENTS.find((p) => p.name === selectedAppointment.patientName) ?? INITIAL_PATIENTS[0] ?? null}
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
