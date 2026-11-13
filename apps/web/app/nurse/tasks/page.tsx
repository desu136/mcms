'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import NurseStatCard from '@/components/nurse/NurseStatCard';
import NursePatientDetailsModal from '@/components/nurse/NursePatientDetailsModal';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchNursingTasks, updateNursingTask, createNursingTask } from '@/lib/api/clinical';
import { fetchPatients } from '@/lib/api/patients';
import type { NursingTaskDTO, PatientDTO } from '@mcms/contracts';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Pill,
  Activity,
  Heart,
  FlaskConical,
  BookOpen,
  Eye,
  RefreshCw,
  Plus,
  X,
} from 'lucide-react';

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

interface FormattedTask {
  id: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  room: string;
  title: string;
  details: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  dueTime: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Scheduled' | 'Completed';
}

export default function NurseTasksPage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState<FormattedTask[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // New task form state
  const [newPatientId, setNewPatientId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('VITALS');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskInstructions, setNewTaskInstructions] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const rowsPerPage = 10;

  const loadPatients = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetchPatients(accessToken, { limit: 100 });
      setPatients(res.data);
      if (res.data.length > 0 && !newPatientId) {
        setNewPatientId(res.data[0]!.id);
      }
    } catch (_) {}
  }, [accessToken, newPatientId]);

  const loadTasks = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await fetchNursingTasks(accessToken);
      if (data) {
        const typeMap: Record<string, string> = {
          MEDICATION: 'Medication',
          VITALS: 'Vital Signs',
          WOUND_CARE: 'Wound Care',
          LAB_SAMPLE: 'Lab Sample',
          EDUCATION: 'Education',
        };
        const priorityMap: Record<string, FormattedTask['priority']> = {
          HIGH: 'High',
          MEDIUM: 'Medium',
          LOW: 'Low',
        };
        const statusMap: Record<string, FormattedTask['status']> = {
          PENDING: 'Pending',
          IN_PROGRESS: 'In Progress',
          SCHEDULED: 'Scheduled',
          COMPLETED: 'Completed',
        };

        const mapped: FormattedTask[] = data.map((dto, idx) => {
          const due = dto.dueTime ? new Date(dto.dueTime) : new Date();
          return {
            id: dto.id,
            patientId: dto.patientId,
            patientName: dto.patientName || 'Assigned Patient',
            patientPid: `PID-${dto.patientId.slice(0, 6).toUpperCase()}`,
            room: `Ward ${Math.floor(idx / 4) + 1}A`,
            title: dto.title,
            details: dto.details || 'Routine nursing care protocol',
            type: typeMap[(dto.taskType || '').toUpperCase()] || 'Vital Signs',
            priority: priorityMap[dto.priority.toUpperCase()] || 'Medium',
            dueTime: due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dueDate: due.toLocaleDateString(),
            status: statusMap[dto.status.toUpperCase()] || 'Pending',
          };
        });
        setTasks(mapped);
      }
    } catch (err) {
      console.error('Failed to load nursing tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadPatients();
    void loadTasks();
  }, [loadPatients, loadTasks]);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!accessToken) return;
    const newStatus = currentStatus === 'Completed' ? 'PENDING' : 'COMPLETED';
    try {
      await updateNursingTask(taskId, { status: newStatus as any }, accessToken);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus === 'COMPLETED' ? 'Completed' : 'Pending' }
            : t,
        ),
      );
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newPatientId || !newTaskTitle.trim()) return;

    setIsCreating(true);
    try {
      await createNursingTask(
        {
          patientId: newPatientId,
          title: newTaskTitle.trim(),
          taskType: newTaskType,
          priority: newTaskPriority,
          ...(newTaskInstructions.trim() ? { details: newTaskInstructions.trim() } : {}),
          dueTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        accessToken,
      );

      setCreateModalOpen(false);
      setNewTaskTitle('');
      setNewTaskInstructions('');
      void loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDetails = (patientId: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setSelectedPatient({
        id: found.id,
        pid: found.pid,
        name: found.fullName || `${found.firstName} ${found.lastName}`.trim(),
        age: found.dateOfBirth
          ? Math.max(0, new Date().getFullYear() - new Date(found.dateOfBirth).getFullYear())
          : 30,
        gender: found.gender === 'MALE' ? 'Male' : 'Female',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(found.firstName)}`,
        phone: found.phoneNumber || '—',
        email: found.email || '—',
        address: found.address || 'Addis Ababa',
        room: 'Ward 2A',
        bed: 'Bed 01',
        department: 'Nursing Unit',
        visitReason: 'General care',
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
    const matchQ =
      !q ||
      t.patientName.toLowerCase().includes(q) ||
      t.patientPid.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q);
    const matchType = activeTab === 'all' || t.type.toLowerCase() === activeTab.toLowerCase();
    const matchPriority =
      selectedPriority === 'All Priorities' || t.priority === selectedPriority;
    const matchStatus = selectedStatus === 'All Statuses' || t.status === selectedStatus;
    return matchQ && matchType && matchPriority && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <ClipboardList size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Nursing Tasks & Order Schedules
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Organize clinical tasks, vital checks, medication schedules, and care routines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
            <button
              onClick={() => void loadTasks()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={`text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard
            icon={<ClipboardList size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
            label="Total Tasks"
            value={isLoading ? '—' : tasks.length}
            trend="Active clinical load"
            trendUp
          />
          <NurseStatCard
            icon={<Clock size={18} className="text-amber-600" />}
            iconBg="bg-amber-50"
            label="Pending Action"
            value={isLoading ? '—' : pendingCount}
            trend="Due today"
            trendUp={false}
          />
          <NurseStatCard
            icon={<Activity size={18} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
            label="In Progress"
            value={isLoading ? '—' : inProgressCount}
            trend="Under administration"
            trendUp
          />
          <NurseStatCard
            icon={<CheckCircle2 size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Completed Tasks"
            value={isLoading ? '—' : completedCount}
            trend="Completed this shift"
            trendUp
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs w-fit flex-wrap">
          {[
            { key: 'all', label: 'All Tasks', count: tasks.length },
            { key: 'Vital Signs', label: 'Vitals', count: tasks.filter((t) => t.type === 'Vital Signs').length },
            { key: 'Medication', label: 'Medications', count: tasks.filter((t) => t.type === 'Medication').length },
            { key: 'Wound Care', label: 'Wound Care', count: tasks.filter((t) => t.type === 'Wound Care').length },
            { key: 'Lab Sample', label: 'Lab Samples', count: tasks.filter((t) => t.type === 'Lab Sample').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by patient, title, instructions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
              >
                <option value="All Priorities">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No nursing tasks found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((task) => {
                    const cfg = TYPE_CONFIGS[task.type] || {
                      bg: 'bg-slate-100',
                      text: 'text-slate-700',
                      Icon: ClipboardList,
                    };
                    const TypeIcon = cfg.Icon;
                    return (
                      <tr key={task.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block">{task.patientName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {task.patientPid} • {task.room}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{task.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{task.details}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
                          >
                            <TypeIcon size={11} />
                            <span>{task.type}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              PRIORITY_STYLES[task.priority] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{task.dueTime}</span>
                          <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              STATUS_STYLES[task.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => void handleToggleTaskStatus(task.id, task.status)}
                              className={`p-1.5 rounded-lg border transition ${
                                task.status === 'Completed'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={
                                task.status === 'Completed'
                                  ? 'Mark as Incomplete'
                                  : 'Mark as Completed'
                              }
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenDetails(task.patientId)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                              title="Patient Details"
                            >
                              <Eye size={14} />
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

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} tasks
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                    currentPage === n
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ClipboardList size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Nursing Task</h3>
                  <p className="text-[11px] text-slate-500">Schedule clinical intervention or order</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName || `${p.firstName} ${p.lastName}`} ({p.pid})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Check vital signs post-infusion"
                  required
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Task Type</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="VITALS">Vital Signs</option>
                    <option value="MEDICATION">Medication</option>
                    <option value="WOUND_CARE">Wound Care</option>
                    <option value="LAB_SAMPLE">Lab Sample</option>
                    <option value="EDUCATION">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Instructions</label>
                <textarea
                  rows={2}
                  value={newTaskInstructions}
                  onChange={(e) => setNewTaskInstructions(e.target.value)}
                  placeholder="Specific dosage, timing, or precautions..."
                  className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5"
                >
                  {isCreating ? 'Creating Task...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <NursePatientDetailsModal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          patient={selectedPatient}
        />
      )}
    </div>
  );
}
