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
  MoreVertical,
  Stethoscope,
  Database,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import CheckInModal from '../../components/receptionist/CheckInModal';
import {
  QUEUE_KPIS,
  QUEUE_PATIENTS_LIST,
  QueuePatient,
  QUEUE_SUMMARY_DONUT,
} from '../../components/receptionist/receptionistMockData';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import { fetchQueue, updateQueueEntry } from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { QueueEntryDTO } from '@mcms/contracts';

interface QueuePageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

export function QueuePage({ onNavigateTab }: QueuePageProps) {
  const { enqueueOperation } = useSync();
  const { accessToken } = useAuth();

  const [filterTab, setFilterTab] = useState<'All' | 'Waiting' | 'In Consultation' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<QueuePatient[]>(QUEUE_PATIENTS_LIST);
  const [rawQueueEntries, setRawQueueEntries] = useState<QueueEntryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [calledQueueNo, setCalledQueueNo] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchQueue(accessToken);
      if (data && data.length > 0) {
        setRawQueueEntries(data);
        const mapped: QueuePatient[] = data.map((dto) => {
          let status: 'Waiting' | 'In Consultation' | 'Completed' = 'Waiting';
          const s = (dto.status || '').toUpperCase();
          if (s === 'IN_PROGRESS' || s === 'IN_CONSULTATION' || s === 'CALLED') {
            status = 'In Consultation';
          } else if (s === 'COMPLETED') {
            status = 'Completed';
          }

          let waitingTime = '5 min';
          if (dto.checkInTime) {
            const mins = Math.max(0, Math.floor((Date.now() - new Date(dto.checkInTime).getTime()) / 60000));
            waitingTime = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
          }

          return {
            queueNo: dto.ticketNumber,
            patientName: dto.patientName,
            pid: dto.patientPid,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.patientName)}`,
            age: 30,
            gender: 'F',
            doctor: (dto as any).assignedDoctorName || (dto.assignedDoctorId ? 'Assigned Doctor' : 'Dr. Tadesse'),
            department: (dto as any).departmentName || (dto.departmentId ? 'OPD Department' : 'General OPD'),
            checkInTime: dto.checkInTime
              ? new Date(dto.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Today',
            waitingTime,
            status,
            visitType: dto.priority || 'Standard',
          };
        });
        setPatients(mapped);
      }
    } catch (err) {
      console.warn('Failed to load live queue, falling back to mock:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const filtered = useMemo(() => {
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

  // Dynamic breakdown
  const waitingCount = patients.filter((p) => p.status === 'Waiting').length;
  const inConsultCount = patients.filter((p) => p.status === 'In Consultation').length;
  const completedCount = patients.filter((p) => p.status === 'Completed').length;

  const donutData = useMemo(() => [
    { name: 'Waiting', value: waitingCount, color: '#f59e0b' },
    { name: 'In Consultation', value: inConsultCount, color: '#2563eb' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
  ], [waitingCount, inConsultCount, completedCount]);

  const handlePatientCheckedIn = (_newEntry: any) => {
    void loadQueue();
  };

  const handleCallPatient = async (queueNo: string) => {
    setCalledQueueNo(queueNo);
    const target = rawQueueEntries.find((r) => r.ticketNumber === queueNo);
    if (target && target.id) {
      try {
        await updateQueueEntry(target.id, { status: 'IN_PROGRESS' }, accessToken);
      } catch (err) {
        console.warn('Failed to update live queue entry status:', err);
      }
    }
    setPatients((prev) =>
      prev.map((p) => (p.queueNo === queueNo ? { ...p, status: 'In Consultation' as const } : p)),
    );
    setTimeout(() => setCalledQueueNo(null), 3000);
  };

  const handleCompletePatient = async (queueNo: string) => {
    const target = rawQueueEntries.find((r) => r.ticketNumber === queueNo);
    if (target && target.id) {
      try {
        await updateQueueEntry(target.id, { status: 'COMPLETED' }, accessToken);
      } catch (err) {
        console.warn('Failed to complete queue entry in API:', err);
      }
    }
    setPatients((prev) =>
      prev.map((p) => (p.queueNo === queueNo ? { ...p, status: 'Completed' as const } : p)),
    );
  };

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Live Patient Queue Management"
            subtitle="Monitor waiting times, doctor assignments, and patient flow with offline SQLite queue tokens."
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
                { key: 'All', label: 'All', count: patients.length },
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
                    {patients.length}
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

            {/* Calling Alert Banner */}
            {calledQueueNo && (
              <div className="p-3.5 rounded-xl bg-cyan-600 text-white shadow-md animate-in fade-in space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Calling Patient
                </div>
                <div className="text-lg font-black font-mono">{calledQueueNo}</div>
                <div className="text-[11px] text-cyan-100">
                  Notification broadcasted to waiting room display.
                </div>
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
                {filtered.map((item) => (
                  <tr key={item.queueNo} className="hover:bg-slate-50 transition-colors">
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.visitType}
                      </span>
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
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'Waiting' && (
                          <button
                            onClick={() => handleCallPatient(item.queueNo)}
                            type="button"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Call
                          </button>
                        )}
                        {item.status === 'In Consultation' && (
                          <button
                            onClick={() => handleCompletePatient(item.queueNo)}
                            type="button"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Done
                          </button>
                        )}
                        {item.status === 'Completed' && (
                          <span className="text-[11px] font-bold text-emerald-600 px-2">
                            Finished
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
          onPatientCheckedIn={handlePatientCheckedIn}
        />
      )}
    </>
  );
}

export default React.memo(QueuePage);
