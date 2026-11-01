'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Users,
  Calendar,
  Heart,
  Pill,
  FlaskConical,
  FileText,
  User,
  Phone,
  RefreshCw,
  Play,
  Check,
  X,
  Volume2,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { AppointmentDTO, PatientDTO, QueueEntryDTO } from '@mcms/contracts';
import { PatientItem } from '../../../components/doctor/doctorMockData';
import DoctorPatientDrawer from '../../../components/doctor/DoctorPatientDrawer';
import DoctorPrescriptionModal from '../../../components/doctor/DoctorPrescriptionModal';
import DoctorLabOrderModal from '../../../components/doctor/DoctorLabOrderModal';
import DoctorPageShell from '../../../components/doctor/DoctorPageShell';
import DoctorStatCard from '../../../components/doctor/DoctorStatCard';
import { useAuth } from '../../../lib/auth/auth-context';
import {
  fetchAppointments,
  updateAppointment,
  fetchQueue,
  updateQueueEntry,
} from '../../../lib/api/appointments';
import { fetchPatients } from '../../../lib/api/patients';

export default function DoctorAppointmentsPage() {
  const { accessToken, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'queue' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntryDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDTO | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<QueueEntryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals & drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPatientItem, setDrawerPatientItem] = useState<PatientItem | null>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [modalPatientId, setModalPatientId] = useState<string>('');
  const [modalPatientName, setModalPatientName] = useState<string>('');

  // Complete consultation modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diagnosisInput, setDiagnosisInput] = useState('');

  const todayStr = new Date().toISOString().split('T')[0]!;
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayLabel = now.toLocaleDateString('en-US', { weekday: 'long' });

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [apptRes, queueRes, patRes] = await Promise.allSettled([
        fetchAppointments(accessToken),
        fetchQueue(accessToken),
        fetchPatients(accessToken, { limit: 100 }),
      ]);
      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value);
        if (apptRes.value.length > 0 && !selectedAppointment) {
          setSelectedAppointment(apptRes.value[0] || null);
        }
      }
      if (queueRes.status === 'fulfilled') {
        setQueueEntries(queueRes.value);
        if (queueRes.value.length > 0 && !selectedQueue) {
          setSelectedQueue(queueRes.value[0] || null);
        }
      }
      if (patRes.status === 'fulfilled') {
        setPatients(patRes.value.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedAppointment, selectedQueue]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const isToday = (d?: string | null) => (d ? d.split('T')[0] === todayStr : false);

  const todayList = appointments.filter((a) => isToday(a.appointmentDate));
  const activeQueueList = queueEntries.filter((q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED');
  const upcomingList = appointments.filter(
    (a) =>
      a.appointmentDate.split('T')[0]! > todayStr ||
      (a.status === 'SCHEDULED' && a.appointmentDate.split('T')[0]! >= todayStr),
  );
  const completedList = appointments.filter((a) => a.status === 'COMPLETED');
  const cancelledList = appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW');

  // Active items based on current tab
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

  const filteredQueue = activeQueueList.filter((q) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.patientName.toLowerCase().includes(s) ||
      (q.patientPid && q.patientPid.toLowerCase().includes(s)) ||
      q.ticketNumber.toLowerCase().includes(s)
    );
  });

  // Appointment Status Handling
  const handleStatusChange = async (id: string, status: string, notes?: string) => {
    if (!accessToken) return;
    setIsUpdating(true);
    try {
      const payload: { status: string; notes?: string } = { status };
      if (notes) payload.notes = notes;
      const updated = await updateAppointment(id, payload, accessToken);
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

  // Queue Status Handling
  const handleQueueStatusChange = async (id: string, status: string) => {
    if (!accessToken) return;
    setIsUpdating(true);
    try {
      const updated = await updateQueueEntry(id, { status, assignedDoctorId: user?.id }, accessToken);
      setQueueEntries((prev) => prev.map((q) => (q.id === id ? updated : q)));
      if (selectedQueue?.id === id) {
        setSelectedQueue(updated);
      }
    } catch (err) {
      console.error('Failed to update queue status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenCompleteModal = (apt: AppointmentDTO) => {
    setSelectedAppointment(apt);
    setDiagnosisInput(apt.reason || '');
    setConsultationNotes(apt.notes || '');
    setCompleteModalOpen(true);
  };

  const handleConfirmCompleteConsultation = async () => {
    if (!selectedAppointment || !accessToken) return;
    setIsUpdating(true);
    try {
      const finalNotes = [
        diagnosisInput.trim() ? `Diagnosis: ${diagnosisInput.trim()}` : '',
        consultationNotes.trim() ? `Notes: ${consultationNotes.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      await handleStatusChange(selectedAppointment.id, 'COMPLETED', finalNotes || undefined);
      setCompleteModalOpen(false);
      setDiagnosisInput('');
      setConsultationNotes('');
    } finally {
      setIsUpdating(false);
    }
  };

  const openDrawerForPatient = (patientId: string, patientName: string, patientPid?: string) => {
    const matched = patients.find((p) => p.id === patientId);
    if (matched) {
      setDrawerPatientItem({
        id: matched.id,
        name: matched.fullName || `${matched.firstName} ${matched.lastName}`.trim(),
        pid: matched.pid || matched.id.slice(0, 8),
        age: matched.dateOfBirth
          ? Math.max(0, new Date().getFullYear() - new Date(matched.dateOfBirth).getFullYear())
          : 30,
        gender: matched.gender === 'FEMALE' ? 'Female' : 'Male',
        phone: matched.phoneNumber || '—',
        email: matched.email || '—',
        address: matched.address || 'Addis Ababa, Ethiopia',
        department: 'General Practice',
        lastVisit: 'Recent',
        lastVisitReason: 'Clinical Consultation',
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(matched.fullName)}`,
        totalVisits: 1,
        conditions: [],
      });
    } else {
      setDrawerPatientItem({
        id: patientId,
        name: patientName,
        pid: patientPid || patientId.slice(0, 8),
        age: 30,
        gender: 'Female',
        phone: '—',
        email: '—',
        address: 'Addis Ababa, Ethiopia',
        department: 'General Medicine',
        lastVisit: 'Today',
        lastVisitReason: 'Consultation',
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patientName)}`,
        totalVisits: 1,
        conditions: [],
      });
    }
    setDrawerOpen(true);
  };

  const openPrescription = (patientId: string, patientName: string) => {
    setModalPatientId(patientId);
    setModalPatientName(patientName);
    setPrescriptionModalOpen(true);
  };

  const openLabOrder = (patientId: string, patientName: string) => {
    setModalPatientId(patientId);
    setModalPatientName(patientName);
    setLabModalOpen(true);
  };

  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
          <Stethoscope className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Consultations &amp; Appointments
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your patient consultation stream, triage queue, and scheduled visits.
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
          className="ml-2 border-l border-slate-200 pl-2 text-slate-400 hover:text-blue-600 p-1 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <DoctorStatCard
        title="Today's Appointments"
        value={isLoading ? '—' : todayList.length}
        icon={CalendarDays}
        color="blue"
      />
      <DoctorStatCard
        title="Live Waiting Queue"
        value={isLoading ? '—' : activeQueueList.length}
        icon={Users}
        color="orange"
      />
      <DoctorStatCard
        title="Completed Visits"
        value={isLoading ? '—' : completedList.length}
        icon={CheckCircle2}
        color="emerald"
      />
      <DoctorStatCard
        title="Upcoming Scheduled"
        value={isLoading ? '—' : upcomingList.length}
        icon={Clock}
        color="purple"
      />
    </div>
  );

  const renderSelectedAppointmentPanel = () => {
    if (!selectedAppointment) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-8 text-center text-xs text-slate-400">
          Select an appointment from the list to view clinical actions.
        </div>
      );
    }

    const isInProgress =
      selectedAppointment.status === 'IN_PROGRESS' ||
      selectedAppointment.status === 'IN_CONSULTATION';

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Consultation Console
            </h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              selectedAppointment.status === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isInProgress
                ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                : selectedAppointment.status === 'CANCELLED'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-cyan-50 text-cyan-700 border-cyan-200'
            }`}
          >
            {selectedAppointment.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Patient Identity */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center ring-2 ring-blue-500/20 shadow-2xs shrink-0">
            {selectedAppointment.patientName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {selectedAppointment.patientName}
            </h4>
            <p className="text-xs font-bold text-blue-600">
              {selectedAppointment.patientPid || selectedAppointment.patientId.slice(0, 8)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Scheduled: {selectedAppointment.startTime} • {selectedAppointment.type}
            </p>
          </div>
        </div>

        {/* Appointment Metadata */}
        <div className="bg-slate-50/80 rounded-xl p-3 space-y-2 text-xs border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Chief Complaint:</span>
            <span className="font-bold text-slate-800">{selectedAppointment.reason || 'General Routine Visit'}</span>
          </div>
          {selectedAppointment.notes && (
            <div className="pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-500 font-semibold block mb-0.5">Clinical Notes:</span>
              <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60 font-mono text-[11px]">
                {selectedAppointment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Status Action Buttons */}
        <div className="space-y-2 pt-1">
          {!isInProgress && selectedAppointment.status !== 'COMPLETED' && (
            <button
              disabled={isUpdating}
              onClick={() => void handleStatusChange(selectedAppointment.id, 'IN_PROGRESS')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Consultation</span>
            </button>
          )}

          {isInProgress && (
            <button
              disabled={isUpdating}
              onClick={() => handleOpenCompleteModal(selectedAppointment)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Consultation &amp; Sign Off</span>
            </button>
          )}

          {/* Clinical Workspace Shortcuts */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => openPrescription(selectedAppointment.patientId, selectedAppointment.patientName)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-center transition-all cursor-pointer flex flex-col items-center gap-1 group"
            >
              <Pill className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-700">Prescription</span>
            </button>

            <button
              onClick={() => openLabOrder(selectedAppointment.patientId, selectedAppointment.patientName)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-center transition-all cursor-pointer flex flex-col items-center gap-1 group"
            >
              <FlaskConical className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-700">Order Labs</span>
            </button>
          </div>

          <button
            onClick={() => openDrawerForPatient(selectedAppointment.patientId, selectedAppointment.patientName, selectedAppointment.patientPid)}
            className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Open Electronic Health Chart</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSelectedQueuePanel = () => {
    if (!selectedQueue) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-8 text-center text-xs text-slate-400">
          Select a waiting queue ticket to call or triage.
        </div>
      );
    }

    const isQueueInConsult = selectedQueue.status === 'IN_CONSULTATION';

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Waiting Queue Ticket
            </h3>
          </div>
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-mono">
            {selectedQueue.ticketNumber}
          </span>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 text-white font-extrabold text-lg flex items-center justify-center ring-2 ring-orange-500/20 shadow-2xs shrink-0">
            {selectedQueue.patientName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{selectedQueue.patientName}</h4>
            <p className="text-xs font-bold text-orange-600">{selectedQueue.patientPid || selectedQueue.patientId.slice(0, 8)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Priority: {selectedQueue.priority}</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          {selectedQueue.status === 'WAITING' && (
            <button
              disabled={isUpdating}
              onClick={() => void handleQueueStatusChange(selectedQueue.id, 'CALLED')}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Volume2 className="w-4 h-4" />
              <span>Call Patient (Turn on Chime)</span>
            </button>
          )}

          {!isQueueInConsult && selectedQueue.status !== 'COMPLETED' && (
            <button
              disabled={isUpdating}
              onClick={() => void handleQueueStatusChange(selectedQueue.id, 'IN_CONSULTATION')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Admit to Consultation Room</span>
            </button>
          )}

          {isQueueInConsult && (
            <button
              disabled={isUpdating}
              onClick={() => void handleQueueStatusChange(selectedQueue.id, 'COMPLETED')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Complete Consultation</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => openPrescription(selectedQueue.patientId, selectedQueue.patientName)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-center transition-all cursor-pointer flex flex-col items-center gap-1 group"
            >
              <Pill className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-700">Prescription</span>
            </button>

            <button
              onClick={() => openLabOrder(selectedQueue.patientId, selectedQueue.patientName)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-center transition-all cursor-pointer flex flex-col items-center gap-1 group"
            >
              <FlaskConical className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-700">Order Labs</span>
            </button>
          </div>

          <button
            onClick={() => openDrawerForPatient(selectedQueue.patientId, selectedQueue.patientName, selectedQueue.patientPid)}
            className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Open Health Chart</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <DoctorPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={activeTab === 'queue' ? renderSelectedQueuePanel() : renderSelectedAppointmentPanel()}
        rightPanelWidth="lg:w-[380px] xl:w-[420px] 2xl:w-[460px]"
      >
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'today', label: `Today's Appointments (${todayList.length})` },
            { id: 'queue', label: `Live Queue (${activeQueueList.length})` },
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
              placeholder="Search by patient name, PID, ticket number, or reason..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Main Content: Queue vs Appointments Table */}
        {activeTab === 'queue' ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Walk-in Triage &amp; Waiting Queue</h3>
                <p className="text-[11px] text-slate-400">
                  {filteredQueue.length} patient{filteredQueue.length === 1 ? '' : 's'} waiting for consultation
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-5">Ticket</th>
                    <th className="py-3 px-5">Patient</th>
                    <th className="py-3 px-5">Check-in Time</th>
                    <th className="py-3 px-5">Priority</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Loading waiting queue...
                      </td>
                    </tr>
                  ) : filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No patients currently waiting in queue.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((entry) => {
                      const isSelected = selectedQueue?.id === entry.id;
                      return (
                        <tr
                          key={entry.id}
                          onClick={() => setSelectedQueue(entry)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                            isSelected ? 'bg-orange-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-5 font-bold font-mono text-orange-600">
                            {entry.ticketNumber}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-800">{entry.patientName}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {entry.patientPid || entry.patientId.slice(0, 8)}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 font-medium whitespace-nowrap">
                            {new Date(entry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                entry.priority === 'EMERGENCY'
                                  ? 'bg-rose-100 text-rose-700'
                                  : entry.priority === 'URGENT'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {entry.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                entry.status === 'CALLED'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                                  : entry.status === 'IN_CONSULTATION'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                  : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                              }`}
                            >
                              {entry.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQueue(entry);
                                openDrawerForPatient(entry.patientId, entry.patientName, entry.patientPid);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              View Chart
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
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
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-5">Patient</th>
                    <th className="py-3 px-5">Type / Reason</th>
                    <th className="py-3 px-5">Doctor</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Loading appointments...
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No appointments found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => {
                      const isSelected = selectedAppointment?.id === apt.id;
                      const isInProg =
                        apt.status === 'IN_PROGRESS' || apt.status === 'IN_CONSULTATION';

                      return (
                        <tr
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
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
                          <td className="py-3.5 px-5 text-slate-600 font-medium">
                            <span className="flex items-center gap-1.5 font-bold text-slate-800">
                              <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                              {apt.type}
                            </span>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">{apt.reason || 'Routine Visit'}</div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                            {apt.doctorName || 'Doctor'}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                                apt.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : isInProg
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100 font-bold'
                                  : apt.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                              }`}
                            >
                              {apt.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(apt);
                                  openDrawerForPatient(apt.patientId, apt.patientName, apt.patientPid);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                View Chart
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
        )}
      </DoctorPageShell>

      {/* Slide-over Patient Drawer */}
      <DoctorPatientDrawer
        patient={drawerPatientItem}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenPrescriptionModal={(pId) => {
          setModalPatientId(pId);
          setModalPatientName(drawerPatientItem?.name || '');
          setPrescriptionModalOpen(true);
        }}
        onOpenLabModal={(pId) => {
          setModalPatientId(pId);
          setModalPatientName(drawerPatientItem?.name || '');
          setLabModalOpen(true);
        }}
      />

      {/* Prescription Modal */}
      <DoctorPrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        patientId={modalPatientId}
        patientName={modalPatientName}
      />

      {/* Lab Order Modal */}
      <DoctorLabOrderModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        patientId={modalPatientId}
        patientName={modalPatientName}
      />

      {/* Complete Consultation Dialog */}
      {completeModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Complete Consultation — {selectedAppointment.patientName}
                </h3>
              </div>
              <button
                onClick={() => setCompleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  placeholder="e.g. Acute upper respiratory infection, Type 2 Diabetes"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Encounter Summary &amp; Recommendations
                </label>
                <textarea
                  rows={3}
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Document patient progress, advice, follow-up plan..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void handleConfirmCompleteConsultation()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save &amp; Complete Visit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
