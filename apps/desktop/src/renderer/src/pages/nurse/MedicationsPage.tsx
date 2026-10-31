import React, { useState, useMemo } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Calendar,
  FileText,
  AlertCircle,
  ShieldCheck,
  History,
  ClipboardList,
} from 'lucide-react';
import {
  NURSE_MEDICATIONS,
  NurseMedicationRecord,
  NURSE_MEDICATION_ALERTS,
} from '../../components/nurse/nurseMockData';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import NurseMedicationDetailsModal from '../../components/nurse/NurseMedicationDetailsModal';
import AdministerMedModal from '../../components/nurse/AdministerMedModal';

export function MedicationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'records' | 'pending' | 'missed' | 'refills'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedMed, setSelectedMed] = useState<NurseMedicationRecord>(NURSE_MEDICATIONS[0]!);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [medForAdminister, setMedForAdminister] = useState<NurseMedicationRecord | null>(null);

  const filteredMeds = useMemo(() => {
    return NURSE_MEDICATIONS.filter((med) => {
      if (activeTab === 'pending' && med.status !== 'Pending' && med.status !== 'Due Soon') return false;
      if (activeTab === 'missed' && med.status !== 'Missed') return false;
      if (activeTab === 'refills' && med.status !== 'Refill Due') return false;
      if (activeTab === 'records' && med.status !== 'Administered') return false;

      if (selectedStatus !== 'All Statuses' && med.status !== selectedStatus) return false;
      if (selectedDept !== 'All Departments' && med.department !== selectedDept) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = med.patientName.toLowerCase().includes(query);
        const matchPid = med.patientPid.toLowerCase().includes(query);
        const matchMed = med.medicationName.toLowerCase().includes(query);
        const matchRoom = med.room.toLowerCase().includes(query);
        if (!matchName && !matchPid && !matchMed && !matchRoom) return false;
      }
      return true;
    });
  }, [activeTab, selectedStatus, selectedDept, searchQuery]);

  const totalPages = Math.ceil(filteredMeds.length / rowsPerPage) || 1;
  const paginatedMeds = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMeds.slice(start, start + rowsPerPage);
  }, [filteredMeds, currentPage]);

  const stats = useMemo(() => {
    const total = NURSE_MEDICATIONS.length;
    const administered = NURSE_MEDICATIONS.filter((m) => m.status === 'Administered').length;
    const pending = NURSE_MEDICATIONS.filter((m) => m.status === 'Pending' || m.status === 'Due Soon').length;
    const missed = NURSE_MEDICATIONS.filter((m) => m.status === 'Missed').length;
    const refills = NURSE_MEDICATIONS.filter((m) => m.status === 'Refill Due').length;
    return { total, administered, pending, missed, refills };
  }, []);

  const handleOpenDetails = (med: NurseMedicationRecord) => {
    setSelectedMed(med);
    setDetailsModalOpen(true);
  };

  const handleOpenAdminister = (med: NurseMedicationRecord) => {
    setMedForAdminister(med);
    setAdministerModalOpen(true);
  };

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Pill size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Medications & eMAR</h1>
              <p className="text-xs text-gray-400 mt-0.5">Electronic Medication Administration Record and dose validation</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMedForAdminister(selectedMed);
              setAdministerModalOpen(true);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Pill size={13} />
            <span>Administer Dose</span>
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard icon={<Pill size={18} className="text-blue-600" />} iconBg="bg-blue-50" label="Total Prescribed" value={stats.total} trend="+4 new orders" trendUp />
          <NurseStatCard icon={<CheckCircle2 size={18} className="text-green-600" />} iconBg="bg-green-50" label="Administered" value={stats.administered} trend="92% on schedule" trendUp />
          <NurseStatCard icon={<Clock size={18} className="text-amber-600" />} iconBg="bg-amber-50" label="Pending / Due" value={stats.pending} trend="Next pass at 10:00" trendUp={false} />
          <NurseStatCard icon={<AlertTriangle size={18} className="text-red-600" />} iconBg="bg-red-50" label="Missed / Refills" value={stats.missed + stats.refills} trend="Requires verification" trendUp={false} />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Medications', count: stats.total },
            { id: 'pending', label: 'Due & Pending', count: stats.pending },
            { id: 'records', label: 'Administered', count: stats.administered },
            { id: 'missed', label: 'Missed', count: stats.missed },
            { id: 'refills', label: 'Refills Needed', count: stats.refills },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, medication, or room..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>All Departments</option>
              <option>Cardiology</option>
              <option>Internal Medicine</option>
              <option>Endocrinology</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>All Statuses</option>
              <option>Administered</option>
              <option>Pending</option>
              <option>Due Soon</option>
              <option>Missed</option>
              <option>Refill Due</option>
            </select>
          </div>
        </div>

        {/* Medications Table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Medication</th>
                  <th className="py-2.5 px-3">Dosage / Route</th>
                  <th className="py-2.5 px-3">Scheduled Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Prescriber</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedMeds.map((med) => {
                  const isSelected = selectedMed.id === med.id;
                  return (
                    <tr
                      key={med.id}
                      onClick={() => setSelectedMed(med)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <img src={med.patientAvatar} alt={med.patientName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{med.patientName}</p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {med.patientPid} · Room {med.room}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-800">{med.medicationName}</td>
                      <td className="py-2 px-3 text-gray-600">
                        {med.dose} · {med.route}
                      </td>
                      <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                        <span className="font-mono text-gray-800 block">{med.nextDue}</span>
                        <span className="text-[10px] text-gray-400">{med.schedule}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            med.status === 'Administered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : med.status === 'Due Soon'
                              ? 'bg-amber-100 text-amber-700'
                              : med.status === 'Missed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">{med.prescribingDoctor}</td>
                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(med)}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenAdminister(med)}
                            className="p-1.5 rounded-md border border-gray-200 text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Administer Dose"
                          >
                            <Pill size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-3.5 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredMeds.length)} of {filteredMeds.length} medications
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    currentPage === n ? 'bg-blue-600 text-white shadow-2xs' : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-72 xl:w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 space-y-3 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2.5">Selected Dose Details</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
              <div className="font-bold text-gray-900 text-sm">{selectedMed.medicationName}</div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {selectedMed.dose} · {selectedMed.route} ({selectedMed.schedule})
              </p>
              <div className="mt-2 pt-2 border-t border-blue-100/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Scheduled:</span>
                <span className="font-bold text-blue-700">{selectedMed.nextDue}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Patient:</span>
                <span className="font-semibold text-gray-800">{selectedMed.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-gray-700">Room {selectedMed.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Prescriber:</span>
                <span className="text-gray-700">{selectedMed.prescribingDoctor}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenAdminister(selectedMed)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Verify & Administer
            </button>
          </div>
        </div>

        {/* Clinical Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2">eMAR Safety Alerts</h3>
          <div className="space-y-2 text-xs">
            {NURSE_MEDICATION_ALERTS.map((alert, i) => (
              <div key={i} className="p-2 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <AlertCircle size={13} className="text-amber-600" />
                  <span>{alert.patientName}</span>
                </div>
                <p className="text-[10px] text-amber-800 mt-1">{alert.details}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Modals */}
      <NurseMedicationDetailsModal
        medication={selectedMed}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onAdminister={() => {
          setDetailsModalOpen(false);
          handleOpenAdminister(selectedMed);
        }}
      />
      <AdministerMedModal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
        selectedPatientId={medForAdminister?.patientId}
      />
    </div>
  );
}

export default React.memo(MedicationsPage);
