'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Pencil,
  X,
  Check,
  ScanLine,
  Send,
  History,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import LabPageShell from '../../../components/lab/LabPageShell';
import LabStatCard from '../../../components/lab/LabStatCard';
import {
  TestResultItem,
  RESULTS_KPI_STATS,
  EXACT_RESULT_ROWS,
  RESULT_STATUS_DISTRIBUTION,
  RECENT_RESULTS,
  ABNORMAL_ALERTS,
} from '../../../components/lab/resultsMockData';

export default function LabTestResultsPage() {
  const [results, setResults] = useState<TestResultItem[]>(EXACT_RESULT_ROWS);
  const [selectedResult, setSelectedResult] = useState<TestResultItem>(EXACT_RESULT_ROWS[0]!);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTestType, setSelectedTestType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['res-0048']);
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [isEnterResultModalOpen, setIsEnterResultModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      // Department filter
      if (selectedDepartment !== 'All' && res.department !== selectedDepartment) return false;
      // Test Type filter
      if (selectedTestType !== 'All' && res.testName !== selectedTestType) return false;
      // Status filter
      if (selectedStatus !== 'All' && res.status !== selectedStatus) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          res.patientName.toLowerCase().includes(q) ||
          res.sampleId.toLowerCase().includes(q) ||
          res.resultId.toLowerCase().includes(q) ||
          res.testName.toLowerCase().includes(q) ||
          res.department.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [results, selectedDepartment, selectedTestType, selectedStatus, searchQuery]);

  const handleSelectResult = (item: TestResultItem) => {
    setSelectedResult(item);
    setSelectedRowIds([item.id]);
  };

  const handleToggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRowIds.length === filteredResults.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredResults.map((s) => s.id));
    }
  };

  const handleReleaseResult = (res: TestResultItem) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === res.id ? { ...r, status: 'Verified' as const } : r
      )
    );
    if (selectedResult.id === res.id) {
      setSelectedResult((prev) => ({ ...prev, status: 'Verified' as const }));
    }
    showToast(`Result ${res.resultId} verified and released to doctor.`);
  };

  const handleRejectResult = (res: TestResultItem) => {
    showToast(`Result ${res.resultId} marked for review / sample recollection.`);
  };

  // Top Header Row matching screenshot
  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Subtitle with Flask/Beaker Icon */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
          <FlaskConical className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Test Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View, enter, and manage laboratory test results. Check reference ranges and release results to doctors.
          </p>
        </div>
      </div>

      {/* Date Selector & + Enter Test Result button */}
      <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 leading-none">{calendarDate}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Tuesday</div>
          </div>
          <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-200">
            <button
              onClick={() => setCalendarDate('Oct 18, 2026')}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCalendarDate('Oct 20, 2026')}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsEnterResultModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Enter Test Result</span>
        </button>
      </div>
    </div>
  );

  // 5 KPI Stat Cards matching screenshot
  const kpiContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard
        title="Total Results"
        value={RESULTS_KPI_STATS.totalResults.value}
        color="cyan"
        change={RESULTS_KPI_STATS.totalResults}
      />
      <LabStatCard
        title="Completed"
        value={RESULTS_KPI_STATS.completed.value}
        color="emerald"
        change={RESULTS_KPI_STATS.completed}
      />
      <LabStatCard
        title="Pending Review"
        value={RESULTS_KPI_STATS.pendingReview.value}
        color="amber"
        change={RESULTS_KPI_STATS.pendingReview}
      />
      <LabStatCard
        title="Abnormal Results"
        value={RESULTS_KPI_STATS.abnormalResults.value}
        color="rose"
        change={RESULTS_KPI_STATS.abnormalResults}
      />
      <LabStatCard
        title="Verified & Released"
        value={RESULTS_KPI_STATS.verifiedAndReleased.value}
        color="blue"
        change={RESULTS_KPI_STATS.verifiedAndReleased}
      />
    </div>
  );

  // Status Badge helper
  const renderStatusBadge = (status: TestResultItem['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Verified
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            Completed
          </span>
        );
      case 'Reviewed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
            Reviewed
          </span>
        );
      case 'Abnormal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            Abnormal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Right Panel: Patient Information & Test Result Details
  const rightPanelContent = (
    <div className="space-y-4">
      {/* 1. Patient Information */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <span className="text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>Patient Information</span>
          </div>
          <button
            onClick={() => showToast(`Navigating to patient profile for ${selectedResult.patientName}...`)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View Full Profile
          </button>
        </div>

        <div className="pt-4 flex items-start gap-3.5">
          <img
            src={selectedResult.patientAvatar}
            alt={selectedResult.patientName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-slate-800 text-base leading-tight truncate">
              {selectedResult.patientName}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {selectedResult.patientId} • {selectedResult.patientAge} years • {selectedResult.patientGender}
            </div>
            <div className="mt-1">
              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 rounded-md">
                {selectedResult.patientBed}
              </span>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium">{selectedResult.patientPhone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium truncate">{selectedResult.patientEmail}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium">{selectedResult.patientCity}</span>
          </div>
        </div>
      </div>

      {/* 2. Test Result Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <FlaskConical className="w-4 h-4 text-blue-600" />
            <span>Test Result Details</span>
          </div>
          <button
            onClick={() => showToast(`Printing official report for ${selectedResult.resultId}...`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="pt-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 font-medium">Result ID</span>
            <span className="font-bold text-slate-800">{selectedResult.resultId}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 font-medium">Sample ID</span>
            <span className="font-semibold text-slate-700">{selectedResult.sampleId}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 font-medium">Test Name</span>
            <span className="font-semibold text-slate-800 text-right">{selectedResult.testFullName}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 font-medium">Department</span>
            <span className="font-semibold text-slate-700">{selectedResult.department}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 font-medium">Collected</span>
            <span className="font-semibold text-slate-700">{selectedResult.collectedAt}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 font-medium">Completed</span>
            <span className="font-semibold text-slate-700">{selectedResult.completedAt}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 font-medium">Status</span>
            {renderStatusBadge(selectedResult.status)}
          </div>
        </div>
      </div>

      {/* 3. Test Results (Parameters Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-sm">
          <FlaskConical className="w-4 h-4 text-blue-600" />
          <span>Test Results</span>
        </div>

        <div className="pt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                <th className="pb-2 font-bold">Parameter</th>
                <th className="pb-2 font-bold">Result</th>
                <th className="pb-2 font-bold">Unit</th>
                <th className="pb-2 font-bold">Reference Range</th>
                <th className="pb-2 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedResult.parameters.map((param, index) => (
                <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 font-bold text-slate-800">{param.parameter}</td>
                  <td className={`py-2.5 font-semibold ${param.status === 'High' || param.status === 'Abnormal' ? 'text-rose-600' : 'text-slate-700'}`}>
                    {param.result}
                  </td>
                  <td className="py-2.5 text-slate-500 font-medium">{param.unit || '-'}</td>
                  <td className="py-2.5 text-slate-500">{param.referenceRange}</td>
                  <td className="py-2.5 text-right">
                    {param.status === 'Normal' ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        Normal
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                        {param.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Result Notes */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-sm">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Result Notes</span>
        </div>

        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {selectedResult.notes}
          </p>
          <div className="mt-2 text-[11px] text-blue-600 font-medium flex items-center gap-1.5">
            <span>Verified by: {selectedResult.verifiedBy}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{selectedResult.verifiedAt}</span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Action Buttons matching screenshot */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          onClick={() => {
            setIsEnterResultModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition active:scale-[0.98]"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit Result</span>
        </button>

        <button
          onClick={() => handleReleaseResult(selectedResult)}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-500/20 transition active:scale-[0.98]"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Release Result</span>
        </button>

        <button
          onClick={() => handleRejectResult(selectedResult)}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs shadow-2xs transition active:scale-[0.98]"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <LabPageShell
        header={headerContent}
        kpis={kpiContent}
        rightPanel={rightPanelContent}
        rightPanelWidth="lg:w-[350px] xl:w-[380px] 2xl:w-[410px]"
      >
        {/* Main Content Column */}
        <div className="space-y-4">
          {/* Search Bar & Dropdowns Filter Row */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient name, sample ID, or test name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Immunology">Immunology</option>
                <option value="Parasitology">Parasitology</option>
                <option value="Virology">Virology</option>
                <option value="Serology">Serology</option>
              </select>

              <select
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All">All Test Types</option>
                <option value="CBC">CBC</option>
                <option value="RBS">RBS</option>
                <option value="Urine Analysis">Urine Analysis</option>
                <option value="LFT">LFT</option>
                <option value="KFT">KFT</option>
                <option value="Thyroid Profile">Thyroid Profile</option>
                <option value="Stool Examination">Stool Examination</option>
                <option value="Malaria Test">Malaria Test</option>
                <option value="Hepatitis B Surface Ag">Hepatitis B Surface Ag</option>
                <option value="HIV Screening">HIV Screening</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Completed">Completed</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Abnormal">Abnormal</option>
              </select>

              <button
                onClick={() => {
                  setSelectedDepartment('All');
                  setSelectedTestType('All');
                  setSelectedStatus('All');
                  setSearchQuery('');
                  showToast('Filters reset.');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50/70 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Test Results Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header Bar */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Test Results List</h2>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === filteredResults.length && filteredResults.length > 0}
                        onChange={handleSelectAllRows}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Result ID</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Test Name</th>
                    <th className="py-3 px-3">Sample ID</th>
                    <th className="py-3 px-3">Result</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Completed At</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                    <th className="py-3 px-2 text-center text-slate-400 font-normal">--</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredResults.map((item) => {
                    const isSelected = selectedResult.id === item.id;
                    const isChecked = selectedRowIds.includes(item.id);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className={`transition-colors cursor-pointer ${isSelected
                            ? 'bg-blue-50/70 hover:bg-blue-50'
                            : 'hover:bg-slate-50/80'
                          }`}
                      >
                        <td className="py-3 px-4" onClick={(e) => handleToggleSelectRow(e, item.id)}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => { }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {item.resultId}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{item.patientName}</div>
                          <div className="text-[11px] text-slate-400">{item.patientRoom}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {item.testName}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                          {item.sampleId}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.isResultPositiveBadge ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
                              {item.resultValue}
                            </span>
                          ) : (
                            <span className="text-slate-800 font-semibold">{item.resultValue}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                          <div>{item.completedAt.split(' ').slice(0, 3).join(' ')}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.completedAt.split(' ').slice(3).join(' ')}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectResult(item)}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                handleSelectResult(item);
                                setIsEnterResultModalOpen(true);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title="Edit Result"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => showToast(`Options for ${item.resultId}`)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title="More"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300">
                          <span>•••</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer matching screenshot */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-700">1-10</span> of{' '}
                <span className="font-semibold text-slate-700">152</span> results
              </div>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
                  1
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                  2
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                  3
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                  4
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                  5
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                  16
                </button>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rows Per Page */}
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom 4 Cards Grid matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* 1. Recent Results */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Recent Results</span>
                  </div>
                  <button
                    onClick={() => showToast('Opening all recent results...')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="pt-3 space-y-2.5">
                  {RECENT_RESULTS.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.isAlert ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <span className={`w-2 h-2 rounded-full ${item.indicatorColor} shrink-0`} />
                        )}
                        <span className="font-semibold text-slate-800 truncate">
                          {item.patient} • {item.test}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {renderStatusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Result Status Distribution */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Result Status Distribution</span>
              </div>

              <div className="pt-3 flex-1 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Donut Chart with center label */}
                <div className="relative w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={RESULT_STATUS_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={54}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {RESULT_STATUS_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-extrabold text-slate-800 leading-tight">152</span>
                    <span className="text-[9px] font-bold text-slate-400">Total Results</span>
                  </div>
                </div>

                {/* Legend matching screenshot */}
                <div className="space-y-1.5 text-xs flex-1 w-full sm:w-auto">
                  {RESULT_STATUS_DISTRIBUTION.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-600 font-medium text-[11px] truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-800 font-bold text-[11px]">
                        {item.value} ({item.percentage})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Quick Actions */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  <span>Quick Actions</span>
                </div>

                <div className="pt-3 space-y-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setIsEnterResultModalOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Enter Test Result</span>
                  </button>

                  <button
                    onClick={() => showToast('Opening barcode scanner tool...')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <ScanLine className="w-4 h-4 text-blue-600" />
                    <span>Scan Sample Barcode</span>
                  </button>

                  <button
                    onClick={() => showToast('Printing summary report...')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>View Test Details / Print Report</span>
                  </button>

                  <button
                    onClick={() => handleReleaseResult(selectedResult)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>Release Results</span>
                  </button>

                  <button
                    onClick={() => showToast(`Opening patient history for ${selectedResult.patientName}...`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <History className="w-4 h-4 text-blue-600" />
                    <span>View Patient History</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Abnormal Results Alerts */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Abnormal Results Alerts</span>
                  </div>
                  <button
                    onClick={() => showToast('Opening all abnormal result alerts...')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="pt-3 space-y-2.5">
                  {ABNORMAL_ALERTS.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{alert.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {alert.subtitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </LabPageShell>

      {/* Enter Test Result Modal */}
      {isEnterResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Enter Test Result</h3>
              </div>
              <button
                onClick={() => setIsEnterResultModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900">{selectedResult.patientName}</div>
                  <div className="text-[11px] text-blue-700">
                    {selectedResult.testFullName} ({selectedResult.sampleId})
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-blue-900">
                  {selectedResult.resultId}
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Result Summary</label>
                <input
                  type="text"
                  defaultValue={selectedResult.resultValue}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Result Notes</label>
                <textarea
                  rows={3}
                  defaultValue={selectedResult.notes}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setIsEnterResultModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEnterResultModalOpen(false);
                  showToast('Test result updated successfully.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}




