import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CheckSquare,
  Pill,
  Activity,
  Heart,
  FlaskConical,
  BookOpen,
  SlidersHorizontal,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import { NursePatient } from '../../components/nurse/nurseMockData';
import NursePatientDetailsModal from '../../components/nurse/NursePatientDetailsModal';
import { useAuth } from '../../auth/AuthContext';
import { fetchNursingTasks, updateNursingTask } from '../../api/clinical';
import { fetchPatients } from '../../api/patients';
import type { NursingTaskDTO, PatientDTO } from '@mcms/contracts';

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-red-100 text-red-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-600',
};

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Scheduled: 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
};

const TYPE_CONFIGS: Record<string, { bg: string; text: string; Icon: React.ElementType }> = {
  Medication: { bg: 'bg-blue-100', text: 'text-blue-700', Icon: Pill },
  'Vital Signs': { bg: 'bg-green-100', text: 'text-green-700', Icon: Activity },
  'Wound Care': { bg: 'bg-purple-100', text: 'text-purple-700', Icon: Heart },
  'Lab Sample': { bg: 'bg-cyan-100', text: 'text-cyan-700', Icon: FlaskConical },
  Education: { bg: 'bg-yellow-100', text: 'text-yellow-700', Icon: BookOpen },
};

function mapPriority(p: string): string {
  if (p === 'HIGH') return 'High';
  if (p === 'MEDIUM') return 'Medium';
  if (p === 'LOW') return 'Low';
  return p;
}

function mapStatus(s: string): string {
  if (s === 'PENDING') return 'Pending';
  if (s === 'IN_PROGRESS') return 'In Progress';
  if (s === 'COMPLETED') return 'Completed';
  if (s === 'SCHEDULED') return 'Scheduled';
  return s;
}

function mapTaskType(t: string): string {
  if (t === 'MEDICATION') return 'Medication';
  if (t === 'VITAL_SIGNS') return 'Vital Signs';
  if (t === 'WOUND_CARE') return 'Wound Care';
  if (t === 'LAB_SAMPLE') return 'Lab Sample';
  if (t === 'EDUCATION') return 'Education';
  return t;
}

export function TasksPage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<NursePatient | null>(null);
  const rowsPerPage = 10;

  const [tasks, setTasks] = useState<NursingTaskDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [taskData, patientRes] = await Promise.allSettled([
        fetchNursingTasks(accessToken),
        fetchPatients(accessToken, { limit: 100 }),
      ]);
      if (taskData.status === 'fulfilled' && Array.isArray(taskData.value)) {
        setTasks(taskData.value);
      }
      if (patientRes.status === 'fulfilled' && patientRes.value?.data) {
        setPatients(patientRes.value.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateNursingTask(taskId, { status: 'COMPLETED' }, accessToken);
      await loadTasks();
    } catch (err) {
      try {
        await (window as any).electron?.ipcRenderer?.invoke('enqueue-operation', {
          type: 'COMPLETE_NURSING_TASK',
          payload: { taskId, status: 'COMPLETED' },
        });
      } catch {
        /* ignore */
      }
    }
  };

  const handleOpenDetails = (patientName: string) => {
    const found = patients.find(
      (p) =>
        (p.fullName || `${p.firstName} ${p.lastName}`).trim().toLowerCase() === patientName.trim().toLowerCase(),
    );
    if (found) {
      const name = found.fullName || `${found.firstName} ${found.lastName}`.trim();
      const birthYear = found.dateOfBirth ? new Date(found.dateOfBirth).getFullYear() : 1995;
      const age = Math.max(0, new Date().getFullYear() - birthYear);
      setSelectedPatient({
        id: found.id,
        pid: found.pid || `PID-${found.id.slice(0, 6).toUpperCase()}`,
        name,
        age,
        gender: found.gender?.toUpperCase() === 'MALE' ? 'Male' : 'Female',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        phone: found.phoneNumber || '—',
        email: found.email || '—',
        address: found.address || 'Addis Ababa, Ethiopia',
        room: 'Ward 3A',
        bed: 'Bed 01',
        department: 'General Nursing & Triage',
        visitReason: 'Nursing Care',
        status: 'In Care',
        vitalsStatus: 'Normal',
        vitals: { bp: '—', hr: 0, temp: 0, spo2: 0 },
        doctor: 'Attending Physician',
        admissionDate: found.createdAt ? new Date(found.createdAt).toLocaleDateString() : 'Today',
      });
      setDetailsOpen(true);
    } else {
      setSelectedPatient({
        id: 'patient-custom',
        pid: 'PID-TASK',
        name: patientName,
        age: 30,
        gender: 'Female',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patientName)}`,
        phone: '—',
        email: '—',
        address: 'Addis Ababa, Ethiopia',
        room: 'Ward 3A',
        bed: 'Bed 01',
        department: 'General Nursing & Triage',
        visitReason: 'Nursing Care & Tasks',
        status: 'In Care',
        vitalsStatus: 'Normal',
        vitals: { bp: '—', hr: 0, temp: 0, spo2: 0 },
        doctor: 'Attending Physician',
        admissionDate: 'Today',
      });
      setDetailsOpen(true);
    }
  };

  const filtered = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const uiType = mapTaskType(t.taskType);
    const uiStatus = mapStatus(t.status);
    const uiPriority = mapPriority(t.priority);
    const matchQ =
      !q ||
      t.patientName.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      (t.details || '').toLowerCase().includes(q);
    const matchTab = activeTab === 'all' || uiType === activeTab;
    const matchPriority = selectedPriority === 'All Priorities' || uiPriority === selectedPriority;
    const matchStatus = selectedStatus === 'All Statuses' || uiStatus === selectedStatus;
    return matchQ && matchTab && matchPriority && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Dynamic category tabs
  const categoryTabs = useMemo(() => {
    const medCount = tasks.filter((t) => t.taskType === 'MEDICATION').length;
    const vitalsCount = tasks.filter((t) => t.taskType === 'VITAL_SIGNS').length;
    const woundCount = tasks.filter((t) => t.taskType === 'WOUND_CARE').length;
    const labCount = tasks.filter((t) => t.taskType === 'LAB_SAMPLE').length;
    const otherCount = tasks.filter(
      (t) => !['MEDICATION', 'VITAL_SIGNS', 'WOUND_CARE', 'LAB_SAMPLE'].includes(t.taskType),
    ).length;

    return [
      { key: 'all', label: 'All Tasks', count: tasks.length },
      { key: 'Medication', label: 'Medications', count: medCount },
      { key: 'Vital Signs', label: 'Vital Signs', count: vitalsCount },
      { key: 'Wound Care', label: 'Wound Care', count: woundCount },
      { key: 'Lab Sample', label: 'Lab Samples', count: labCount },
      { key: 'Education', label: 'Other', count: otherCount },
    ];
  }, [tasks]);

  // Dynamic progress categories
  const progressCategories = useMemo(() => {
    const categories = [
      { key: 'MEDICATION', label: 'Medications', color: 'bg-blue-500' },
      { key: 'VITAL_SIGNS', label: 'Vital Signs', color: 'bg-green-500' },
      { key: 'WOUND_CARE', label: 'Wound Care', color: 'bg-purple-500' },
      { key: 'LAB_SAMPLE', label: 'Lab Samples', color: 'bg-cyan-500' },
    ];
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.taskType === cat.key);
      const done = catTasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        label: cat.label,
        done,
        total: catTasks.length,
        color: cat.color,
      };
    });
  }, [tasks]);

  // Overall KPIs
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Banner */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Nursing Tasks</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage and complete your nursing shift tasks, medication rounds, and biometric orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadTasks()}
              disabled={loading}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Tasks"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <NurseStatCard
            icon={ClipboardList}
            color="blue"
            label="Total Shift Tasks"
            value={String(totalCount)}
            trend="Shift assigned"
            trendUp={true}
          />
          <NurseStatCard
            icon={Clock}
            color="orange"
            label="Pending Action"
            value={String(pendingCount)}
            trend="Awaiting execution"
            trendUp={pendingCount === 0}
          />
          <NurseStatCard
            icon={CheckCircle2}
            color="green"
            label="Completed"
            value={String(completedCount)}
            trend={`${pct}% completed`}
            trendUp={true}
          />
          <NurseStatCard
            icon={Activity}
            color="purple"
            label="In Progress"
            value={String(inProgressCount)}
            trend="Actively executing"
            trendUp={true}
          />
          <NurseStatCard
            icon={AlertTriangle}
            color="red"
            label="High Priority"
            value={String(highPriorityCount)}
            trend="Needs immediate care"
            trendUp={highPriorityCount === 0}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-xs w-fit flex-wrap">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden relative">
          {error && <div className="p-3 text-xs text-red-600 bg-red-50">{error}</div>}
          <div className="p-2.5 sm:p-3 border-b border-gray-100 flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by patient name, title, or details..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Scheduled</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2.5 text-left">Patient</th>
                  <th className="px-3 py-2.5 text-left">Task</th>
                  <th className="px-3 py-2.5 text-left">Type</th>
                  <th className="px-3 py-2.5 text-left">Priority</th>
                  <th className="px-3 py-2.5 text-left">Due Time</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                      Loading nursing tasks...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No tasks found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((task) => {
                    const uiType = mapTaskType(task.taskType);
                    const uiStatus = mapStatus(task.status);
                    const uiPriority = mapPriority(task.priority);
                    const cfg = TYPE_CONFIGS[uiType] || { bg: 'bg-gray-100', text: 'text-gray-600', Icon: ClipboardList };
                    const TypeIcon = cfg.Icon;
                    return (
                      <tr key={task.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {task.patientName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-xs leading-tight">{task.patientName}</p>
                              <p className="text-[10px] text-gray-400">{task.assignedToName ?? 'Staff Nurse'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-800 text-xs">{task.title}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{task.details}</p>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}
                          >
                            <TypeIcon size={10} />
                            {uiType}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              PRIORITY_STYLES[uiPriority] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {uiPriority}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          <div>{task.dueTime}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              STATUS_STYLES[uiStatus] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {uiStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenDetails(task.patientName)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-50 text-blue-500 transition-colors cursor-pointer"
                              title="View Patient Details"
                            >
                              <Eye size={13} />
                            </button>
                            {task.status !== 'COMPLETED' && (
                              <button
                                onClick={() => void handleCompleteTask(task.id)}
                                className="px-2 py-1 rounded-md bg-green-50 hover:bg-green-100 text-green-700 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Mark Complete"
                              >
                                <CheckCircle2 size={12} />
                                <span>Done</span>
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

          <div className="px-3.5 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} tasks
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    currentPage === n ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2.5">
            <ClipboardList size={15} className="text-blue-600" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Shift Task Progress</h3>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="8"
                  strokeDasharray={`${(pct / 100) * 201} 201`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">{pct}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Tasks Completed</p>
              <p className="text-[11px] text-gray-500">
                {completedCount} of {totalCount}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {progressCategories.map((cat) => {
              const catPct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0;
              return (
                <div key={cat.label}>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-gray-600 font-medium">{cat.label}</span>
                    <span className="text-gray-400">
                      {cat.done}/{cat.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${catPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {selectedPatient && (
        <NursePatientDetailsModal
          patient={selectedPatient}
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </div>
  );
}

export default React.memo(TasksPage);
