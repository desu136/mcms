'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Heart,
  Pill,
  FlaskConical,
  FileText,
  MessageSquare,
  User,
  Phone,
  RefreshCw,
} from 'lucide-react';
import type { AppointmentDTO, PatientDTO } from '@mcms/contracts';
import {
  PatientItem,
} from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import DoctorStatCard from '../../../components/doctor/DoctorStatCard';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchAppointments, updateAppointment } from '../../../lib/api/appointments';
import { fetchPatients } from '../../../lib/api/patients';

export default function DoctorAppointmentsPage() {
  const { accessToken, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0]!;
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayLabel = now.toLocaleDateString('en-US', { weekday: 'long' });

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [apptRes, patRes] = await Promise.allSettled([
        fetchAppointments(accessToken),
        fetchPatients(accessToken, { limit: 50 }),
      ]);
      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value);
        if (apptRes.value.length > 0 && !selectedAppointment) {
          setSelectedAppointment(apptRes.value[0] || null);
        }
      }
      if (patRes.status === 'fulfilled') {
        setPatients(patRes.value.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedAppointment]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, status: string) => {
    if (!accessToken) return;
    setIsUpdating(true);
    try {
      const updated = await updateAppointment(id, { status }, accessToken);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(updated);
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectApt = (apt: AppointmentDTO) => {
    setSelectedAppointment(apt);
  };

  // Find linked patient for the selected appointment
  const matchedPatient = patients.find((p) => p.id === selectedAppointment?.patientId);

  const patientDrawerItem: PatientItem | null = matchedPatient
    ? {
        id: matchedPatient.id,
        name: matchedPatient.fullName || `${matchedPatient.firstName} ${matchedPatient.lastName}`.trim(),
        pid: matchedPatient.pid || matchedPatient.id.slice(0, 8),
        age: matchedPatient.dateOfBirth
          ? Math.max(0, new Date().getFullYear() - new Date(matchedPatient.dateOfBirth).getFullYear())
          : 30,
        gender: matchedPatient.gender === 'FEMALE' ? 'Female' : 'Male',
        phone: matchedPatient.phoneNumber || '—',
        email: matchedPatient.email || '—',
        address: matchedPatient.address || 'Addis Ababa, Ethiopia',
        department: selectedAppointment?.type || 'General Medicine',
        lastVisit: 'Recent',
        lastVisitReason: selectedAppointment?.reason || 'Consultation',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        totalVisits: 1,
        conditions: [
          {
            title: selectedAppointment?.reason || 'Consultation',
            diagnosedDate: '2026',
            status: 'Active',
            type: 'general',
          },
        ],
      }
    : selectedAppointment
    ? {
        id: selectedAppointment.patientId,
        name: selectedAppointment.patientName,
        pid: selectedAppointment.patientPid || selectedAppointment.patientId.slice(0, 8),
        age: 30,
        gender: 'Female',
        phone: '—',
        email: '—',
        address: 'Addis Ababa, Ethiopia',
        department: selectedAppointment.type || 'General Medicine',
        lastVisit: selectedAppointment.appointmentDate || 'Today',
        lastVisitReason: selectedAppointment.reason || 'Consultation',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        totalVisits: 1,
        conditions: [],
      }
    : null;

  // Tab filtering
  const todayList = appointments.filter((a) => a.appointmentDate === todayStr);
  const upcomingList = appointments.filter(
    (a) => a.appointmentDate > todayStr || (a.status === 'SCHEDULED' && a.appointmentDate >= todayStr),
  );
  const completedList = appointments.filter((a) => a.status === 'COMPLETED');
  const cancelledList = appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW');

  const filteredAppointments = (
    activeTab === 'today'
      ? todayList
      : activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'completed'
      ? completedList
      : cancelledList
  ).filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.patientName.toLowerCase().includes(q) ||
      (a.patientPid && a.patientPid.toLowerCase().includes(q)) ||
      (a.reason && a.reason.toLowerCase().includes(q)) ||
      (a.doctorName && a.doctorName.toLowerCase().includes(q))
    );
  });

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
          <div className="text-xs font-bold text-slate-800 tracking-tight">{dateLabel}</div>
          <div className="text-[10px] text-slate-400 font-medium leading-none">{dayLabel}</div>
        </div>
        <button
          onClick={() => void loadData()}
          title="Refresh"
          className="ml-2 border-l border-slate-200 pl-2 text-slate-400 hover:text-blue-600 p-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <DoctorStatCard
        title="Total Appointments"
        value={isLoading ? '—' : appointments.length}
        icon={CalendarDays}
        color="blue"
      />
      <DoctorStatCard
        title="Completed"
        value={isLoading ? '—' : completedList.length}
        icon={CheckCircle2}
        color="emerald"
      />
      <DoctorStatCard
        title="Upcoming"
        value={isLoading ? '—' : upcomingList.length}
        icon={Clock}
        color="cyan"
      />
      <DoctorStatCard
        title="Cancelled"
        value={isLoading ? '—' : cancelledList.length}
        icon={XCircle}
        color="rose"
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
          {/* Appointment Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Appointment Details</h3>
              </div>
              {selectedAppointment && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  selectedAppointment.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : selectedAppointment.status === 'IN_CONSULTATION'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : selectedAppointment.status === 'CANCELLED'
                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                    : 'bg-cyan-50 text-cyan-600 border-cyan-100'
                }`}>
                  {selectedAppointment.status}
                </span>
              )}
            </div>

            {selectedAppointment ? (
              <>
                {/* Patient Header */}
                <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center ring-2 ring-blue-500/20 shadow-2xs shrink-0">
                    {selectedAppointment.patientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-slate-800 truncate">
                      {selectedAppointment.patientName}
                    </div>
                    <div className="text-xs text-blue-600 font-semibold mb-1">
                      {selectedAppointment.patientPid || selectedAppointment.patientId}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {matchedPatient?.gender === 'FEMALE' ? 'Female' : 'Male'} • {matchedPatient?.dateOfBirth ? `${Math.max(0, new Date().getFullYear() - new Date(matchedPatient.dateOfBirth).getFullYear())} yrs` : 'Adult'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{matchedPatient?.phoneNumber || 'No phone'}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Meta Info */}
                <div className="py-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Date & Time
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedAppointment.appointmentDate} {selectedAppointment.startTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" /> Type
                    </span>
                    <span className="font-bold text-slate-800">{selectedAppointment.type || 'Consultation'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Reason
                    </span>
                    <span className="font-bold text-slate-800">{selectedAppointment.reason || 'General Checkup'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Doctor
                    </span>
                    <span className="font-bold text-slate-800">{selectedAppointment.doctorName || 'Dr. Assigned'}</span>
                  </div>
                </div>

                {/* Status transition buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {selectedAppointment.status !== 'IN_CONSULTATION' && selectedAppointment.status !== 'COMPLETED' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => void handleStatusChange(selectedAppointment.id, 'IN_CONSULTATION')}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Clock className="w-3.5 h-3.5" /> Start Consultation
                    </button>
                  )}
                  {selectedAppointment.status === 'IN_CONSULTATION' && (
                    <button
                      disabled={isUpdating}
                      onClick={() => void handleStatusChange(selectedAppointment.id, 'COMPLETED')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete Consultation
                    </button>
                  )}
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" /> View Patient Profile
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Select an appointment to view details
              </div>
            )}
          </div>

          {/* Quick Actions (Appointments Card) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!selectedAppointment}
                onClick={() => setPrescriptionModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group disabled:opacity-50 cursor-pointer"
              >
                <Pill className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Add Prescription</div>
              </button>
              <button
                disabled={!selectedAppointment}
                onClick={() => setLabModalOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group disabled:opacity-50 cursor-pointer"
              >
                <FlaskConical className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Order Lab Test</div>
              </button>
              <button
                disabled={!selectedAppointment}
                onClick={() => setDrawerOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group disabled:opacity-50 cursor-pointer"
              >
                <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Patient Record</div>
              </button>
              <button
                disabled={!selectedAppointment}
                onClick={() => alert(`Opening doctor messaging with ${selectedAppointment?.patientName}`)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-center transition-all group disabled:opacity-50 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Send Message</div>
              </button>
            </div>
          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Today&apos;s Schedule
            </h3>
            {todayList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No appointments for today.</p>
            ) : (
              <div className="space-y-3">
                {todayList.slice(0, 4).map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => handleSelectApt(apt)}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      apt.status === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : apt.status === 'IN_CONSULTATION'
                        ? 'bg-blue-500'
                        : 'bg-cyan-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {apt.startTime} • {apt.patientName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{apt.reason || apt.type}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'today', label: `Today (${todayList.length})` },
            { id: 'upcoming', label: `Upcoming (${upcomingList.length})` },
            { id: 'completed', label: `Completed (${completedList.length})` },
            { id: 'cancelled', label: `Cancelled (${cancelledList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, PID, doctor, or reason..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 capitalize">{activeTab} Appointments</h3>
              <p className="text-[11px] text-slate-400">
                {filteredAppointments.length} appointment{filteredAppointments.length === 1 ? '' : 's'} listed
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-5">Date & Time</th>
                  <th className="py-3 px-5">Patient</th>
                  <th className="py-3 px-5">Type / Department</th>
                  <th className="py-3 px-5">Reason</th>
                  <th className="py-3 px-5">Doctor</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Loading appointments...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No appointments found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const isSelected = selectedAppointment?.id === apt.id;
                    return (
                      <tr
                        key={apt.id}
                        onClick={() => handleSelectApt(apt)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-700 whitespace-nowrap">
                          {apt.startTime}
                          <div className="text-[10px] text-slate-400 font-normal">
                            {apt.appointmentDate}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {apt.patientName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{apt.patientName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {apt.patientPid || apt.patientId.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                            {apt.type || 'Consultation'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium max-w-xs truncate">
                          {apt.reason || 'General Visit'}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                          {apt.doctorName || 'Doctor'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                              apt.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : apt.status === 'IN_CONSULTATION'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : apt.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
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
                                setDrawerOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              View
                            </button>
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
      </DoctorPageShell>

      {/* Slide-over Patient Drawer */}
      <DoctorPatientDrawer
        patient={patientDrawerItem}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onOpenLabModal={() => setLabModalOpen(true)}
      />

      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        patientId={selectedAppointment?.patientId}
        patientName={selectedAppointment?.patientName}
      />

      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        patientId={selectedAppointment?.patientId}
        patientName={selectedAppointment?.patientName}
      />
    </>
  );
}
