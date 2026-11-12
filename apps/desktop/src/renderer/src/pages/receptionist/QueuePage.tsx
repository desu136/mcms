import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Printer,
  FileText,
  UserCheck,
  Stethoscope,
  Database,
  ArrowRight,
  RefreshCw,
  Loader2,
  ArrowRightLeft,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import CheckInModal from '../../components/receptionist/CheckInModal';
import TransferQueueModal, { QueueTransferTarget } from '../../components/receptionist/TransferQueueModal';
import QueueTicketModal, { TicketPrintData } from '../../components/receptionist/QueueTicketModal';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import { fetchQueue, updateQueueEntry, fetchDoctors, fetchDepartments } from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { QueueEntryDTO, DoctorDTO, ClinicDepartmentDTO } from '@mcms/contracts';

interface QueuePageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

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

function formatTime(isoString?: string | null): string {
  if (!isoString) return '08:00 AM';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '08:00 AM';
  }
}

function getWaitingTime(isoString?: string | null): string {
  if (!isoString) return '5 mins';
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

function normalizeStatus(status?: string | null): 'Waiting' | 'In Consultation' | 'Completed' {
  const upper = (status || '').toUpperCase();
  if (upper === 'COMPLETED' || upper === 'DONE') return 'Completed';
  if (upper === 'IN_CONSULTATION' || upper === 'CALLED' || upper === 'IN_PROGRESS') return 'In Consultation';
  return 'Waiting';
}

export function QueuePage({ onNavigateTab }: QueuePageProps) {
  const { enqueueOperation } = useSync();
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Waiting' | 'In Consultation' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<QueueTransferTarget | null>(null);
  const [ticketPrintData, setTicketPrintData] = useState<TicketPrintData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [rawQueue, setRawQueue] = useState<QueueEntryDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const [queueData, docsData, deptsData] = await Promise.all([
        fetchQueue(accessToken),
        fetchDoctors(accessToken),
        fetchDepartments(accessToken),
      ]);
      setRawQueue(queueData || []);
      setDoctors(docsData || []);
      setDepartments(deptsData || []);
      if (queueData && queueData.length > 0 && !selectedPatientId) {
        setSelectedPatientId(queueData[0]?.id ?? null);
      }
    } catch (err) {
      console.warn('Failed to load live queue:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedPatientId]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

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

  const donutData = useMemo(() => [
    { name: 'Waiting', value: waitingCount, color: '#f59e0b' },
    { name: 'In Consultation', value: inConsultCount, color: '#2563eb' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
  ], [waitingCount, inConsultCount, completedCount]);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesFilter = filterTab === 'All' || p.status === filterTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.patientName.toLowerCase().includes(q) ||
        p.queueNo.toLowerCase().includes(q) ||
        p.pid.toLowerCase().includes(q) ||
        p.doctor.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [patients, filterTab, searchQuery]);

  // Actions
  const handleCallPatient = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { status: 'IN_CONSULTATION' }, accessToken);
      await enqueueOperation('queue_entry', id, 'UPDATE', { status: 'IN_CONSULTATION' });
      showFeedback('Patient marked as In Consultation');
      await loadQueue();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to call patient.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompletePatient = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { status: 'COMPLETED' }, accessToken);
      await enqueueOperation('queue_entry', id, 'UPDATE', { status: 'COMPLETED' });
      showFeedback('Visit marked as Completed');
      await loadQueue();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to complete visit.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelTicket = async (id: string, patientName: string) => {
    if (!window.confirm(`Are you sure you want to cancel the queue ticket for ${patientName}?`)) return;
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { status: 'CANCELLED' }, accessToken);
      await enqueueOperation('queue_entry', id, 'UPDATE', { status: 'CANCELLED' });
      showFeedback('Ticket cancelled successfully');
      await loadQueue();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to cancel ticket.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePriority = async (id: string, newPriority: string) => {
    setUpdatingId(id);
    try {
      await updateQueueEntry(id, { priority: newPriority }, accessToken);
      await enqueueOperation('queue_entry', id, 'UPDATE', { priority: newPriority });
      showFeedback(`Priority updated to ${newPriority}`);
      await loadQueue();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to update priority.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Live Patient Queue Management"
            subtitle="Monitor waiting times, doctor assignments, transfers and patient flow with offline SQLite queue tokens."
            icon={Clock}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadQueue()}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh Queue"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckInModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Issue Check-In Token</span>
                </button>
              </div>
            }
          />
        }
        subnav={
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'All', label: 'All', count: totalCount },
                { key: 'Waiting', label: 'Waiting', count: waitingCount },
                { key: 'In Consultation', label: 'In Consultation', count: inConsultCount },
                { key: 'Completed', label: 'Completed', count: completedCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterTab === tab.key
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search queue no, patient, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        }
        rightPanel={
          <div className="space-y-3.5">
            {/* Queue Summary Donut Chart */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Queue Breakdown</h2>
              </div>
              <div className="relative h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={45}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-lg font-black text-slate-900 leading-none">
                    {totalCount}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Total</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Patient Dossier */}
            {selectedPatient && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Ticket</div>
                  <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {selectedPatient.queueNo}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900">{selectedPatient.patientName}</div>
                <div className="text-xs text-slate-500 font-mono">PID: {selectedPatient.pid}</div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-bold text-slate-800">{selectedPatient.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-bold text-slate-800">{selectedPatient.doctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in:</span>
                    <span className="font-bold text-slate-800">{selectedPatient.checkInTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waiting Time:</span>
                    <span className="font-bold text-amber-600">{selectedPatient.waitingTime}</span>
                  </div>
                </div>

                {/* Quick actions for selected patient */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTicketPrintData({
                        ticketNumber: selectedPatient.queueNo,
                        patientName: selectedPatient.patientName,
                        patientPid: selectedPatient.pid,
                        departmentName: selectedPatient.department,
                        doctorName: selectedPatient.doctor,
                        checkInTime: selectedPatient.checkInTime,
                        priority: selectedPatient.priority,
                      });
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Queue Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
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
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer Patient</span>
                  </button>
                </div>
              </div>
            )}

            {/* Calling Alert Banner */}
            {actionFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-md animate-in fade-in space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Notification
                </div>
                <div className="text-xs font-bold">{actionFeedback}</div>
              </div>
            )}
          </div>
        }
      >
        {/* Queue Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Token</th>
                  <th className="pb-2.5">Patient Info</th>
                  <th className="pb-2.5">Doctor & Dept</th>
                  <th className="pb-2.5">Check-In</th>
                  <th className="pb-2.5">Wait Time</th>
                  <th className="pb-2.5">Priority</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && patients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span>Loading live queue...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No patients in queue matching your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isBusy = updatingId === item.id;
                    const isSelected = selectedPatient?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedPatientId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5">
                          <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-black font-mono text-xs border border-blue-200/60">
                            {item.queueNo}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900">{item.patientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.pid}</div>
                        </td>
                        <td className="py-2.5">
                          <div className="font-medium text-slate-800">{item.doctor}</div>
                          <div className="text-[10px] text-slate-400">{item.department}</div>
                        </td>
                        <td className="py-2.5 font-mono text-slate-600">{item.checkInTime}</td>
                        <td className="py-2.5 font-bold text-amber-600">{item.waitingTime}</td>
                        <td className="py-2.5">
                          <select
                            value={item.priority}
                            disabled={isBusy}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => void handleUpdatePriority(item.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-hidden ${
                              item.priority === 'EMERGENCY'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : item.priority === 'URGENT'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="NORMAL">Normal</option>
                            <option value="URGENT">Urgent</option>
                            <option value="EMERGENCY">Emergency</option>
                          </select>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'In Consultation'
                                ? 'bg-blue-100 text-blue-700'
                                : item.status === 'Waiting'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {item.status === 'Waiting' && (
                              <button
                                onClick={() => void handleCallPatient(item.id)}
                                disabled={isBusy}
                                type="button"
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isBusy ? 'Calling...' : 'Call'}
                              </button>
                            )}
                            {item.status === 'In Consultation' && (
                              <button
                                onClick={() => void handleCompletePatient(item.id)}
                                disabled={isBusy}
                                type="button"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isBusy ? 'Saving...' : 'Done'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setTransferTarget({
                                  id: item.id,
                                  ticketNumber: item.queueNo,
                                  patientName: item.patientName,
                                  patientPid: item.pid,
                                  departmentId: item.departmentId,
                                  assignedDoctorId: item.assignedDoctorId,
                                  roomId: item.roomId,
                                  priority: item.priority,
                                })
                              }
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Transfer patient to another doctor/dept"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleCancelTicket(item.id, item.patientName)}
                              disabled={isBusy}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Cancel ticket"
                            >
                              <XCircle className="w-3.5 h-3.5" />
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
      </ReceptionistPageShell>

      {/* Check In Modal */}
      {checkInModalOpen && (
        <CheckInModal
          isOpen={checkInModalOpen}
          onClose={() => setCheckInModalOpen(false)}
          onCheckInComplete={() => {
            void loadQueue();
            setCheckInModalOpen(false);
          }}
        />
      )}

      {/* Transfer Queue Modal */}
      {transferTarget && (
        <TransferQueueModal
          isOpen={!!transferTarget}
          target={transferTarget}
          onClose={() => setTransferTarget(null)}
          onSuccess={() => {
            void loadQueue();
            setTransferTarget(null);
          }}
        />
      )}

      {/* Queue Ticket Print Modal */}
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

export default React.memo(QueuePage);
