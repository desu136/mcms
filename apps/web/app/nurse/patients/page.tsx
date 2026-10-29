'use client';

import { useState } from 'react';
import NurseStatCard from '@/components/nurse/NurseStatCard';
import { NURSE_PATIENTS, NursePatient } from '@/components/nurse/nurseMockData';
import {
  Users, Eye, MessageCircle, MoreVertical, ChevronLeft, ChevronRight,
  Filter, Search, Activity, Heart, Thermometer, Droplets,
  Phone, Mail, MapPin, AlertCircle, CheckCircle2, FileText,
  Pill, FlaskConical, UserCircle,
} from 'lucide-react';
import NursePatientDetailsModal from '@/components/nurse/NursePatientDetailsModal';
import RecordVitalsModal from '@/components/nurse/RecordVitalsModal';
import AdministerMedModal from '@/components/nurse/AdministerMedModal';
import CollectLabModal from '@/components/nurse/CollectLabModal';
import AddNoteModal from '@/components/nurse/AddNoteModal';

const STATUS_STYLES: Record<string, string> = {
  'In Ward':    'bg-blue-100 text-blue-700',
  'In Care':    'bg-green-100 text-green-700',
  'Waiting':    'bg-yellow-100 text-yellow-700',
  'Completed':  'bg-gray-100 text-gray-600',
  'Discharged': 'bg-purple-100 text-purple-700',
  'Critical':   'bg-red-100 text-red-700',
};

const TABS = [
  { key: 'all',        label: 'All Patients',  count: 48 },
  { key: 'In Care',    label: 'In Care',       count: 32 },
  { key: 'Discharged', label: 'Discharged',    count: 12 },
  { key: 'Critical',   label: 'Critical',      count: 4  },
];

type RightTab = 'Overview' | 'Visit History' | 'Medical Records';

export default function NursePatientsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [rightTab, setRightTab] = useState<RightTab>('Overview');
  const [selectedPatient, setSelectedPatient] = useState<NursePatient>(NURSE_PATIENTS[0]!);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const rowsPerPage = 10;

  const filtered = NURSE_PATIENTS.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q) || p.visitReason.toLowerCase().includes(q);
    const matchTab = activeTab === 'all'
      || p.status === activeTab
      || (activeTab === 'In Care' && (p.status === 'In Ward' || p.status === 'In Care'));
    const matchDept = selectedDept === 'All Departments' || p.department === selectedDept;
    const matchStatus = selectedStatus === 'All Statuses' || p.status === selectedStatus;
    return matchQ && matchTab && matchDept && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleOpenDetails = (patient: NursePatient) => {
    setSelectedPatient(patient);
    setDetailsModalOpen(true);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F7FC]">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">My Patients</h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage and monitor all assigned patients in your ward.</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenDetails(selectedPatient)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all hover:scale-[1.01]"
          >
            View Patient Details
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard icon={Users} label="Total Assigned" value="48" trend="+12% from last week" trendUp={true} color="blue" />
          <NurseStatCard icon={Activity} label="In Active Care" value="32" trend="+8% from last week" trendUp={true} color="green" />
          <NurseStatCard icon={CheckCircle2} label="Discharged Today" value="12" trend="-3% from last week" trendUp={false} color="purple" />
          <NurseStatCard icon={AlertCircle} label="Critical Attention" value="4" trend="Requires observation" trendUp={false} color="amber" />
        </div>

        {/* Tab pills */}
        <div className="flex gap-1.5">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
              }`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by patient name, PID, or condition..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 bg-gray-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={e => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Departments</option>
              <option>Cardiology</option>
              <option>Internal Medicine</option>
              <option>General Medicine</option>
              <option>Endocrinology</option>
              <option>Orthopedics</option>
              <option>Surgery</option>
              <option>Gynaecology</option>
              <option>ENT</option>
            </select>
            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Statuses</option>
              <option>In Ward</option>
              <option>In Care</option>
              <option>Waiting</option>
              <option>Completed</option>
              <option>Discharged</option>
              <option>Critical</option>
            </select>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Filter size={13} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-2.5 px-3 w-8"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0" /></th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">Age / Gender</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Next Follow-up</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {paginated.map(patient => {
                  const isSelected = selectedPatient.id === patient.id;
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0" />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          <img src={patient.avatar} alt={patient.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-white shadow-2xs" />
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{patient.name}</p>
                            <p className="text-[10px] text-gray-400">{patient.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-600 font-mono font-medium text-[11px]">{patient.pid}</td>
                      <td className="py-2 px-3 text-gray-600">{patient.age} / {patient.gender}</td>
                      <td className="py-2 px-3 text-gray-600">{patient.department}</td>
                      <td className="py-2 px-3 text-gray-600 truncate max-w-[140px]">{patient.visitReason}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[patient.status] || 'bg-gray-100 text-gray-600'}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-[11px]">{patient.nextFollowUp || '—'}</td>
                      {/* Action column with Eye details button */}
                      <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(patient)}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-2xs"
                            title="View Patient Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => { setSelectedPatient(patient); setNoteModalOpen(true); }}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                            title="Add Note"
                          >
                            <FileText size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenDetails(patient)}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                            title="More Options"
                          >
                            <MoreVertical size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-3.5 py-2.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <span>Showing {filtered.length === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} patients</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all ${currentPage === n ? 'bg-blue-600 text-white shadow-2xs' : 'border border-gray-200 hover:bg-gray-50'}`}>{n}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3 flex-shrink-0">
        {/* Patient Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5"><UserCircle size={15} className="text-blue-600" /><h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Patient Details</h3></div>
            <button onClick={() => handleOpenDetails(selectedPatient)} className="text-[11px] text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="flex items-start gap-2.5 mb-2.5">
            <img src={selectedPatient.avatar} alt={selectedPatient.name}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-100 shadow-2xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-800 text-xs sm:text-sm">{selectedPatient.name}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-[9px] text-green-700 font-semibold">{selectedPatient.status}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedPatient.pid} · {selectedPatient.age}y · {selectedPatient.gender}</p>
              <p className="text-[11px] text-blue-600 font-medium">Room {selectedPatient.room}</p>
            </div>
          </div>
          <div className="space-y-1 text-[11px] text-gray-500 mb-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2"><Phone size={11} className="text-gray-400" /><span>{selectedPatient.phone}</span></div>
            <div className="flex items-center gap-2"><Mail size={11} className="text-gray-400" /><span>{selectedPatient.email}</span></div>
            <div className="flex items-center gap-2"><MapPin size={11} className="text-gray-400" /><span>{selectedPatient.address}</span></div>
          </div>
          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-100 mb-2.5">
            {(['Overview', 'Visit History', 'Medical Records'] as RightTab[]).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                className={`text-[11px] px-2.5 py-1 font-semibold border-b-2 transition-colors whitespace-nowrap ${rightTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
                {tab}
              </button>
            ))}
          </div>
          {rightTab === 'Overview' && (
            <div className="bg-blue-50/70 rounded-lg p-2.5 border border-blue-100 text-xs">
              <p className="font-bold text-gray-800">{selectedPatient.admissionDate} · 09:15 AM</p>
              <p className="text-gray-500 mt-0.5">{selectedPatient.department} · {selectedPatient.doctor}</p>
              <p className="text-gray-600 mt-1 font-medium">Reason: {selectedPatient.visitReason}</p>
            </div>
          )}
          {rightTab === 'Visit History' && (
            <p className="text-xs text-gray-400 text-center py-3">No previous visits on record.</p>
          )}
          {rightTab === 'Medical Records' && (
            <p className="text-xs text-gray-400 text-center py-3">Medical records available in EHR.</p>
          )}
        </div>

        {/* Latest Vitals */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5"><Activity size={15} className="text-blue-600" /><h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Latest Vitals</h3></div>
            <button onClick={() => setVitalsModalOpen(true)} className="text-[11px] text-blue-600 font-semibold hover:underline">Update</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
              <Heart size={11} className="text-red-500 mx-auto mb-0.5" />
              <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.bp}</p>
              <p className="text-[9px] text-gray-400">BP (mmHg)</p>
              <p className="text-[9px] text-green-600 font-semibold">Normal</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
              <Activity size={11} className="text-blue-500 mx-auto mb-0.5" />
              <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.hr} bpm</p>
              <p className="text-[9px] text-gray-400">Heart Rate</p>
              <p className="text-[9px] text-green-600 font-semibold">Normal</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
              <Thermometer size={11} className="text-orange-500 mx-auto mb-0.5" />
              <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.temp}°C</p>
              <p className="text-[9px] text-gray-400">Body Temp</p>
              <p className="text-[9px] text-green-600 font-semibold">Normal</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
              <Droplets size={11} className="text-cyan-500 mx-auto mb-0.5" />
              <p className="text-xs font-bold text-gray-800">{selectedPatient.vitals.spo2}%</p>
              <p className="text-[9px] text-gray-400">SpO₂</p>
              <p className="text-[9px] text-green-600 font-semibold">Normal</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setVitalsModalOpen(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-blue-50/60 hover:border-blue-200 hover:shadow-2xs transition-all"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs"><Activity size={13} className="text-blue-600" /></div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Record Vitals</span>
            </button>
            <button
              onClick={() => setAdministerModalOpen(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-purple-50/60 hover:border-purple-200 hover:shadow-2xs transition-all"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs"><Pill size={13} className="text-purple-600" /></div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Administer Med</span>
            </button>
            <button
              onClick={() => setLabModalOpen(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-cyan-50/60 hover:border-cyan-200 hover:shadow-2xs transition-all"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs"><FlaskConical size={13} className="text-cyan-600" /></div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Collect Sample</span>
            </button>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 bg-emerald-50/60 hover:border-emerald-200 hover:shadow-2xs transition-all"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white shadow-2xs"><FileText size={13} className="text-emerald-600" /></div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Add Note</span>
            </button>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5"><FileText size={15} className="text-blue-600" /><h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Recent Notes</h3></div>
            <button onClick={() => setNoteModalOpen(true)} className="text-[11px] text-blue-600 font-semibold hover:underline">Add Note</button>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <p className="text-xs text-gray-700">Patient complains of mild chest pain. Vitals stable.</p>
            <p className="text-[10px] text-gray-400 mt-1">By: Aster Mulu (Nurse) · 09:42 AM</p>
          </div>
        </div>
      </aside>

      {/* Patient Details Modal */}
      <NursePatientDetailsModal
        patient={selectedPatient}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onRecordVitals={() => setVitalsModalOpen(true)}
        onAdministerMed={() => setAdministerModalOpen(true)}
        onCollectSample={() => setLabModalOpen(true)}
      />

      {/* Action Modals */}
      <RecordVitalsModal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
      <AdministerMedModal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
      <CollectLabModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
      <AddNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        selectedPatientId={selectedPatient.id}
      />
    </div>
  );
}
