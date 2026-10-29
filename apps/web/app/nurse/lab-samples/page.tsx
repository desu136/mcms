'use client';

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
  Printer,
  FileText,
  AlertCircle,
  Barcode,
  Plus,
} from 'lucide-react';
import {
  NURSE_LAB_SAMPLES,
  NurseLabSample,
} from '@/components/nurse/nurseMockData';
import NurseLabSampleDetailsModal from '@/components/nurse/NurseLabSampleDetailsModal';
import CollectLabModal from '@/components/nurse/CollectLabModal';

export default function NurseLabSamplesPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'collected' | 'in_lab' | 'completed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedSampleType, setSelectedSampleType] = useState('All Sample Types');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Selected sample for right sidebar & detail modal
  const [selectedSample, setSelectedSample] = useState<NurseLabSample>(NURSE_LAB_SAMPLES[0]!);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);

  // Filtered samples
  const filteredSamples = useMemo(() => {
    return NURSE_LAB_SAMPLES.filter((sample) => {
      // Tab filter
      if (activeTab === 'pending' && sample.status !== 'Pending') return false;
      if (activeTab === 'collected' && sample.status !== 'Collected') return false;
      if (activeTab === 'in_lab' && sample.status !== 'In Lab') return false;
      if (activeTab === 'completed' && sample.status !== 'Completed') return false;

      // Dropdown filters
      if (selectedDept !== 'All Departments' && sample.department !== selectedDept) return false;
      if (selectedSampleType !== 'All Sample Types' && sample.sampleType !== selectedSampleType) return false;
      if (selectedPriority !== 'All Priorities' && sample.priority !== selectedPriority) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPatient = sample.patientName.toLowerCase().includes(q);
        const matchesTest = sample.testName.toLowerCase().includes(q);
        const matchesId = sample.sampleId.toLowerCase().includes(q);
        const matchesPid = sample.patientPid.toLowerCase().includes(q);
        if (!matchesPatient && !matchesTest && !matchesId && !matchesPid) return false;
      }

      return true;
    });
  }, [activeTab, selectedDept, selectedSampleType, selectedPriority, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSamples.length / rowsPerPage));
  const paginatedSamples = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSamples.slice(start, start + rowsPerPage);
  }, [filteredSamples, currentPage]);

  const handleOpenDetails = (sample: NurseLabSample) => {
    setSelectedSample(sample);
    setDetailsModalOpen(true);
  };

  const handleOpenCollect = (sample?: NurseLabSample) => {
    if (sample) setSelectedSample(sample);
    setCollectModalOpen(true);
  };

  const STATUS_STYLES: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Collected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Lab': 'bg-purple-50 text-purple-700 border-purple-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4F7FC] overflow-hidden">
      {/* Scrollable Main + Right Panel Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left / Center Table Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 sm:p-4 lg:p-5 space-y-3.5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
                <FlaskConical size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Lab Samples</h1>
                <p className="text-xs text-slate-500">
                  Collect, track and manage laboratory samples. Ensure proper labeling and timely handover to the laboratory.
                </p>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 shrink-0">
              <Calendar size={13} className="text-slate-400" />
              <span>Oct 19, 2026</span>
              <span className="text-slate-400 font-normal">Monday</span>
              <div className="flex items-center gap-0.5 ml-0.5 border-l border-slate-200 pl-1">
                <button className="p-0.5 hover:bg-slate-100 rounded text-slate-500">
                  <ChevronLeft size={12} />
                </button>
                <button className="p-0.5 hover:bg-slate-100 rounded text-slate-500">
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards (5 across) - Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Total Samples */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <FlaskConical size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Total Samples</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">48</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 12% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* Collected */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Collected</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">32</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 18% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* Pending Collection */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Pending Collection</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">8</span>
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5">
                  ↓ 33% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* In Lab */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Truck size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">In Lab</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">5</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 25% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileCheck size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Completed</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">3</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 50% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Pill Tabs - Compact */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              Pending Collection (8)
            </button>
            <button
              onClick={() => setActiveTab('collected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'collected'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              Collected (32)
            </button>
            <button
              onClick={() => setActiveTab('in_lab')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'in_lab'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              In Lab (5)
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              Completed (3)
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              All Samples (48)
            </button>
          </div>

          {/* Search & Filter Bar - Compact */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by patient name, test name, or sample ID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Departments</option>
                <option>Cardiology</option>
                <option>Internal Medicine</option>
                <option>Urology</option>
                <option>Gastroenterology</option>
                <option>Nephrology</option>
                <option>Endocrinology</option>
              </select>

              <select
                value={selectedSampleType}
                onChange={(e) => {
                  setSelectedSampleType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Sample Types</option>
                <option>Blood</option>
                <option>Urine</option>
                <option>Stool</option>
                <option>Swab</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Priorities</option>
                <option>High</option>
                <option>Normal</option>
                <option>Urgent</option>
              </select>

              <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors">
                <Filter size={13} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Lab Samples Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3.5 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                    </th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Sample ID</th>
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Sample Type</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Collection Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSamples.map((sample) => {
                    const isSelected = selectedSample.id === sample.id;
                    return (
                      <tr
                        key={sample.id}
                        onClick={() => setSelectedSample(sample)}
                        className={`hover:bg-cyan-50/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={sample.patientAvatar}
                              alt={sample.patientName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-2xs"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{sample.patientName}</p>
                              <p className="text-[11px] text-slate-400">
                                {sample.patientPid} • {sample.room}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                          {sample.sampleId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900">{sample.testName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                            {sample.sampleType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              sample.priority === 'High'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sample.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {sample.collectionTime}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              STATUS_STYLES[sample.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {sample.status}
                          </span>
                        </td>
                        {/* Actions column with Eye button for View Details modal */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenDetails(sample)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 transition-colors shadow-2xs"
                              title="View Sample Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenCollect(sample)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                              title="More Options"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-white gap-3 text-xs text-slate-500">
              <span>
                Showing {filteredSamples.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
                {Math.min(currentPage * rowsPerPage, filteredSamples.length)} of {filteredSamples.length} samples
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Details Panel */}
        <aside className="w-full lg:w-80 xl:w-88 border-t lg:border-t-0 lg:border-l border-slate-200/80 bg-white p-3.5 sm:p-4 space-y-3.5 overflow-y-auto shrink-0">
          {/* Patient Details Header Card */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <FlaskConical size={15} className="text-cyan-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Patient Details
                </h3>
              </div>
              <button
                onClick={() => handleOpenDetails(selectedSample)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-xs bg-slate-100">
                <img
                  src={selectedSample.patientAvatar}
                  alt={selectedSample.patientName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{selectedSample.patientName}</h4>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    High Priority
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedSample.patientPid} • 28 yrs • Female
                </p>
                <p className="text-xs text-blue-600 font-medium">{selectedSample.room}</p>
              </div>
            </div>

            <div className="space-y-0.5 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <p>{selectedSample.phone}</p>
              <p>{selectedSample.email}</p>
              <p>{selectedSample.address}</p>
            </div>
          </div>

          {/* Current Visit */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
              Current Visit
            </h4>
            <p className="font-semibold text-slate-900">Oct 19, 2026 • 08:00 AM</p>
            <p className="text-slate-500">{selectedSample.department} • {selectedSample.doctor}</p>
          </div>

          {/* Lab Sample Information */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Lab Sample Information
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Sample ID</span>
              <span className="font-mono font-bold text-slate-800">{selectedSample.sampleId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Test Name</span>
              <span className="font-semibold text-slate-800">{selectedSample.testName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Sample Type</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                {selectedSample.sampleType}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Collection Time</span>
              <span className="font-semibold text-slate-800">{selectedSample.collectionTime}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Status</span>
              <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full text-[10px]">
                {selectedSample.status}
              </span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleOpenCollect(selectedSample)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <FlaskConical size={18} className="text-cyan-600" />
                <span className="text-xs font-semibold">Collect Sample</span>
              </button>

              <button
                onClick={() => window.print()}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <Printer size={18} className="text-blue-600" />
                <span className="text-xs font-semibold">Print Label</span>
              </button>

              <button
                onClick={() => handleOpenDetails(selectedSample)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <FileText size={18} className="text-emerald-600" />
                <span className="text-xs font-semibold">View Result</span>
              </button>

              <button
                onClick={() => handleOpenDetails(selectedSample)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <Truck size={18} className="text-purple-600" />
                <span className="text-xs font-semibold">Handover to Lab</span>
              </button>
            </div>
          </div>

          {/* Lab Handover Tracking Stepper */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Lab Handover Tracking
              </h4>
              <span className="text-[11px] font-semibold text-blue-600 cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="space-y-3 text-xs pl-2">
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-100" />
                <div>
                  <p className="font-bold text-slate-900">Sample Collected</p>
                  <p className="text-[11px] text-slate-400">Oct 19, 2026 • 08:15 AM</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0 ring-4 ring-blue-100" />
                <div>
                  <p className="font-bold text-slate-900">Delivered to Lab</p>
                  <p className="text-[11px] text-slate-400">Oct 19, 2026 • 09:00 AM</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1 shrink-0 ring-4 ring-purple-100" />
                <div>
                  <p className="font-bold text-slate-900">Processing</p>
                  <p className="text-[11px] text-purple-600 font-semibold">In Progress</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-slate-500">Result Available</p>
                  <p className="text-[11px] text-slate-400">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Lab Sample Details Modal */}
      <NurseLabSampleDetailsModal
        sample={selectedSample}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onCollect={(s) => handleOpenCollect(s)}
      />

      {/* Collect Lab Sample Modal */}
      <CollectLabModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        selectedPatientId={selectedSample.patientId}
      />
    </div>
  );
}
