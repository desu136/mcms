'use client';

import { useState } from 'react';
import NurseStatCard from '@/components/nurse/NurseStatCard';
import { NURSE_TASKS, NURSE_PATIENTS, NursePatient } from '@/components/nurse/nurseMockData';
import NursePatientDetailsModal from '@/components/nurse/NursePatientDetailsModal';
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle, MoreVertical,
  ChevronLeft, ChevronRight, Filter, Search, CheckSquare, Pill,
  Activity, Heart, FlaskConical, BookOpen, SlidersHorizontal,
  Eye,
} from 'lucide-react';

const PRIORITY_STYLES: Record<string, string> = {
  'High':   'bg-red-100 text-red-600',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Low':    'bg-green-100 text-green-600',
};

const STATUS_STYLES: Record<string, string> = {
  'Pending':     'bg-orange-100 text-orange-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Scheduled':   'bg-purple-100 text-purple-700',
  'Completed':   'bg-green-100 text-green-700',
};

const TYPE_CONFIGS: Record<string, { bg: string; text: string; Icon: React.ElementType }> = {
  'Medication':  { bg: 'bg-blue-100',   text: 'text-blue-700',   Icon: Pill },
  'Vital Signs': { bg: 'bg-green-100',  text: 'text-green-700',  Icon: Activity },
  'Wound Care':  { bg: 'bg-purple-100', text: 'text-purple-700', Icon: Heart },
  'Lab Sample':  { bg: 'bg-cyan-100',   text: 'text-cyan-700',   Icon: FlaskConical },
  'Education':   { bg: 'bg-yellow-100', text: 'text-yellow-700', Icon: BookOpen },
};

const CATEGORY_TABS = [
  { key: 'all',        label: 'All Tasks',   count: 48 },
  { key: 'Medication', label: 'Medications', count: 16 },
  { key: 'Vital Signs',label: 'Vital Signs', count: 14 },
  { key: 'Wound Care', label: 'Wound Care',  count: 7  },
  { key: 'Lab Sample', label: 'Lab Samples', count: 5  },
  { key: 'Education',  label: 'Other',       count: 6  },
];

const PROGRESS_CATEGORIES = [
  { label: 'Medications',  done: 10, total: 16, color: 'bg-blue-500' },
  { label: 'Vital Signs',  done: 6,  total: 14, color: 'bg-green-500' },
  { label: 'Wound Care',   done: 2,  total: 7,  color: 'bg-purple-500' },
  { label: 'Lab Samples',  done: 2,  total: 5,  color: 'bg-cyan-500' },
  { label: 'Other',        done: 0,  total: 6,  color: 'bg-gray-400' },
];

export default function NurseTasksPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<NursePatient>(NURSE_PATIENTS[0]!);
  const rowsPerPage = 10;

  const handleOpenDetails = (patientPid: string, patientName: string) => {
    const p = NURSE_PATIENTS.find(np => np.pid === patientPid || np.name === patientName) || NURSE_PATIENTS[0]!;
    setSelectedPatient(p);
    setDetailsOpen(true);
  };

  const filtered = NURSE_TASKS.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || t.patientName.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.room.toLowerCase().includes(q);
    const matchTab = activeTab === 'all' || t.type === activeTab;
    const matchPriority = selectedPriority === 'All Priorities' || t.priority === selectedPriority;
    const matchStatus = selectedStatus === 'All Statuses' || t.status === selectedStatus;
    return matchQ && matchTab && matchPriority && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const completedCount = NURSE_TASKS.filter(t => t.status === 'Completed').length;
  const totalCount = NURSE_TASKS.length;
  const pct = Math.round((completedCount / totalCount) * 100);

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
              <p className="text-xs text-gray-400 mt-0.5">Manage and complete your nursing tasks, medication administration, and patient care.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-xs">
              <span className="text-[11px] text-gray-500">Oct 19, 2026</span>
              <div className="flex gap-0.5 ml-1">
                <button className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100"><ChevronLeft size={11} /></button>
                <button className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100"><ChevronRight size={11} /></button>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-xs transition-colors">
              <CheckSquare size={13} className="text-blue-600" /> Mark All as Read
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <NurseStatCard icon={<ClipboardList size={18} className="text-blue-600" />} iconBg="bg-blue-50" label="Total Tasks" value="48" trend="+12% vs. yesterday" trendUp />
          <NurseStatCard icon={<Clock size={18} className="text-orange-500" />} iconBg="bg-orange-50" label="Pending" value="21" trend="+8% vs. yesterday" trendUp />
          <NurseStatCard icon={<CheckCircle2 size={18} className="text-green-600" />} iconBg="bg-green-50" label="Completed" value="20" trend="+15% vs. yesterday" trendUp />
          <NurseStatCard icon={<Activity size={18} className="text-blue-500" />} iconBg="bg-blue-50" label="In Progress" value="5" trend="-38% vs. yesterday" trendUp={false} />
          <NurseStatCard icon={<AlertTriangle size={18} className="text-red-500" />} iconBg="bg-red-50" label="Overdue" value="7" trend="-22% vs. yesterday" trendUp={false} />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-xs w-fit flex-wrap">
          {CATEGORY_TABS.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-2.5 sm:p-3 border-b border-gray-100 flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search tasks by patient name, task, or room..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Priorities</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Statuses</option><option>Pending</option><option>In Progress</option><option>Scheduled</option><option>Completed</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={13} /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="w-8 px-3 py-2.5"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="px-3 py-2.5 text-left">Patient</th>
                  <th className="px-3 py-2.5 text-left">Task</th>
                  <th className="px-3 py-2.5 text-left">Type</th>
                  <th className="px-3 py-2.5 text-left">Priority</th>
                  <th className="px-3 py-2.5 text-left">Due Time</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(task => {
                  const cfg = TYPE_CONFIGS[task.type] || { bg: 'bg-gray-100', text: 'text-gray-600', Icon: ClipboardList };
                  const TypeIcon = cfg.Icon;
                  return (
                    <tr key={task.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {task.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-xs leading-tight">{task.patientName}</p>
                            <p className="text-[10px] text-gray-400">{task.patientPid} · {task.room}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-800 text-xs">{task.title}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{task.details}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
                          <TypeIcon size={10} />{task.type}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITY_STYLES[task.priority] || 'bg-gray-100 text-gray-600'}`}>{task.priority}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        <div>{task.dueTime}</div><div className="text-[10px] text-gray-400">{task.dueDate}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[task.status] || 'bg-gray-100 text-gray-600'}`}>{task.status}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(task.patientPid, task.patientName)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-50 text-blue-500 transition-colors"
                            title="View Patient Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-green-50 text-green-500 transition-colors" title="Complete"><CheckCircle2 size={13} /></button>
                          <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="More"><MoreVertical size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3.5 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} tasks</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={13} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setCurrentPage(n)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${currentPage === n ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>{n}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={13} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5"><SlidersHorizontal size={15} className="text-blue-600" /><h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Task Filters</h3></div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Department', options: ['All Departments', 'Cardiology', 'Internal Medicine', 'Wound Care'] },
              { label: 'Task Type',  options: ['All Task Types', 'Medication', 'Vital Signs', 'Wound Care', 'Lab Sample'] },
              { label: 'Priority',   options: ['All Priorities', 'High', 'Medium', 'Low'] },
              { label: 'Status',     options: ['All Statuses', 'Pending', 'In Progress', 'Scheduled', 'Completed'] },
            ].map(({ label, options }) => (
              <div key={label}>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{label}</label>
                <select className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: Activity,     label: 'Record Vitals',     color: 'text-blue-600',   bg: 'bg-blue-50' },
              { icon: Pill,         label: 'Administer Med',    color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: FlaskConical, label: 'Collect Sample',    color: 'text-cyan-600',   bg: 'bg-cyan-50' },
              { icon: BookOpen,     label: 'Add Patient Note',  color: 'text-green-600',  bg: 'bg-green-50' },
              { icon: ClipboardList,label: 'View Record',       color: 'text-orange-600', bg: 'bg-orange-50' },
              { icon: CheckSquare,  label: 'View All Tasks',    color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <button key={label} className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-xs transition-all ${bg}`}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs"><Icon size={13} className={color} /></div>
                <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2.5"><ClipboardList size={15} className="text-blue-600" /><h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Task Progress</h3></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray={`${(pct / 100) * 201} 201`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-gray-800">{pct}%</span></div>
            </div>
            <div><p className="text-xs font-semibold text-gray-800">Tasks Completed</p><p className="text-[11px] text-gray-500">{completedCount} of {totalCount}</p></div>
          </div>
          <div className="space-y-2">
            {PROGRESS_CATEGORIES.map(cat => {
              const catPct = Math.round((cat.done / cat.total) * 100);
              return (
                <div key={cat.label}>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-gray-600 font-medium">{cat.label}</span>
                    <span className="text-gray-400">{cat.done}/{cat.total}</span>
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

      <NursePatientDetailsModal
        patient={selectedPatient}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}
