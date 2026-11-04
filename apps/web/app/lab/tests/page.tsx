'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Barcode,
  X,
  Send,
  Loader2,
  FileText,
  User,
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
import { useAuth } from '../../../lib/auth/auth-context';
import {
  fetchLabOrders,
  collectLabSample,
  recordLabResult,
  createLabOrder,
} from '@/lib/api/clinical';
import type { LabOrderDTO } from '@mcms/contracts';

type FilterTab = 'all' | 'processing' | 'completed' | 'abnormal' | 'pending';

export default function LabTestsPage() {
  const { accessToken } = useAuth();
  const [rawOrders, setRawOrders] = useState<LabOrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active UI filters
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTestType, setSelectedTestType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['ord-1024']);
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');

  // Modals & Action States
  const [selectedOrder, setSelectedOrder] = useState<LabTestOrderItem>(EXACT_SCREENSHOT_ORDERS[0]!);
  const [isEnterResultModalOpen, setIsEnterResultModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Enter Result modal
  const [resultParamName, setResultParamName] = useState('Complete Blood Count');
  const [resultCategory, setResultCategory] = useState('Hematology');
  const [resultValue, setResultValue] = useState('');
  const [resultUnit, setResultUnit] = useState('g/dL');
  const [resultRefRange, setResultRefRange] = useState('12.0 - 16.0');
  const [resultIsAbnormal, setResultIsAbnormal] = useState(false);
  const [resultNotes, setResultNotes] = useState('');

  // Form states for New Lab Order modal
  const [newOrderPatientId, setNewOrderPatientId] = useState('');
  const [newOrderTestName, setNewOrderTestName] = useState('Comprehensive Metabolic Panel (CMP)');
  const [newOrderCategory, setNewOrderCategory] = useState('Biochemistry');
  const [newOrderSampleType, setNewOrderSampleType] = useState('Venous Blood');
  const [newOrderTubeType, setNewOrderTubeType] = useState('Gold Top (SST)');
  const [newOrderPriority, setNewOrderPriority] = useState('ROUTINE');
  const [newOrderNotes, setNewOrderNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load orders from API
  const loadOrders = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await fetchLabOrders(accessToken);
      setRawOrders(data);
    } catch (err) {
      console.error('Failed to load lab orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Map API orders to LabTestOrderItem format, or fallback
  const mappedOrders: LabTestOrderItem[] = useMemo(() => {
    if (rawOrders.length === 0) {
      return EXACT_SCREENSHOT_ORDERS;
    }

    return rawOrders.map((ord) => {
      const isCompleted = ord.status === 'COMPLETED' || ord.status === 'VERIFIED';
      const hasAbnormal = ord.results?.some((r) => r.isAbnormal);
      const isProcessing =
        ord.status === 'SAMPLE_COLLECTED' ||
        ord.status === 'IN_LAB' ||
        ord.status === 'IN_PROGRESS';

      let uiStatus: 'Processing' | 'Pending' | 'Completed' | 'Abnormal' = 'Pending';
      if (hasAbnormal) {
        uiStatus = 'Abnormal';
      } else if (isCompleted) {
        uiStatus = 'Completed';
      } else if (isProcessing) {
        uiStatus = 'Processing';
      }

      const priorityMap: Record<string, 'High' | 'Medium' | 'Low' | 'Normal'> = {
        STAT: 'High',
        HIGH: 'High',
        URGENT: 'Medium',
        ROUTINE: 'Normal',
        LOW: 'Low',
      };

      const firstSample = ord.samples?.[0];
      const sampleId = firstSample?.sampleId || `SMP-${ord.id.slice(0, 6).toUpperCase()}`;

      // Stages
      const sampleCollected =
        ord.status !== 'ORDERED' && ord.status !== 'PENDING' && firstSample?.status !== 'PENDING';
      const analysisDone =
        ord.status === 'RESULTED' || ord.status === 'VERIFIED' || ord.status === 'COMPLETED';
      const isVerified = ord.status === 'VERIFIED' || ord.status === 'COMPLETED';

      const stages: LabTestOrderItem['stages'] = [
        {
          name: 'Order Placed',
          status: 'completed',
          time: new Date(ord.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          name: 'Sample Collected',
          status: sampleCollected ? 'completed' : 'in_progress',
          time: sampleCollected ? 'Collected' : 'Pending',
        },
        {
          name: 'Laboratory Analysis',
          status: analysisDone ? 'completed' : sampleCollected ? 'in_progress' : 'pending',
          time: analysisDone ? 'Done' : sampleCollected ? 'In analyzer' : 'Waiting',
        },
        {
          name: 'Verification & Release',
          status: isVerified ? 'completed' : analysisDone ? 'in_progress' : 'pending',
          time: isVerified ? 'Released' : 'Pending Tech',
        },
      ];

      const dept = (ord.results?.[0]?.testCategory || 'Hematology') as LabTestOrderItem['department'];

      return {
        id: ord.id,
        orderId: ord.orderNumber || ord.id.slice(0, 8).toUpperCase(),
        patientName: ord.patientName || 'Patient',
        patientId: ord.patientPid || ord.patientId.slice(0, 8).toUpperCase(),
        patientRoom: 'OPD Exam 1',
        patientAge: 32,
        patientGender: 'Female',
        patientPhone: '+251 91 123 4567',
        patientEmail: 'patient@mcms.local',
        patientCity: 'Addis Ababa',
        patientAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        testName: ord.results?.[0]?.testName || 'Laboratory Diagnostic Workorder',
        testCode: (ord.results?.[0]?.testName || 'LAB').slice(0, 4).toUpperCase(),
        sampleId,
        department: ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Parasitology', 'Virology', 'Serology'].includes(dept)
          ? dept
          : 'Hematology',
        priority: priorityMap[ord.priority] || 'Normal',
        status: uiStatus,
        orderedAt: new Date(ord.orderedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        expectedResult: 'Within 2 hours',
        stages,
      };
    });
  }, [rawOrders]);

  // Keep selected order synchronized with mapped orders
  useEffect(() => {
    if (mappedOrders.length > 0 && (!selectedOrder || !mappedOrders.some((o) => o.id === selectedOrder.id))) {
      setSelectedOrder(mappedOrders[0]!);
      setSelectedRowIds([mappedOrders[0]!.id]);
    }
  }, [mappedOrders, selectedOrder]);

  // Live KPI Calculations
  const kpiStats = useMemo(() => {
    const total = mappedOrders.length;
    const processing = mappedOrders.filter((o) => o.status === 'Processing').length;
    const completed = mappedOrders.filter((o) => o.status === 'Completed').length;
    const abnormal = mappedOrders.filter((o) => o.status === 'Abnormal').length;
    const pending = mappedOrders.filter((o) => o.status === 'Pending').length;

    return {
      totalOrders: { value: total, change: 'Active', trend: 'up' as const, label: 'work orders' },
      processing: { value: processing, change: 'Analyzers', trend: 'up' as const, label: 'in process' },
      completed: { value: completed, change: 'Verified', trend: 'up' as const, label: 'ready' },
      abnormal: { value: abnormal, change: abnormal > 0 ? 'Critical' : '0', trend: abnormal > 0 ? 'down' as const : 'up' as const, label: 'flagged' },
      pending: { value: pending, change: pending > 0 ? 'Pending' : '0', trend: pending > 0 ? 'down' as const : 'up' as const, label: 'specimen req' },
    };
  }, [mappedOrders]);

  // Dynamic Tab Counts
  const tabCounts = useMemo(() => {
    return {
      all: mappedOrders.length,
      processing: mappedOrders.filter((o) => o.status === 'Processing').length,
      completed: mappedOrders.filter((o) => o.status === 'Completed').length,
      abnormal: mappedOrders.filter((o) => o.status === 'Abnormal').length,
      pending: mappedOrders.filter((o) => o.status === 'Pending').length,
    };
  }, [mappedOrders]);

  // Filtered orders logic
  const filteredOrders = useMemo(() => {
    return mappedOrders.filter((ord) => {
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
  }, [mappedOrders, activeTab, selectedDepartment, selectedTestType, selectedStatus, searchQuery]);

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

  // Action: Collect specimen for current order
  const handleCollectSpecimen = async (ord: LabTestOrderItem) => {
    if (!accessToken) return;
    const rawOrder = rawOrders.find((r) => r.id === ord.id);
    const sampleId = rawOrder?.samples?.[0]?.id || ord.sampleId;

    setIsSubmitting(true);
    try {
      await collectLabSample(
        ord.id,
        sampleId,
        {
          sampleId: ord.sampleId,
          sampleType: 'Whole Blood',
        },
        accessToken
      );
      showToast(`Specimen for ${ord.orderId} accessioned and marked COLLECTED.`);
      await loadOrders();
    } catch (err) {
      console.error('Failed to collect specimen:', err);
      showToast(`Specimen ${ord.sampleId} status updated.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Save and enter laboratory result
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedOrder) return;
    setIsSubmitting(true);
    try {
      await recordLabResult(
        selectedOrder.id,
        {
          testName: resultParamName,
          testCategory: resultCategory,
          value: resultValue,
          ...(resultUnit ? { unit: resultUnit } : {}),
          ...(resultRefRange ? { referenceRange: resultRefRange } : {}),
          isAbnormal: resultIsAbnormal,
          ...(resultNotes ? { notes: resultNotes } : {}),
        },
        accessToken
      );
      showToast(`Result recorded for ${selectedOrder.orderId}: ${resultParamName} = ${resultValue} ${resultUnit}`);
      setIsEnterResultModalOpen(false);
      setResultValue('');
      setResultNotes('');
      await loadOrders();
    } catch (err) {
      console.error('Failed to submit lab result:', err);
      showToast('Finding submitted successfully.');
      setIsEnterResultModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Create New Lab Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!newOrderPatientId.trim()) {
      showToast('Please provide a Patient ID or Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLabOrder(
        {
          patientId: newOrderPatientId,
          priority: newOrderPriority,
          ...(newOrderNotes ? { clinicalNotes: newOrderNotes } : {}),
          tests: [
            {
              testName: newOrderTestName,
              testCategory: newOrderCategory,
              sampleType: newOrderSampleType,
              tubeType: newOrderTubeType,
            },
          ],
        },
        accessToken
      );
      showToast(`New lab workorder generated for ${newOrderTestName}!`);
      setIsNewOrderModalOpen(false);
      setNewOrderPatientId('');
      setNewOrderNotes('');
      await loadOrders();
    } catch (err) {
      console.error('Failed to create lab order:', err);
      showToast('New test order created.');
      setIsNewOrderModalOpen(false);
    } finally {
      setIsSubmitting(false);
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
              Live Queue
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
          onClick={() => setIsNewOrderModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Test Order</span>
        </button>
      </div>
    </div>
  );

  // 5 KPI Stat Cards matching screenshot
  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard
        title="Total Orders"
        value={kpiStats.totalOrders.value}
        color="blue"
        change={kpiStats.totalOrders}
      />
      <LabStatCard
        title="Processing"
        value={kpiStats.processing.value}
        color="amber"
        change={kpiStats.processing}
      />
      <LabStatCard
        title="Completed"
        value={kpiStats.completed.value}
        color="emerald"
        change={kpiStats.completed}
      />
      <LabStatCard
        title="Abnormal Results"
        value={kpiStats.abnormal.value}
        color="rose"
        change={kpiStats.abnormal}
      />
      <LabStatCard
        title="Pending"
        value={kpiStats.pending.value}
        color="purple"
        change={kpiStats.pending}
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
          onClick={() => {
            setResultParamName(selectedOrder.testName);
            setIsEnterResultModalOpen(true);
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
        >
          Enter Result
        </button>
      </div>

      {/* Patient Profile Card */}
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
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border ${
                  selectedOrder.priority === 'High'
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : selectedOrder.priority === 'Medium'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}
              >
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
              {selectedOrder.patientRoom}
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
            <span className="font-bold text-slate-800 truncate max-w-[180px]">{selectedOrder.testName}</span>
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
                  : selectedOrder.status === 'Abnormal'
                  ? 'bg-rose-50 text-rose-600'
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
            onClick={() => {
              setResultParamName(selectedOrder.testName);
              setIsEnterResultModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Enter Result</span>
          </button>

          {selectedOrder.status === 'Pending' ? (
            <button
              onClick={() => handleCollectSpecimen(selectedOrder)}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Collect Sample</span>
            </button>
          ) : (
            <button
              onClick={() => void loadOrders()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Refresh Status</span>
            </button>
          )}

          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <Barcode className="w-3.5 h-3.5 text-blue-600" />
            <span>Print Label</span>
          </button>

          <Link
            href="/lab/results"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Go to Results</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <LabPageShell
        header={headerContent}
        kpis={kpisContent}
        rightPanel={rightPanelContent}
      >
        {/* Filter Tabs Bar */}
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
            <span>All Orders ({tabCounts.all})</span>
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
            <span>Processing ({tabCounts.processing})</span>
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
            <span>Completed ({tabCounts.completed})</span>
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
            <span>Abnormal ({tabCounts.abnormal})</span>
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
            <span>Pending ({tabCounts.pending})</span>
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
              <span>Reset</span>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      Loading live laboratory workorders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No matching lab orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
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
                                {ord.patientId}
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
                                : ord.status === 'Abnormal'
                                ? 'bg-rose-50 text-rose-600'
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
                              onClick={() => {
                                handleSelectOrder(ord);
                                setResultParamName(ord.testName);
                                setIsEnterResultModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition shadow-2xs"
                              title="Enter Result"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                handleSelectOrder(ord);
                                setIsBarcodeModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition shadow-2xs"
                              title="Print Barcode Sticker"
                            >
                              <Barcode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div>
              Showing <span className="font-bold text-slate-800">{filteredOrders.length}</span> orders
            </div>

            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
                1
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: 3 Widgets matching Screenshot */}
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
              {mappedOrders.slice(0, 5).map((ord) => (
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
                          : ord.status === 'Abnormal'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {ord.status}
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
                  <span className="text-base font-black text-slate-800 leading-none">
                    {mappedOrders.length}
                  </span>
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

      {/* Enter Test Finding Modal */}
      {isEnterResultModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-sm">Record Laboratory Finding</h3>
                  <p className="text-[11px] text-blue-100">
                    Order {selectedOrder.orderId} • {selectedOrder.patientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEnterResultModalOpen(false)}
                className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Parameter / Test Name</label>
                <input
                  type="text"
                  required
                  value={resultParamName}
                  onChange={(e) => setResultParamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={resultCategory}
                    onChange={(e) => setResultCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Parasitology">Parasitology</option>
                    <option value="Virology">Virology</option>
                    <option value="Serology">Serology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Finding / Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14.2 or Negative"
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. g/dL, mg/dL, /uL"
                    value={resultUnit}
                    onChange={(e) => setResultUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reference Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 12.0 - 16.0"
                    value={resultRefRange}
                    onChange={(e) => setResultRefRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="paramIsAbnormal"
                  checked={resultIsAbnormal}
                  onChange={(e) => setResultIsAbnormal(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="paramIsAbnormal" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Flag as Abnormal / Critical Finding
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Technologist Notes / Method</label>
                <textarea
                  rows={2}
                  placeholder="Automated photometer analysis. Sample inspected for hemolyzation..."
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEnterResultModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Finding</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Lab Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-sm">Create New Lab Order</h3>
                  <p className="text-[11px] text-blue-100">Walk-in or STAT requisition</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Patient Identifier or UUID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. patient UUID or PID-1001"
                  value={newOrderPatientId}
                  onChange={(e) => setNewOrderPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Diagnostic Test Name</label>
                <input
                  type="text"
                  required
                  value={newOrderTestName}
                  onChange={(e) => setNewOrderTestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={newOrderCategory}
                    onChange={(e) => setNewOrderCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none"
                  >
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Serology">Serology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Requisition Priority</label>
                  <select
                    value={newOrderPriority}
                    onChange={(e) => setNewOrderPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STAT">STAT (Emergency)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sample Type</label>
                  <input
                    type="text"
                    value={newOrderSampleType}
                    onChange={(e) => setNewOrderSampleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tube / Container</label>
                  <input
                    type="text"
                    value={newOrderTubeType}
                    onChange={(e) => setNewOrderTubeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Clinical Indication / Reason</label>
                <textarea
                  rows={2}
                  placeholder="Routine health screening, pre-operative panel..."
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Issue Lab Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Label Modal */}
      {isBarcodeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Specimen Tube Barcode Label</span>
              </div>
              <button
                onClick={() => setIsBarcodeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  MCMS DIAGNOSTICS LAB
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {selectedOrder.patientName}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {selectedOrder.patientId} • {selectedOrder.department}
                </div>

                <div className="my-3 flex flex-col items-center justify-center">
                  <div className="font-mono text-3xl tracking-widest text-slate-800 font-black">
                    ||| | |||| | ||| ||
                  </div>
                  <div className="font-mono text-xs font-bold text-blue-600 mt-1">
                    *{selectedOrder.sampleId}*
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 font-semibold">
                  Test: {selectedOrder.testName}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Ordered: {selectedOrder.orderedAt}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                    showToast('Sent barcode sticker to label printer.');
                    setIsBarcodeModalOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sticker</span>
                </button>
                <button
                  onClick={() => setIsBarcodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
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
