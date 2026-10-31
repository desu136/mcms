import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  Truck,
  FileCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Calendar,
  Barcode,
  Printer,
  AlertCircle,
} from 'lucide-react';
import {
  NURSE_LAB_SAMPLES,
  NurseLabSample,
} from '../../components/nurse/nurseMockData';
import { NurseStatCard } from '../../components/nurse/NurseStatCard';
import NurseLabSampleDetailsModal from '../../components/nurse/NurseLabSampleDetailsModal';
import CollectLabModal from '../../components/nurse/CollectLabModal';

export function LabSamplesPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'collected' | 'in_lab' | 'completed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedSampleType, setSelectedSampleType] = useState('All Sample Types');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedSample, setSelectedSample] = useState<NurseLabSample>(NURSE_LAB_SAMPLES[0]!);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);

  const filteredSamples = useMemo(() => {
    return NURSE_LAB_SAMPLES.filter((sample) => {
      if (activeTab === 'pending' && sample.status !== 'Pending') return false;
      if (activeTab === 'collected' && sample.status !== 'Collected') return false;
      if (activeTab === 'in_lab' && sample.status !== 'In Lab') return false;
      if (activeTab === 'completed' && sample.status !== 'Completed') return false;

      if (selectedDept !== 'All Departments' && sample.department !== selectedDept) return false;
      if (selectedSampleType !== 'All Sample Types' && sample.sampleType !== selectedSampleType) return false;
      if (selectedPriority !== 'All Priorities' && sample.priority !== selectedPriority) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sample.patientName.toLowerCase().includes(q);
        const matchPid = sample.patientPid.toLowerCase().includes(q);
        const matchTest = sample.testName.toLowerCase().includes(q);
        const matchBar = sample.sampleId.toLowerCase().includes(q);
        if (!matchName && !matchPid && !matchTest && !matchBar) return false;
      }
      return true;
    });
  }, [activeTab, selectedDept, selectedSampleType, selectedPriority, searchQuery]);

  const totalPages = Math.ceil(filteredSamples.length / rowsPerPage) || 1;
  const paginatedSamples = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSamples.slice(start, start + rowsPerPage);
  }, [filteredSamples, currentPage]);

  const stats = useMemo(() => {
    const total = NURSE_LAB_SAMPLES.length;
    const pending = NURSE_LAB_SAMPLES.filter((s) => s.status === 'Pending').length;
    const collected = NURSE_LAB_SAMPLES.filter((s) => s.status === 'Collected').length;
    const inLab = NURSE_LAB_SAMPLES.filter((s) => s.status === 'In Lab').length;
    const completed = NURSE_LAB_SAMPLES.filter((s) => s.status === 'Completed').length;
    return { total, pending, collected, inLab, completed };
  }, []);

  const handleOpenDetails = (sample: NurseLabSample) => {
    setSelectedSample(sample);
    setDetailsModalOpen(true);
  };

  return (
    <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <FlaskConical size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Lab Sample Collection</h1>
              <p className="text-xs text-gray-400 mt-0.5">Collect phlebotomy, urine, and pathology specimens with barcode tracking</p>
            </div>
          </div>
          <button
            onClick={() => setCollectModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FlaskConical size={13} />
            <span>Collect Specimen</span>
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <NurseStatCard icon={<Clock size={18} className="text-amber-600" />} iconBg="bg-amber-50" label="Pending Collection" value={stats.pending} trend="2 STAT orders" trendUp={false} />
          <NurseStatCard icon={<CheckCircle2 size={18} className="text-blue-600" />} iconBg="bg-blue-50" label="Collected (In Ward)" value={stats.collected} trend="Awaiting courier" trendUp />
          <NurseStatCard icon={<Truck size={18} className="text-purple-600" />} iconBg="bg-purple-50" label="Dispatched to Lab" value={stats.inLab} trend="Under processing" trendUp />
          <NurseStatCard icon={<FileCheck size={18} className="text-green-600" />} iconBg="bg-green-50" label="Results Verified" value={stats.completed} trend="Available in EHR" trendUp />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'pending', label: 'Pending Collection', count: stats.pending },
            { id: 'collected', label: 'Collected in Ward', count: stats.collected },
            { id: 'in_lab', label: 'In Lab', count: stats.inLab },
            { id: 'completed', label: 'Results Ready', count: stats.completed },
            { id: 'all', label: 'All Orders', count: stats.total },
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
              placeholder="Search by patient, test name, or barcode..."
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
              value={selectedSampleType}
              onChange={(e) => {
                setSelectedSampleType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>All Sample Types</option>
              <option>Blood</option>
              <option>Urine</option>
              <option>Swab</option>
              <option>CSF</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>All Priorities</option>
              <option>STAT</option>
              <option>Urgent</option>
              <option>Routine</option>
            </select>
          </div>
        </div>

        {/* Samples Table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Test Ordered</th>
                  <th className="py-2.5 px-3">Sample Type</th>
                  <th className="py-2.5 px-3">Barcode</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Ordered By</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedSamples.map((sample) => {
                  const isSelected = selectedSample.id === sample.id;
                  return (
                    <tr
                      key={sample.id}
                      onClick={() => setSelectedSample(sample)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <img src={sample.patientAvatar} alt={sample.patientName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{sample.patientName}</p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {sample.patientPid} · Room {sample.room}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-800">{sample.testName}</td>
                      <td className="py-2 px-3 text-gray-600">{sample.sampleType}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-gray-600">{sample.sampleId}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sample.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : sample.priority === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sample.priority}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            sample.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : sample.status === 'In Lab'
                              ? 'bg-purple-100 text-purple-700'
                              : sample.status === 'Collected'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {sample.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">{sample.doctor}</td>
                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(sample)}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Specimen Details"
                          >
                            <Eye size={13} />
                          </button>
                          {sample.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setSelectedSample(sample);
                                setCollectModalOpen(true);
                              }}
                              className="p-1.5 rounded-md border border-gray-200 text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer"
                              title="Collect Sample"
                            >
                              <FlaskConical size={13} />
                            </button>
                          )}
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
              Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredSamples.length)} of {filteredSamples.length} orders
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
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-2.5">Specimen Barcode Tag</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <div className="font-mono text-base font-black tracking-widest text-slate-800">{selectedSample.sampleId}</div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mt-1">
                <Barcode size={16} />
                <span>2D Barcode Generated</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Patient:</span>
                <span className="font-semibold text-gray-800">{selectedSample.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Test:</span>
                <span className="text-gray-800 font-medium">{selectedSample.testName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Specimen:</span>
                <span className="text-gray-700">{selectedSample.sampleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority:</span>
                <span className="font-bold text-rose-600">{selectedSample.priority}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedSample(selectedSample);
                setCollectModalOpen(true);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Collect & Print Tube Label
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <NurseLabSampleDetailsModal
        sample={selectedSample}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onCollect={() => {
          setDetailsModalOpen(false);
          setCollectModalOpen(true);
        }}
      />
      <CollectLabModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        selectedPatientId={selectedSample.patientId}
      />
    </div>
  );
}

export default React.memo(LabSamplesPage);
