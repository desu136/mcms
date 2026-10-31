import React, { useState } from 'react';
import {
  CalendarDays,
  Eye,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  RefreshCcw,
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import { NURSE_APPOINTMENTS, NURSE_PATIENTS, NursePatient } from '../../components/nurse/nurseMockData';
import NursePatientDetailsModal from '../../components/nurse/NursePatientDetailsModal';

const STATUS_STYLES: Record<string, string> = {
  'Checked In':  'bg-green-100 text-green-700',
  'Waiting':     'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Scheduled':   'bg-purple-100 text-purple-700',
  'Cancelled':   'bg-red-100 text-red-700',
  'Completed':   'bg-gray-100 text-gray-600',
  'On Time':     'bg-emerald-100 text-emerald-700',
  'Upcoming':    'bg-sky-100 text-sky-700',
};

const TABS = [
  { key: 'all',       label: 'All',       count: 48 },
  { key: 'today',     label: 'Today',     count: 12 },
  { key: 'upcoming',  label: 'Upcoming',  count: 24 },
  { key: 'completed', label: 'Completed', count: 36 },
  { key: 'cancelled', label: 'Cancelled', count: 4  },
];

function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 19));
  const today = 19;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const hasAppt = [8, 10, 14, 19, 21, 25, 28];

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <ChevronLeft size={13} className="text-gray-500" />
        </button>
        <span className="text-xs font-bold text-gray-800">
          {monthName} {year}
        </span>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <ChevronRight size={13} className="text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-0.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {day !== null ? (
              <button
                className={`w-6 h-6 text-[11px] rounded-full flex items-center justify-center font-medium transition-colors relative cursor-pointer ${
                  day === today ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                {day}
                {hasAppt.includes(day) && day !== today && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const TODAYS_SCHEDULE = [
  { time: '08:00 AM', patient: 'Aster Mulu',       reason: 'Follow-up',          status: 'In Care',     dot: 'bg-green-500' },
  { time: '09:30 AM', patient: 'Samuel Girma',     reason: 'Diabetes Follow-up', status: 'Waiting',     dot: 'bg-yellow-500' },
  { time: '10:00 AM', patient: 'Lidya Kebede',     reason: 'Wound Check',        status: 'In Progress', dot: 'bg-blue-500' },
  { time: '11:00 AM', patient: 'Getachew Tadesse', reason: 'Routine Check',      status: 'Scheduled',   dot: 'bg-purple-500' },
  { time: '01:00 PM', patient: 'Betlehem Abebe',   reason: 'Vaccination',        status: 'Scheduled',   dot: 'bg-purple-500' },
];

const SCHED_STATUS: Record<string, string> = {
  'In Care':     'bg-green-100 text-green-700',
  'Waiting':     'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Scheduled':   'bg-purple-100 text-purple-700',
};

export function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<NursePatient>(NURSE_PATIENTS[0]!);
  const rowsPerPage = 10;

  const handleOpenDetails = (patientPid: string, patientName: string) => {
    const p = NURSE_PATIENTS.find((np) => np.pid === patientPid || np.name === patientName) || NURSE_PATIENTS[0]!;
    setSelectedPatient(p);
    setDetailsOpen(true);
  };

  const filtered = NURSE_APPOINTMENTS.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientPid.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q);
    const matchDept = selectedDept === 'All Departments' || a.department === selectedDept;
    const matchStatus = selectedStatus === 'All Statuses' || a.status === selectedStatus;
    return matchQ && matchDept && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const departments = ['All Departments', ...Array.from(new Set(NURSE_APPOINTMENTS.map((a) => a.department)))];
  const statuses = ['All Statuses', ...Object.keys(STATUS_STYLES)];

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Banner */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <CalendarDays size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Appointments</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                View and manage your patient appointments, update status, and provide nursing care.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-xs">
            <CalendarDays size={14} className="text-blue-600" />
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Oct 19, 2026</p>
              <p className="text-[11px] font-medium text-gray-700">Monday</p>
            </div>
            <div className="flex gap-0.5 ml-1.5">
              <button className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <ChevronLeft size={11} />
              </button>
              <button className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard icon={<CalendarDays size={18} className="text-blue-600" />} iconBg="bg-blue-50" label="Total Appointments" value="48" trend="+12% vs. last week" trendUp />
          <NurseStatCard icon={<CalendarDays size={18} className="text-cyan-600" />} iconBg="bg-cyan-50" label="Today's Appointments" value="12" trend="+20% vs. last week" trendUp />
          <NurseStatCard icon={<UserCheck size={18} className="text-green-600" />} iconBg="bg-green-50" label="Completed" value="36" trend="+8% vs. last week" trendUp />
          <NurseStatCard icon={<RefreshCcw size={18} className="text-red-500" />} iconBg="bg-red-50" label="Cancelled" value="4" trend="-33% vs. last week" trendUp={false} />
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-xs w-fit flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-2.5 sm:p-3 border-b border-gray-100 flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, ID, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <Filter size={13} /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="w-8 px-3 py-2.5">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 py-2.5 text-left">Patient</th>
                  <th className="px-3 py-2.5 text-left">Age / Gender</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5 text-left">Reason</th>
                  <th className="px-3 py-2.5 text-left">Appointment Time</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <img src={apt.avatar} alt={apt.patientName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 text-xs leading-tight">{apt.patientName}</p>
                          <p className="text-[10px] text-gray-400">{apt.patientPid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{apt.age} / {apt.gender}</td>
                    <td className="px-3 py-2 text-gray-600">{apt.department}</td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[140px]">{apt.reason}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      <div>{apt.date}</div>
                      <div className="text-[10px] text-gray-400">{apt.appointmentTime}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenDetails(apt.patientPid, apt.patientName)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-50 text-blue-500 transition-colors cursor-pointer"
                          title="View Patient Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer">
                          <Pencil size={13} />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer">
                          <MoreVertical size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3.5 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} appointments
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
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-blue-600" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Calendar View</h3>
            </div>
            <button className="text-[11px] text-blue-600 font-medium hover:underline cursor-pointer">View Full</button>
          </div>
          <MiniCalendar />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: UserCheck, label: 'Mark as Checked In', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: RefreshCcw, label: 'Update Status', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: FileText, label: 'Add Nursing Note', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Eye, label: 'View Patient Record', color: 'text-cyan-600', bg: 'bg-cyan-50' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <button
                key={label}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer ${bg}`}
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs">
                  <Icon size={13} className={color} />
                </div>
                <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-blue-600" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Today's Schedule</h3>
            </div>
            <button className="text-[11px] text-blue-600 font-medium hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-2">
            {TODAYS_SCHEDULE.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.patient}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${SCHED_STATUS[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{item.time} · {item.reason}</p>
                </div>
              </div>
            ))}
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

export default React.memo(AppointmentsPage);
