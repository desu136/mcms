'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  TestTube2,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
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
  RefreshCw,
  MessageSquare,
  QrCode,
  FileText,
  User,
  ShieldCheck,
  Check,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import LabPageShell from '../../../components/lab/LabPageShell';
import LabStatCard from '../../../components/lab/LabStatCard';
import {
  SampleItem,
  SAMPLE_KPI_STATS,
  EXACT_SAMPLE_ROWS,
  SAMPLE_STATUS_DISTRIBUTION,
  RECENT_SAMPLE_ACTIVITIES,
  HANDOVER_TRACKING_STEPS,
} from '../../../components/lab/sampleMockData';

type FilterTab = 'all' | 'collected' | 'processing' | 'completed' | 'rejected';

export default function LabSampleManagementPage() {
  const [samples] = useState<SampleItem[]>(EXACT_SAMPLE_ROWS);
  const [selectedSample, setSelectedSample] = useState<SampleItem>(EXACT_SAMPLE_ROWS[0]!);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSampleType, setSelectedSampleType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['smp-0018']);
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');

  // Filtered samples logic
  const filteredSamples = useMemo(() => {
    return samples.filter((smp) => {
      // Tab filter
      if (activeTab === 'collected' && smp.status !== 'Collected') return false;
      if (activeTab === 'processing' && smp.status !== 'In Processing') return false;
      if (activeTab === 'completed' && smp.status !== 'Completed') return false;
      if (activeTab === 'rejected' && smp.status !== 'Rejected') return false;

      // Dropdown filters
      if (selectedDepartment !== 'All' && smp.department !== selectedDepartment) return false;
      if (selectedSampleType !== 'All' && smp.sampleType !== selectedSampleType) return false;
      if (selectedStatus !== 'All' && smp.status !== selectedStatus) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          smp.patientName.toLowerCase().includes(q) ||
          smp.sampleId.toLowerCase().includes(q) ||
          smp.testName.toLowerCase().includes(q) ||
          smp.department.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [samples, activeTab, selectedDepartment, selectedSampleType, selectedStatus, searchQuery]);

  const handleSelectSample = (smp: SampleItem) => {
    setSelectedSample(smp);
    setSelectedRowIds([smp.id]);
  };

  const handleToggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRowIds.length === filteredSamples.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredSamples.map((s) => s.id));
    }
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
            Sample Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Register, track, and manage laboratory samples from collection to results.
          </p>
        </div>
      </div>

      {/* Date Selector & + Register New Sample button */}
      <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 tracking-tight leading-none">
              {calendarDate}
            </div>
            <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              Tuesday
            </div>
          </div>
          <div className="flex items-center gap-0.5 ml-2 border-l border-slate-200 pl-1.5">
            <button
              onClick={() => setCalendarDate('Oct 18, 2026')}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCalendarDate('Oct 20, 2026')}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={() => alert('Register New Sample modal')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Register New Sample</span>
        </button>
      </div>
    </div>
  );

  // 5 KPI Stat Cards - Compact & displayed at one row without icons
  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard
        title="Total Samples"
        value={SAMPLE_KPI_STATS.totalSamples.value}
        color="blue"
        change={SAMPLE_KPI_STATS.totalSamples}
      />
      <LabStatCard
        title="Collected"
        value={SAMPLE_KPI_STATS.collected.value}
        color="emerald"
        change={SAMPLE_KPI_STATS.collected}
      />
      <LabStatCard
        title="In Processing"
        value={SAMPLE_KPI_STATS.inProcessing.value}
        color="amber"
        change={SAMPLE_KPI_STATS.inProcessing}
      />
      <LabStatCard
        title="Completed"
        value={SAMPLE_KPI_STATS.completed.value}
        color="emerald"
        change={SAMPLE_KPI_STATS.completed}
      />
      <LabStatCard
        title="Rejected"
        value={SAMPLE_KPI_STATS.rejected.value}
        color="rose"
        change={SAMPLE_KPI_STATS.rejected}
      />
    </div>
  );

  // Right Panel Content matching screenshot
  const rightPanelContent = (
    <div className="space-y-4">
      {/* 1. Header & Patient Profile Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Sample / Patient Details
            </h2>
          </div>
          <button
            onClick={() => alert(`View full details for ${selectedSample.patientName}`)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            View Full Details
          </button>
        </div>

        <div className="flex items-start gap-3.5">
          <img
            src={selectedSample.patientAvatar}
            alt={selectedSample.patientName}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-800 truncate">
                {selectedSample.patientName}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                {selectedSample.patientRoom}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
              <span>{selectedSample.patientId}</span>
              <span>•</span>
              <span>{selectedSample.patientAge} years</span>
              <span>•</span>
              <span>{selectedSample.patientGender}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700">{selectedSample.patientPhone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{selectedSample.patientEmail}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700">{selectedSample.patientCity}</span>
          </div>
        </div>
      </div>

      {/* 2. Sample Information Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <TestTube2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Sample Information
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Sample ID</span>
            <span className="font-bold text-slate-800 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {selectedSample.sampleId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Test Name</span>
            <span className="font-bold text-slate-800">{selectedSample.testCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Sample Type</span>
            <span className="font-bold text-slate-800">{selectedSample.sampleType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Collection Time</span>
            <span className="font-medium text-slate-700">{selectedSample.collectionTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                selectedSample.status === 'Collected'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                  : selectedSample.status === 'In Processing'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                  : selectedSample.status === 'Completed'
                  ? 'bg-teal-50 text-teal-600 border border-teal-200/60'
                  : selectedSample.status === 'Pending'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                  : 'bg-rose-50 text-rose-600 border border-rose-200/60'
              }`}
            >
              {selectedSample.status}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Barcode & Label Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <QrCode className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Barcode & Label
          </h3>
        </div>

        <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
          <div className="flex flex-col items-center">
            {/* Crisp Simulated Barcode SVG matching screenshot */}
            <svg
              className="h-10 w-36"
              viewBox="0 0 144 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="5" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="9" y="0" width="4" height="40" fill="#1E293B" />
              <rect x="15" y="0" width="1" height="40" fill="#1E293B" />
              <rect x="18" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="23" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="27" y="0" width="5" height="40" fill="#1E293B" />
              <rect x="34" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="38" y="0" width="1" height="40" fill="#1E293B" />
              <rect x="41" y="0" width="4" height="40" fill="#1E293B" />
              <rect x="47" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="51" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="56" y="0" width="1" height="40" fill="#1E293B" />
              <rect x="59" y="0" width="4" height="40" fill="#1E293B" />
              <rect x="65" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="69" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="74" y="0" width="5" height="40" fill="#1E293B" />
              <rect x="81" y="0" width="1" height="40" fill="#1E293B" />
              <rect x="84" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="89" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="93" y="0" width="4" height="40" fill="#1E293B" />
              <rect x="99" y="0" width="1" height="40" fill="#1E293B" />
              <rect x="102" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="107" y="0" width="5" height="40" fill="#1E293B" />
              <rect x="114" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="118" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="123" y="0" width="1" height="40" fill="#1E293B" />
              <rect x="126" y="0" width="4" height="40" fill="#1E293B" />
              <rect x="132" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="136" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="141" y="0" width="3" height="40" fill="#1E293B" />
            </svg>
            <span className="font-mono text-[11px] font-bold text-slate-700 tracking-wider mt-1.5">
              {selectedSample.sampleId}
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Label</span>
          </button>
        </div>
      </div>

      {/* 4. Quick Actions Card (6 buttons) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Quick Actions
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => alert(`Register sample for ${selectedSample.patientName}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Register Sample</span>
          </button>
          <button
            onClick={() => alert('Scan Barcode')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Scan Barcode</span>
          </button>
          <button
            onClick={() => alert(`Update status for ${selectedSample.sampleId}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Update Status</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Print Label</span>
          </button>
          <button
            onClick={() => alert(`View test details for ${selectedSample.sampleId}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>View Test Details</span>
          </button>
          <button
            onClick={() => alert(`Add comment for ${selectedSample.sampleId}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Comment</span>
          </button>
        </div>
      </div>

      {/* 5. Laboratory Handover Tracking Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Laboratory Handover Tracking
            </h3>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition">
            View All
          </button>
        </div>

        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />

          {HANDOVER_TRACKING_STEPS.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';

            return (
              <div key={idx} className="relative flex items-center justify-between text-xs">
                <div
                  className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isInProgress
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_#2563eb]'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : isInProgress ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  )}
                </div>

                <div className="min-w-0 pr-2">
                  <div
                    className={`font-bold ${
                      isInProgress ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{step.time}</div>
                </div>

                <span
                  className={`text-[11px] font-semibold shrink-0 ${
                    isInProgress
                      ? 'text-blue-600 font-bold'
                      : isCompleted
                      ? 'text-slate-600 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <LabPageShell
      header={headerContent}
      kpis={kpisContent}
      rightPanel={rightPanelContent}
    >
      {/* ── Main Left Section ── */}

      {/* Filter Tabs Bar (All Samples, Collected, In Processing, Completed, Rejected) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Samples (152)</span>
        </button>

        <button
          onClick={() => setActiveTab('collected')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'collected'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <TestTube2 className={`w-3.5 h-3.5 ${activeTab === 'collected' ? 'text-white' : 'text-emerald-500'}`} />
          <span>Collected (118)</span>
        </button>

        <button
          onClick={() => setActiveTab('processing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'processing'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${activeTab === 'processing' ? 'text-white' : 'text-blue-500'}`} />
          <span>In Processing (21)</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'completed' ? 'text-white' : 'text-emerald-500'}`} />
          <span>Completed (98)</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'rejected'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <XCircle className={`w-3.5 h-3.5 ${activeTab === 'rejected' ? 'text-white' : 'text-rose-500'}`} />
          <span>Rejected (5)</span>
        </button>
      </div>

      {/* Search & Filter Dropdown Row */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sample ID, patient name, or test name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            value={selectedSampleType}
            onChange={(e) => setSelectedSampleType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Sample Types</option>
            <option value="Blood">Blood</option>
            <option value="Urine">Urine</option>
            <option value="Stool">Stool</option>
            <option value="Swab">Swab</option>
            <option value="Tissue">Tissue</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Collected">Collected</option>
            <option value="In Processing">In Processing</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={() => {
              setSelectedDepartment('All');
              setSelectedSampleType('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main Samples Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === filteredSamples.length && filteredSamples.length > 0}
                    onChange={handleSelectAllRows}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Sample ID</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Test Name</th>
                <th className="py-3 px-3">Sample Type</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Collection Time</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSamples.map((smp) => {
                const isSelected = selectedSample.id === smp.id;
                const isChecked = selectedRowIds.includes(smp.id);

                return (
                  <tr
                    key={smp.id}
                    onClick={() => handleSelectSample(smp)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-3.5 text-center" onClick={(e) => handleToggleSelectRow(e, smp.id)}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-blue-600 whitespace-nowrap font-mono">
                      {smp.sampleId}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div>
                        <div className="font-bold text-slate-800 leading-tight">
                          {smp.patientName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {smp.patientRoom}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {smp.testName}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {smp.sampleType}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {smp.department}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {smp.collectionTime}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          smp.status === 'Collected'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                            : smp.status === 'In Processing'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                            : smp.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                            : smp.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                            : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                        }`}
                      >
                        {smp.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectSample(smp)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert(`More actions for ${smp.sampleId}`)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                          title="More Options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <div>
            Showing <span className="font-bold text-slate-800">1-10</span> of{' '}
            <span className="font-bold text-slate-800">152</span> samples
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
              2
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
              3
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
              4
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
              5
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
              16
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: 2 Widgets matching Screenshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Recent Sample Activity */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Recent Sample Activity
              </h3>
            </div>
            <button
              onClick={() => alert('View all recent sample activities')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-2.5 font-bold">Time</th>
                  <th className="pb-2.5 font-bold">Sample ID</th>
                  <th className="pb-2.5 font-bold">Patient</th>
                  <th className="pb-2.5 font-bold text-center">Action</th>
                  <th className="pb-2.5 font-bold text-right">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_SAMPLE_ACTIVITIES.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 text-slate-500 whitespace-nowrap font-medium">{act.time}</td>
                    <td className="py-2.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {act.sampleId}
                    </td>
                    <td className="py-2.5 font-medium text-slate-800 whitespace-nowrap">{act.patient}</td>
                    <td className="py-2.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          act.action === 'Registered' || act.action === 'Collected'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                            : act.action === 'Accepted'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                            : act.action === 'Rejected'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        }`}
                      >
                        {act.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-500 whitespace-nowrap font-medium">
                      {act.by}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Sample Status Distribution (Donut Chart) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Sample Status Distribution
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SAMPLE_STATUS_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {SAMPLE_STATUS_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} samples`, name]}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-slate-800 leading-none">152</span>
                <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  Total Samples
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 text-xs">
              {SAMPLE_STATUS_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 truncate font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px] shrink-0">
                    {item.value} ({item.percentage})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LabPageShell>
  );
}

