'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarClock,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Tag,
  Loader2,
  RefreshCw,
  ArrowRightLeft,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchQueue, updateQueueEntry, fetchDoctors, fetchDepartments } from '../../../lib/api';
import type { QueueEntryDTO, DoctorDTO, ClinicDepartmentDTO } from '@mcms/contracts';
import type { QueueTransferTarget } from '../../../components/receptionist/TransferQueueModal';
import type { TicketPrintData } from '../../../components/receptionist/QueueTicketModal';

const CheckInModal = dynamic(() => import('../../../components/receptionist/CheckInModal'), { ssr: false });
const TransferQueueModal = dynamic(() => import('../../../components/receptionist/TransferQueueModal'), { ssr: false });
const QueueTicketModal = dynamic(() => import('../../../components/receptionist/QueueTicketModal'), { ssr: false });

export interface DisplayQueuePatient {
  id: string;
  queueNo: string;
  patientName: string;
  pid: string;
  age: string;
  gender: string;
  visitType: string;
  department: string;
  departmentId?: string | null | undefined;
  doctor: string;
  assignedDoctorId?: string | null | undefined;
  roomId?: string | null | undefined;
  waitingTime: string;
  checkInTime: string;
  status: 'Waiting' | 'In Consultation' | 'Completed';
  rawStatus: string;
  priority: string;
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '08:00 AM';
  }
}

function getWaitingTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const diffMs = Math.max(0, Date.now() - d.getTime());
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  } catch {
    return '10 mins';
  }
}

function normalizeStatus(status: string): 'Waiting' | 'In Consultation' | 'Completed' {
  const upper = (status || '').toUpperCase();
  if (upper === 'COMPLETED' || upper === 'DONE') return 'Completed';
  if (upper === 'IN_CONSULTATION' || upper === 'CALLED' || upper === 'IN_PROGRESS') return 'In Consultation';
  return 'Waiting';
}

export default function CheckInQueuePage() {
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Waiting' | 'In Consultation' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<QueueTransferTarget | null>(null);
  const [ticketPrintData, setTicketPrintData] = useState<TicketPrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [rawQueue, setRawQueue] = useState<QueueEntryDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Fetch all queue data
  const loadData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [queueData, docsData, deptsData] = await Promise.all([
        fetchQueue(accessToken),
        fetchDoctors(accessToken),
        fetchDepartments(accessToken),
      ]);
      setRawQueue(queueData);
      setDoctors(docsData);
      setDepartments(deptsData);
      if (queueData.length > 0 && !selectedPatientId) {
        setSelectedPatientId(queueData[0]?.id ?? null);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedPatientId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Build mapped queue entries
  const patients: DisplayQueuePatient[] = useMemo(() => {
    const docMap = new Map(doctors.map((d) => [d.id, d.displayName]));
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    return rawQueue.map((item) => {
      const doctorName = item.assignedDoctorId ? docMap.get(item.assignedDoctorId) ?? 'Assigned Doctor' : 'General Duty';
      const departmentName = item.departmentId ? deptMap.get(item.departmentId) ?? 'General' : 'General';
      const status = normalizeStatus(item.status);

      return {
        id: item.id,
        queueNo: item.ticketNumber,
        patientName: item.patientName,
        pid: item.patientPid,
        age: '32',
        gender: 'Adult',
        visitType: item.priority === 'EMERGENCY' || item.priority === 'HIGH' ? 'Emergency' : item.priority === 'URGENT' ? 'Urgent' : 'Walk-in',
        department: departmentName,
        departmentId: item.departmentId,
        doctor: doctorName,
        assignedDoctorId: item.assignedDoctorId,
        roomId: item.roomId,
        waitingTime: getWaitingTime(item.checkInTime),
        checkInTime: formatTime(item.checkInTime),
        status,
        rawStatus: item.status,
        priority: item.priority || 'NORMAL',
      };
    });
  }, [rawQueue, doctors, departments]);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) ?? patients[0] ?? null;
  }, [patients, selectedPatientId]);

  // Tab counts
  const waitingCount = patients.filter((p) => p.status === 'Waiting').length;
  const inConsultCount = patients.filter((p) => p.status === 'In Consultation').length;
  const completedCount = patients.filter((p) => p.status === 'Completed').length;
  const totalCount = patients.length;

  // Filter patients by tab and search
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesFilter = filterTab === 'All' || p.status === filterTab;
      const matchesSearch =
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.queueNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.doctor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [patients, filterTab, searchQuery]);

  // Actions
  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleCallPatient = async (id: string) => {
    if (!accessToken) return;
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { status: 'IN_CONSULTATION' }, accessToken);
      showFeedback('Patient marked as In Consultation');
      await loadData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to call patient.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteVisit = async (id: string) => {
    if (!accessToken) return;
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { status: 'COMPLETED' }, accessToken);
      showFeedback('Visit marked as Completed');
      await loadData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to complete visit.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelTicket = async (id: string, patientName: string) => {
    if (!accessToken) return;
    if (!window.confirm(`Are you sure you want to cancel the queue ticket for ${patientName}?`)) return;
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { status: 'CANCELLED' }, accessToken);
      showFeedback('Ticket cancelled successfully');
      await loadData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to cancel ticket.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePriority = async (id: string, newPriority: string) => {
    if (!accessToken) return;
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { priority: newPriority }, accessToken);
      showFeedback(`Priority updated to ${newPriority}`);
      await loadData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to update priority.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenPrintSlip = (p: DisplayQueuePatient) => {
    setTicketPrintData({
      ticketNumber: p.queueNo,
      patientName: p.patientName,
      patientPid: p.pid,
      departmentName: p.department,
      doctorName: p.doctor,
      checkInTime: p.checkInTime,
      priority: p.priority,
    });
  };

  // KPIs
  const queueKpis: Array<{
    title: string;
    value: string;
    suffix?: string | undefined;
    change?: string | undefined;
    trend?: 'up' | 'down' | undefined;
    iconName?: ('users' | 'calendar' | 'check-circle' | 'receipt' | 'clock' | 'dollar') | undefined;
    color?: ('blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose') | undefined;
  }> = [
    { title: 'Total in Queue', value: String(totalCount), change: 'Today', iconName: 'users', color: 'blue' },
    { title: 'Currently Waiting', value: String(waitingCount), suffix: 'pts', change: 'Live', trend: 'up', iconName: 'clock', color: 'amber' },
    { title: 'In Consultation', value: String(inConsultCount), suffix: 'pts', change: 'With doctors', trend: 'up', iconName: 'check-circle', color: 'cyan' },
    { title: 'Completed Visits', value: String(completedCount), change: 'Finished', trend: 'up', iconName: 'check-circle', color: 'emerald' },
  ];

  // Donut summary
  const queueDonutData = [
    { name: 'Waiting', value: waitingCount, color: '#F59E0B' },
    { name: 'In Consultation', value: inConsultCount, color: '#2563EB' },
    { name: 'Completed', value: completedCount, color: '#10B981' },
  ];

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Check-in / Queue Management"
            subtitle="Manage patient check-ins, view real-time queue, and track consultation status."
            icon={CalendarClock}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadData()}
                  title="Refresh Queue"
                  className="flex items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold shadow-2xs border border-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setCheckInModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Check In Patient
                </button>
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {queueKpis.map((kpi, idx) => (
              <ReceptionistStatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                suffix={kpi.suffix}
                change={kpi.change}
                trend={kpi.trend}
                iconName={kpi.iconName}
                color={kpi.color}
              />
            ))}
          </div>
        }
        subnav={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'All', label: 'All', count: totalCount },
                { id: 'Waiting', label: 'Waiting', count: waitingCount },
                { id: 'In Consultation', label: 'In Consultation', count: inConsultCount },
                { id: 'Completed', label: 'Completed', count: completedCount },
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id as typeof filterTab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, queue number, or patient ID..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shrink-0"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
          </div>
        }
        rightPanelWidth="lg:w-[320px] xl:w-[350px] 2xl:w-[380px]"
        rightPanel={
          <div className="space-y-3.5">
            {/* Patient Information */}
            {selectedPatient ? (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-800">Patient Details</h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {selectedPatient.queueNo}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0 ring-2 ring-blue-500/20 text-sm">
                    {selectedPatient.patientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-900 truncate">{selectedPatient.patientName}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{selectedPatient.pid}</div>
                    <div className="text-xs text-blue-600 font-bold mt-0.5">{selectedPatient.doctor}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Visit Type</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.visitType}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Department</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.department}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Check-in</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.checkInTime}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className="font-bold text-blue-700 mt-0.5 block">{selectedPatient.status}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs flex justify-between items-center">
                  <span className="text-blue-700 font-semibold">Waiting Time:</span>
                  <span className="font-black text-blue-900">{selectedPatient.waitingTime}</span>
                </div>

                {/* Priority Quick Picker */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Normal', val: 'NORMAL' },
                      { label: 'Urgent', val: 'URGENT' },
                      { label: 'Emergency', val: 'EMERGENCY' },
                    ].map((p) => {
                      const isCurrent = selectedPatient.priority === p.val;
                      return (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => void handleUpdatePriority(selectedPatient.id, p.val)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 border border-slate-200/80 shadow-2xs text-center text-slate-400 text-xs">
                No patient selected
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Queue Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCheckInModalOpen(true)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Check In</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedPatient}
                  onClick={() => {
                    if (selectedPatient) {
                      setTransferTarget({
                        id: selectedPatient.id,
                        ticketNumber: selectedPatient.queueNo,
                        patientName: selectedPatient.patientName,
                        patientPid: selectedPatient.pid,
                        departmentId: selectedPatient.departmentId,
                        assignedDoctorId: selectedPatient.assignedDoctorId,
                        roomId: selectedPatient.roomId,
                        priority: selectedPatient.priority,
                      });
                    }
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-40 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Transfer</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedPatient}
                  onClick={() => {
                    if (selectedPatient) handleOpenPrintSlip(selectedPatient);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-40 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Print Ticket</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedPatient}
                  onClick={() => {
                    if (selectedPatient) void handleCancelTicket(selectedPatient.id, selectedPatient.patientName);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 disabled:opacity-40 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-700">Cancel Ticket</span>
                </button>
              </div>
            </div>

            {/* Queue Summary Donut */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Queue Summary</h2>
              </div>
              <div className="relative h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalCount > 0 ? queueDonutData : [{ name: 'Empty', value: 1, color: '#e2e8f0' }]}
                      innerRadius={45}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {(totalCount > 0 ? queueDonutData : [{ name: 'Empty', value: 1, color: '#e2e8f0' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-lg font-black text-slate-900 leading-none">{totalCount}</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                {queueDonutData.map((item) => {
                  const pct = totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 font-medium">{item.name}</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {item.value} <span className="font-normal text-slate-400">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        }
      >
        {/* ─── Main: Patient Queue Table + Bottom Tables ─── */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Patient Queue Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Live Patient Queue</h2>
              </div>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2.5 font-medium">Queue #</th>
                    <th className="pb-2.5 font-medium">Patient Name</th>
                    <th className="pb-2.5 font-medium">Visit Type</th>
                    <th className="pb-2.5 font-medium">Department</th>
                    <th className="pb-2.5 font-medium">Doctor</th>
                    <th className="pb-2.5 font-medium">Wait</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        {loading ? 'Loading queue entries...' : 'No queue entries found for this filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => {
                      const isSelected = selectedPatient?.id === patient.id;
                      const isUpdating = updatingId === patient.id;

                      return (
                        <tr
                          key={patient.id}
                          onClick={() => setSelectedPatientId(patient.id)}
                          className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <td className="py-2.5 font-black text-blue-600 whitespace-nowrap">{patient.queueNo}</td>
                          <td className="py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {patient.patientName.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 leading-tight">{patient.patientName}</div>
                                <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{patient.pid}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600">{patient.visitType}</td>
                          <td className="py-2.5 text-slate-600">{patient.department}</td>
                          <td className="py-2.5 text-slate-600 whitespace-nowrap">{patient.doctor}</td>
                          <td className="py-2.5 text-slate-600">{patient.waitingTime}</td>
                          <td className="py-2.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                patient.status === 'In Consultation'
                                  ? 'bg-blue-100 text-blue-700'
                                  : patient.status === 'Waiting'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {patient.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              {patient.status === 'Waiting' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void handleCallPatient(patient.id)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? 'Calling...' : 'Call'}
                                </button>
                              )}
                              {patient.status === 'In Consultation' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void handleCompleteVisit(patient.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? 'Completing...' : 'Finish'}
                                </button>
                              )}
                              <button
                                type="button"
                                title="Transfer patient to doctor or room"
                                onClick={() =>
                                  setTransferTarget({
                                    id: patient.id,
                                    ticketNumber: patient.queueNo,
                                    patientName: patient.patientName,
                                    patientPid: patient.pid,
                                    departmentId: patient.departmentId,
                                    assignedDoctorId: patient.assignedDoctorId,
                                    roomId: patient.roomId,
                                    priority: patient.priority,
                                  })
                                }
                                className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded text-purple-600 transition"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Print queue ticket"
                                onClick={() => handleOpenPrintSlip(patient)}
                                className="p-1 hover:text-blue-700 hover:bg-blue-50 rounded text-slate-400 transition"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              {patient.status !== 'Completed' && (
                                <button
                                  type="button"
                                  title="Cancel ticket"
                                  onClick={() => void handleCancelTicket(patient.id, patient.patientName)}
                                  className="p-1 hover:text-rose-700 hover:bg-rose-50 rounded text-slate-300 transition"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
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

            {/* Pagination footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div>Showing {filteredPatients.length} of {totalCount} patients</div>
            </div>
          </div>

          {/* Bottom Split: Recent Check-ins & Completed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Today's Check-ins */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Today&apos;s Check-ins</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Patient Name</th>
                      <th className="pb-2 font-medium">Queue #</th>
                      <th className="pb-2 font-medium">Department</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-2 text-slate-500 whitespace-nowrap">{item.checkInTime}</td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap">{item.patientName}</td>
                        <td className="py-2 font-bold text-blue-600">{item.queueNo}</td>
                        <td className="py-2 text-slate-600">{item.department}</td>
                        <td className="py-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {patients.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">No check-ins yet today.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Completed Visits */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Completed Visits</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Patient Name</th>
                      <th className="pb-2 font-medium">Doctor</th>
                      <th className="pb-2 font-medium">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.filter((p) => p.status === 'Completed').slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-2 text-slate-500 whitespace-nowrap">{item.checkInTime}</td>
                        <td className="py-2 font-bold text-slate-800 whitespace-nowrap">{item.patientName}</td>
                        <td className="py-2 text-slate-600 whitespace-nowrap">{item.doctor}</td>
                        <td className="py-2 text-slate-600">{item.department}</td>
                      </tr>
                    ))}
                    {patients.filter((p) => p.status === 'Completed').length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">No completed visits yet today.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Floating Action Feedback Toast */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionFeedback}
        </div>
      )}

      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
          onSuccess={() => void loadData()}
        />
      )}
      {transferTarget && (
        <TransferQueueModal
          isOpen={Boolean(transferTarget)}
          target={transferTarget}
          onClose={() => setTransferTarget(null)}
          onSuccess={() => void loadData()}
        />
      )}
      {ticketPrintData && (
        <QueueTicketModal
          isOpen={Boolean(ticketPrintData)}
          ticket={ticketPrintData}
          onClose={() => setTicketPrintData(null)}
        />
      )}
    </>
  );
}