'use client';

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
  Plus,
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
} from '@/components/nurse/nurseMockData';
import NurseMedicationDetailsModal from '@/components/nurse/NurseMedicationDetailsModal';
import AdministerMedModal from '@/components/nurse/AdministerMedModal';

export default function NurseMedicationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'records' | 'pending' | 'missed' | 'refills'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Selected patient for right sidebar & detail modal
  const [selectedMed, setSelectedMed] = useState<NurseMedicationRecord>(NURSE_MEDICATIONS[0]!);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [medForAdminister, setMedForAdminister] = useState<NurseMedicationRecord | null>(null);

  // Filtered medications
  const filteredMeds = useMemo(() => {
    return NURSE_MEDICATIONS.filter((med) => {
      // Tab filter
      if (activeTab === 'pending' && med.status !== 'Pending' && med.status !== 'Due Soon') return false;
      if (activeTab === 'missed' && med.status !== 'Missed') return false;
      if (activeTab === 'refills' && med.status !== 'Refill Due') return false;
      if (activeTab === 'records' && med.status !== 'Administered') return false;

      // Status dropdown
      if (selectedStatus !== 'All Statuses' && med.status !== selectedStatus) return false;

      // Department dropdown
      if (selectedDept !== 'All Departments' && med.department !== selectedDept) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = med.patientName.toLowerCase().includes(q);
        const matchesMed = med.medicationName.toLowerCase().includes(q);
        const matchesPid = med.patientPid.toLowerCase().includes(q);
        const matchesCond = med.condition.toLowerCase().includes(q);
        if (!matchesName && !matchesMed && !matchesPid && !matchesCond) return false;
      }

      return true;
    });
  }, [activeTab, selectedStatus, selectedDept, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMeds.length / rowsPerPage));
  const paginatedMeds = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMeds.slice(start, start + rowsPerPage);
  }, [filteredMeds, currentPage]);

  const handleOpenDetails = (med: NurseMedicationRecord) => {
    setSelectedMed(med);
    setDetailsModalOpen(true);
  };

  const handleOpenAdminister = (med?: NurseMedicationRecord) => {
    setMedForAdminister(med || selectedMed);
    setAdministerModalOpen(true);
  };

  const STATUS_STYLES: Record<string, string> = {
    Administered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-sky-50 text-sky-700 border-sky-200',
    'Due Soon': 'bg-amber-50 text-amber-700 border-amber-200',
    Missed: 'bg-rose-50 text-rose-700 border-rose-200',
    'Refill Due': 'bg-purple-50 text-purple-700 border-purple-200',
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
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Pill size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Medications</h1>
                <p className="text-xs text-slate-500">
                  Manage medication administration, view schedules, and track patient compliance.
                </p>
              </div>
            </div>

            {/* Date Picker & Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
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

              <button
                onClick={() => handleOpenAdminister()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus size={14} />
                <span>Record Medication</span>
              </button>
            </div>
          </div>

          {/* Stat Cards (5 across) - Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Total Medications */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Pill size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Total Medications</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">48</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 12% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* Administered */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Administered</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">36</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 18% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Pending</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">8</span>
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5">
                  ↓ 33% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* Missed Doses */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Missed Doses</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">4</span>
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5">
                  ↓ 50% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>

            {/* Refills Due */}
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <RotateCw size={17} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block truncate">Refills Due</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">6</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  ↑ 20% <span className="text-slate-400 font-normal hidden sm:inline">vs. yest.</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Pill Tabs - Compact */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              Medication Schedule
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'records'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              Administration Records
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Clock size={12} className={activeTab === 'pending' ? 'text-white' : 'text-amber-500'} />
              <span>Pending Doses (8)</span>
            </button>
            <button
              onClick={() => setActiveTab('missed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'missed'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle size={12} className={activeTab === 'missed' ? 'text-white' : 'text-rose-500'} />
              <span>Missed Doses (4)</span>
            </button>
            <button
              onClick={() => setActiveTab('refills')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'refills'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <RotateCw size={12} className={activeTab === 'refills' ? 'text-white' : 'text-purple-500'} />
              <span>Refills Due (6)</span>
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
                placeholder="Search by patient name, medication, or reason..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
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
                <option>Endocrinology</option>
                <option>Orthopedics</option>
                <option>ENT</option>
                <option>Surgery</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Statuses</option>
                <option>Administered</option>
                <option>Pending</option>
                <option>Due Soon</option>
                <option>Missed</option>
                <option>Refill Due</option>
              </select>

              <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors">
                <Filter size={13} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Medications Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3.5 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                    </th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Medication</th>
                    <th className="py-3 px-4">Dose & Route</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Next Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMeds.map((med) => {
                    const isSelected = selectedMed.id === med.id;
                    return (
                      <tr
                        key={med.id}
                        onClick={() => setSelectedMed(med)}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={med.patientAvatar}
                              alt={med.patientName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-2xs"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{med.patientName}</p>
                              <p className="text-[11px] text-slate-400">
                                {med.patientPid} • {med.room}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 text-xs">{med.medicationName}</p>
                          <p className="text-[11px] text-slate-500">{med.condition}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-900 text-xs">{med.dose}</p>
                          <p className="text-[11px] text-slate-500">{med.route}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800 text-xs">{med.schedule}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-600 text-xs font-medium">{med.nextDue}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              STATUS_STYLES[med.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {med.status}
                          </span>
                        </td>
                        {/* Actions column with Eye details button & More menu */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenDetails(med)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-2xs"
                              title="View Medication Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenAdminister(med)}
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
                Showing {filteredMeds.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
                {Math.min(currentPage * rowsPerPage, filteredMeds.length)} of {filteredMeds.length} medications
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
          {/* Patient Medication Details Header */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Pill size={15} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Patient Medication Details
                </h3>
              </div>
              <button
                onClick={() => handleOpenDetails(selectedMed)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-xs bg-slate-100">
                <img
                  src={selectedMed.patientAvatar}
                  alt={selectedMed.patientName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{selectedMed.patientName}</h4>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedMed.patientPid} • {selectedMed.age} yrs • {selectedMed.gender}
                </p>
                <p className="text-xs text-blue-600 font-medium">{selectedMed.room}</p>
              </div>
            </div>

            <div className="space-y-0.5 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
              <p>{selectedMed.phone}</p>
              <p>{selectedMed.email}</p>
              <p>{selectedMed.address}</p>
            </div>
          </div>

          {/* Current Medications (4) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Current Medications (4)
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-bold text-slate-900">Metformin 500 mg (BID)</p>
                  <p className="text-[11px] text-slate-500">Taken with meals</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  On Track
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-bold text-slate-900">Paracetamol 1 g (QID)</p>
                  <p className="text-[11px] text-slate-500">For mild pain</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  On Track
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-bold text-slate-900">Vitamin D3 1000 IU (Daily)</p>
                  <p className="text-[11px] text-slate-500">Morning supplement</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  On Track
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="text-xs font-bold text-slate-900">Omeprazole 20 mg (Daily)</p>
                  <p className="text-[11px] text-slate-500">30 min before food</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Due Soon
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleOpenAdminister()}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <Pill size={18} className="text-blue-600" />
                <span className="text-xs font-semibold">Record Medication</span>
              </button>

              <button
                onClick={() => handleOpenDetails(selectedMed)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <History size={18} className="text-emerald-600" />
                <span className="text-xs font-semibold leading-tight">View Administration History</span>
              </button>

              <button
                onClick={() => handleOpenDetails(selectedMed)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <AlertTriangle size={18} className="text-amber-600" />
                <span className="text-xs font-semibold leading-tight">Check Interactions</span>
              </button>

              <button
                onClick={() => handleOpenDetails(selectedMed)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-all text-left flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs"
              >
                <ClipboardList size={18} className="text-purple-600" />
                <span className="text-xs font-semibold leading-tight">View Medication List</span>
              </button>
            </div>
          </div>

          {/* Medication Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Medication Alerts
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="space-y-2">
              {NURSE_MEDICATION_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{alert.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {alert.patientName} • {alert.details}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      alert.type === 'missed'
                        ? 'bg-rose-100 text-rose-700'
                        : alert.type === 'refill'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {alert.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Medication Details Modal */}
      <NurseMedicationDetailsModal
        medication={selectedMed}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onAdminister={(med) => handleOpenAdminister(med)}
      />

      {/* Administer Medication Modal */}
      <AdministerMedModal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
        selectedPatientId={medForAdminister?.patientId || selectedMed.patientId}
      />
    </div>
  );
}
