'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Hourglass,
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
  SlidersHorizontal,
  Check,
  Activity,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import LabPageShell from '../../../components/lab/LabPageShell';
import LabStatCard from '../../../components/lab/LabStatCard';
import {
  EXACT_SCREENSHOT_ORDERS,
  LAB_KPI_STATS,
  TEST_TYPE_DISTRIBUTION,
  LABORATORY_ALERTS,
  LabTestOrderItem,
} from '../../../components/lab/labMockData';

type FilterTab = 'all' | 'processing' | 'completed' | 'abnormal' | 'pending';

export default function LabTestsPage() {
  const [orders] = useState<LabTestOrderItem[]>(EXACT_SCREENSHOT_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<LabTestOrderItem>(EXACT_SCREENSHOT_ORDERS[0]!);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTestType, setSelectedTestType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['ord-1024']);
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');

  // Filtered orders logic
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Tab filter
      if (activeTab === 'processing' && ord.status !== 'Processing') return false;
      if (activeTab === 'completed' && ord.status !== 'Completed') return false;
      if (activeTab === 'abnormal' && ord.status !== 'Abnormal') return false;
      if (activeTab === 'pending' && ord.status !== 'Pending') return false;

      // Dropdown filters
      if (selectedDepartment !== 'All' && ord.department !== selectedDepartment) return false;
      if (selectedTestType !== 'All' && ord.testName !== selectedTestType) return false;
      if (selectedStatus !== 'All' && ord.status !== selectedStatus) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          ord.patientName.toLowerCase().includes(q) ||
          ord.testName.toLowerCase().includes(q) ||
          ord.sampleId.toLowerCase().includes(q) ||
          ord.orderId.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [orders, activeTab, selectedDepartment, selectedTestType, selectedStatus, searchQuery]);

  const handleSelectOrder = (ord: LabTestOrderItem) => {
    setSelectedOrder(ord);
    setSelectedRowIds([ord.id]);
  };

  const handleToggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRowIds.length === filteredOrders.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredOrders.map((o) => o.id));
    }
  };

  // Header matching screenshot
  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Subtitle with Flask Icon */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
          <FlaskConical className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Lab Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View and manage lab test orders, track processing status, and access test details.
          </p>
        </div>
      </div>

      {/* Date Selector & + New Test Order button */}
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
          onClick={() => alert('New Test Order modal')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Test Order</span>
        </button>
      </div>
    </div>
  );

  // 5 KPI Stat Cards matching screenshot - displayed at one row without icons
  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard
        title="Total Orders"
        value={LAB_KPI_STATS.totalOrders.value}
        color="blue"
        change={LAB_KPI_STATS.totalOrders}
      />
      <LabStatCard
        title="Processing"
        value={LAB_KPI_STATS.processing.value}
        color="amber"
        change={LAB_KPI_STATS.processing}
      />
      <LabStatCard
        title="Completed"
        value={LAB_KPI_STATS.completed.value}
        color="emerald"
        change={LAB_KPI_STATS.completed}
      />
      <LabStatCard
        title="Abnormal Results"
        value={LAB_KPI_STATS.abnormal.value}
        color="rose"
        change={LAB_KPI_STATS.abnormal}
      />
      <LabStatCard
        title="Pending"
        value={LAB_KPI_STATS.pending.value}
        color="purple"
        change={LAB_KPI_STATS.pending}
      />
    </div>
  );

  // Right Side Panel Content ("Selected Test Details") matching screenshot
  const rightPanelContent = (
    <div className="space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
            Selected Test Details
          </h2>
        </div>
        <button
          onClick={() => alert(`Full details for ${selectedOrder.orderId}`)}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
        >
          View Full Details
        </button>
      </div>

      {/* Patient Profile Card (Aster Mulu) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <img
            src={selectedOrder.patientAvatar}
            alt={selectedOrder.patientName}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-base font-extrabold text-slate-800 truncate">
                {selectedOrder.patientName}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                {selectedOrder.priority === 'High' ? 'High Priority' : `${selectedOrder.priority} Priority`}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap mt-0.5">
              <span>{selectedOrder.patientId}</span>
              <span>•</span>
              <span>{selectedOrder.patientAge} years</span>
              <span>•</span>
              <span>{selectedOrder.patientGender}</span>
            </div>
            <div className="text-xs font-semibold text-blue-600 mt-0.5">
              {selectedOrder.patientRoom}A-01
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700">{selectedOrder.patientPhone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{selectedOrder.patientEmail}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700">{selectedOrder.patientCity}</span>
          </div>
        </div>
      </div>

      {/* Test Information Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <FlaskConical className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Test Information
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Order ID</span>
            <span className="font-bold text-slate-800">{selectedOrder.orderId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Test Name</span>
            <span className="font-bold text-slate-800">{selectedOrder.testCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Sample ID</span>
            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {selectedOrder.sampleId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Department</span>
            <span className="font-bold text-slate-800">{selectedOrder.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Priority</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedOrder.priority === 'High'
                  ? 'bg-rose-50 text-rose-600'
                  : selectedOrder.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {selectedOrder.priority}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                selectedOrder.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-600'
                  : selectedOrder.status === 'Processing'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {selectedOrder.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Ordered At</span>
            <span className="font-medium text-slate-700">{selectedOrder.orderedAt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Expected Result</span>
            <span className="font-medium text-slate-700">{selectedOrder.expectedResult}</span>
          </div>
        </div>
      </div>

      {/* Test Processing Stages (Vertical Stepper) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3.5">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Test Processing Stages
          </h3>
        </div>

        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />

          {selectedOrder.stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';

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
                    {stage.name}
                  </div>
                  {isInProgress && (
                    <div className="text-[10px] text-blue-500 font-medium">In progress...</div>
                  )}
                </div>

                <span
                  className={`text-[11px] font-medium shrink-0 ${
                    isInProgress
                      ? 'text-blue-600 font-bold'
                      : isCompleted
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => alert(`View Test Details for ${selectedOrder.orderId}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>View Test Details</span>
          </button>
          <button
            onClick={() => alert(`Update Status for ${selectedOrder.orderId}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
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
            onClick={() => alert(`Add comment for ${selectedOrder.orderId}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Comment</span>
          </button>
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

      {/* Filter Tabs Bar (All Orders, Processing, Completed, Abnormal, Pending) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>All Orders (148)</span>
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
          <span>Processing (32)</span>
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
          <span>Completed (102)</span>
        </button>

        <button
          onClick={() => setActiveTab('abnormal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'abnormal'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${activeTab === 'abnormal' ? 'text-white' : 'text-rose-500'}`} />
          <span>Abnormal (8)</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <Hourglass className={`w-3.5 h-3.5 ${activeTab === 'pending' ? 'text-white' : 'text-purple-500'}`} />
          <span>Pending (6)</span>
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
            placeholder="Search by patient name, test name, sample ID, or order ID..."
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
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            className="px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Abnormal">Abnormal</option>
          </select>

          <button
            onClick={() => {
              setSelectedDepartment('All');
              setSelectedTestType('All');
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

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAllRows}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Test Name</th>
                <th className="py-3 px-3">Sample ID</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Ordered At</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder.id === ord.id;
                const isChecked = selectedRowIds.includes(ord.id);

                return (
                  <tr
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-3.5 text-center" onClick={(e) => handleToggleSelectRow(e, ord.id)}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-blue-600 whitespace-nowrap">
                      {ord.orderId}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ord.patientAvatar}
                          alt={ord.patientName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">
                            {ord.patientName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {ord.patientRoom}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {ord.testName}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {ord.sampleId}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {ord.department}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          ord.priority === 'High'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                            : ord.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                            : ord.priority === 'Low'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                            : 'bg-teal-50 text-teal-600 border border-teal-200/60'
                        }`}
                      >
                        {ord.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          ord.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : ord.status === 'Processing'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {ord.orderedAt}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectOrder(ord)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert(`More actions for ${ord.orderId}`)}
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
            <span className="font-bold text-slate-800">148</span> test orders
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

      {/* ── Bottom Row: 3 Widgets matching Screenshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Recent Test Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Recent Test Orders
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 5).map((ord) => (
              <div
                key={ord.id}
                onClick={() => handleSelectOrder(ord)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">{ord.orderId}</span>
                    <span className="font-bold text-slate-800 truncate">{ord.testName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{ord.patientName}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : ord.status === 'Processing'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {ord.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {ord.orderedAt.split(' ')[3]} {ord.orderedAt.split(' ')[4]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Test Type Distribution (Donut Chart) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Test Type Distribution
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={TEST_TYPE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {TEST_TYPE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} tests`, name]}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-slate-800 leading-none">148</span>
                <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  Total Tests
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 text-xs">
              {TEST_TYPE_DISTRIBUTION.map((item) => (
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

        {/* 3. Laboratory Alerts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Laboratory Alerts
              </h3>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition">
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {LABORATORY_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50 text-rose-600'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50 text-amber-600'
                      : alert.severity === 'info'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {alert.count}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">{alert.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{alert.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LabPageShell>
  );
}
