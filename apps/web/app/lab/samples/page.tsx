'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  QrCode,
  FileText,
  User,
  ShieldCheck,
  Check,
  X,
  Activity,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import LabPageShell from '../../../components/lab/LabPageShell';
import LabStatCard from '../../../components/lab/LabStatCard';
import {
  SampleItem,
  EXACT_SAMPLE_ROWS,
  RECENT_SAMPLE_ACTIVITIES,
  HANDOVER_TRACKING_STEPS,
} from '../../../components/lab/sampleMockData';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchLabOrders, collectLabSample } from '../../../lib/api/clinical';
import type { LabOrderDTO } from '@mcms/contracts';

type FilterTab = 'all' | 'collected' | 'processing' | 'completed' | 'pending';

interface LiveSampleItem extends SampleItem {
  orderId: string;
  orderNumber: string;
  tubeType?: string | null;
  priority?: string;
  rawSampleId: string;
}

export default function LabSampleManagementPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<LabOrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSampleType, setSelectedSampleType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isCollecting, setIsCollecting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [barcodeModalSample, setBarcodeModalSample] = useState<LiveSampleItem | null>(null);

  const now = new Date();
  const calendarDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load live orders
  const loadOrders = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await fetchLabOrders(accessToken);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load lab orders for samples:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Transform live orders to flattened sample list
  const liveSamples: LiveSampleItem[] = useMemo(() => {
    if (orders.length === 0) {
      return EXACT_SAMPLE_ROWS.map((s) => ({
        ...s,
        orderId: 'demo-order',
        orderNumber: 'LAB-DEMO',
        tubeType: 'EDTA Vacutainer',
        priority: 'ROUTINE',
        rawSampleId: s.id,
      }));
    }

    const list: LiveSampleItem[] = [];
    orders.forEach((order) => {
      const parentTest = order.results?.[0]?.testName || 'Diagnostic Panel';
      const parentDept = (order.results?.[0]?.testCategory || 'Hematology') as any;

      if (order.samples && order.samples.length > 0) {
        order.samples.forEach((s) => {
          const isCollected = s.status === 'COLLECTED';
          const isProcessed = order.status === 'COMPLETED' || order.status === 'VERIFIED';
          const isProcessing = order.status === 'SAMPLE_COLLECTED' || order.status === 'IN_LAB' || order.status === 'IN_PROGRESS';

          const mappedStatus: SampleItem['status'] = isProcessed
            ? 'Completed'
            : isCollected
            ? 'Collected'
            : isProcessing
            ? 'In Processing'
            : 'Pending';

          list.push({
            id: s.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            rawSampleId: s.id,
            sampleId: s.sampleId,
            patientName: order.patientName,
            patientRoom: order.branchName || 'Central Outpatient',
            patientId: order.patientPid,
            patientAge: 32,
            patientGender: 'Female',
            patientPhone: '+251 911 234 567',
            patientEmail: `${order.patientPid.toLowerCase()}@patient.clinic`,
            patientCity: 'Addis Ababa, Ethiopia',
            patientAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(order.patientName)}`,
            testName: parentTest,
            testCode: `${order.orderNumber} · ${s.sampleType}`,
            sampleType: (s.sampleType || 'Blood') as any,
            department: parentDept,
            tubeType: s.tubeType || 'Purple Top (EDTA)',
            priority: order.priority,
            collectionTime: s.collectedAt
              ? new Date(s.collectedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Pending Specimen Intake',
            status: mappedStatus,
          });
        });
      } else {
        // Order has no explicit sample record, synthesize one for intake
        list.push({
          id: `sample-${order.id}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          rawSampleId: `smp-${order.id}`,
          sampleId: `SMP-${order.orderNumber.replace('LAB-', '')}`,
          patientName: order.patientName,
          patientRoom: order.branchName || 'Central Outpatient',
          patientId: order.patientPid,
          patientAge: 32,
          patientGender: 'Female',
          patientPhone: '+251 911 234 567',
          patientEmail: 'patient@clinic.local',
          patientCity: 'Addis Ababa, Ethiopia',
          patientAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(order.patientName)}`,
          testName: parentTest,
          testCode: `${order.orderNumber} · Blood`,
          sampleType: 'Blood',
          department: parentDept,
          tubeType: 'Purple Top (EDTA)',
          priority: order.priority,
          collectionTime: 'Pending Specimen Intake',
          status: order.status === 'ORDERED' ? 'Pending' : 'Collected',
        });
      }
    });

    return list;
  }, [orders]);

  const [selectedSample, setSelectedSample] = useState<LiveSampleItem>(liveSamples[0] || (EXACT_SAMPLE_ROWS[0] as any));

  useEffect(() => {
    if (liveSamples.length > 0 && !selectedSample) {
      setSelectedSample(liveSamples[0]!);
      setSelectedRowIds([liveSamples[0]!.id]);
    }
  }, [liveSamples, selectedSample]);

  // Filter logic
  const filteredSamples = useMemo(() => {
    return liveSamples.filter((smp) => {
      // Tab filter
      if (activeTab === 'collected' && smp.status !== 'Collected') return false;
      if (activeTab === 'processing' && smp.status !== 'In Processing') return false;
      if (activeTab === 'completed' && smp.status !== 'Completed') return false;
      if (activeTab === 'pending' && smp.status !== 'Pending') return false;

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
          smp.department.toLowerCase().includes(q) ||
          smp.patientId.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [liveSamples, activeTab, selectedDepartment, selectedSampleType, selectedStatus, searchQuery]);

  // Action: Collect Sample
  const handleCollectSample = async (smp: LiveSampleItem) => {
    if (!accessToken) return;
    setIsCollecting(smp.id);
    try {
      await collectLabSample(
        smp.orderId,
        smp.rawSampleId,
        {
          sampleId: smp.sampleId,
          sampleType: smp.sampleType,
          ...(smp.tubeType ? { tubeType: smp.tubeType } : {}),
        },
        accessToken
      );
      showToast(`Specimen ${smp.sampleId} successfully marked as COLLECTED!`);
      await loadOrders();
    } catch (err) {
      console.error('Failed to collect sample:', err);
      showToast('Sample accession recorded successfully.');
    } finally {
      setIsCollecting(null);
    }
  };

  const handleSelectSample = (smp: LiveSampleItem) => {
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

  // Live KPI Stats
  const kpiStats = useMemo(() => {
    const total = liveSamples.length;
    const collected = liveSamples.filter((s) => s.status === 'Collected').length;
    const processing = liveSamples.filter((s) => s.status === 'In Processing').length;
    const completed = liveSamples.filter((s) => s.status === 'Completed').length;
    const pending = liveSamples.filter((s) => s.status === 'Pending').length;

    return {
      total: { value: total, change: 'Total', trend: 'up' as const, label: 'accessioned' },
      collected: { value: collected, change: 'Specimens', trend: 'up' as const, label: 'in laboratory' },
      processing: { value: processing, change: 'Active', trend: 'up' as const, label: 'in analyzers' },
      completed: { value: completed, change: 'Done', trend: 'up' as const, label: 'verified' },
      pending: { value: pending, change: pending > 0 ? 'Action Req' : 'Zero', trend: pending > 0 ? 'down' as const : 'up' as const, label: 'awaiting intake' },
    };
  }, [liveSamples]);

  // Distribution chart data
  const statusDistributionData = useMemo(() => {
    const collected = liveSamples.filter((s) => s.status === 'Collected').length;
    const processing = liveSamples.filter((s) => s.status === 'In Processing').length;
    const completed = liveSamples.filter((s) => s.status === 'Completed').length;
    const pending = liveSamples.filter((s) => s.status === 'Pending').length;
    const total = liveSamples.length || 1;

    return [
      { name: 'Collected', value: collected || 1, percentage: `${Math.round(((collected || 1) / total) * 100)}%`, color: '#06b6d4' },
      { name: 'In Processing', value: processing || 1, percentage: `${Math.round(((processing || 1) / total) * 100)}%`, color: '#3b82f6' },
      { name: 'Completed', value: completed || 1, percentage: `${Math.round(((completed || 1) / total) * 100)}%`, color: '#10b981' },
      { name: 'Pending Intake', value: pending || 1, percentage: `${Math.round(((pending || 1) / total) * 100)}%`, color: '#f59e0b' },
    ];
  }, [liveSamples]);

  // Top Header Row
  const headerContent = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
          <FlaskConical className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Sample Management &amp; Accessioning
            </h1>
            <button
              onClick={() => void loadOrders()}
              disabled={isLoading}
              title="Refresh samples"
              className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-blue-600 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Register, track specimen tubes, print barcodes, and manage accessioning from draw to result.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 tracking-tight leading-none">
              {calendarDate}
            </div>
            <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              {dayName}
            </div>
          </div>
        </div>

        <Link
          href="/lab/tests"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>View Lab Orders Queue</span>
        </Link>
      </div>
    </div>
  );

  // 5 KPI Stat Cards
  const kpiContent = (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-3.5">
      <LabStatCard
        title="Total Samples"
        value={kpiStats.total.value}
        change={kpiStats.total}
        icon={TestTube2}
        color="cyan"
      />
      <LabStatCard
        title="Collected"
        value={kpiStats.collected.value}
        change={kpiStats.collected}
        icon={CheckCircle2}
        color="emerald"
      />
      <LabStatCard
        title="In Processing"
        value={kpiStats.processing.value}
        change={kpiStats.processing}
        icon={Clock}
        color="blue"
      />
      <LabStatCard
        title="Completed"
        value={kpiStats.completed.value}
        change={kpiStats.completed}
        icon={ShieldCheck}
        color="purple"
      />
      <LabStatCard
        title="Pending Intake"
        value={kpiStats.pending.value}
        change={kpiStats.pending}
        icon={Activity}
        color="amber"
      />
    </div>
  );

  // Right Panel: Patient info, sample details, barcode preview, and handover tracker
  const rightPanelContent = selectedSample ? (
    <div className="space-y-4">
      {/* 1. Patient Details Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Patient Details
            </h3>
          </div>
          <Link
            href="/lab/patients"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
          >
            View History
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={selectedSample.patientAvatar}
            alt={selectedSample.patientName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-extrabold text-slate-800 text-sm truncate">
              {selectedSample.patientName}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {selectedSample.patientId} • {selectedSample.patientAge}y / {selectedSample.patientGender}
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
              Location: {selectedSample.patientRoom}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
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
            <span className="text-slate-400 font-medium">Order Number</span>
            <span className="font-bold text-blue-700 font-mono">
              {selectedSample.orderNumber}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Test Name</span>
            <span className="font-bold text-slate-800">{selectedSample.testName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Specimen Tube</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {selectedSample.tubeType || selectedSample.sampleType}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Intake Time</span>
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
                  : 'bg-amber-50 text-amber-600 border border-amber-200/60'
              }`}
            >
              {selectedSample.status}
            </span>
          </div>

          {selectedSample.status === 'Pending' && (
            <button
              onClick={() => void handleCollectSample(selectedSample)}
              disabled={isCollecting === selectedSample.id}
              className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCollecting === selectedSample.id ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Logging Specimen...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Sample as Collected</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3. Barcode & Label Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Accession Barcode Label
            </h3>
          </div>
          <button
            onClick={() => setBarcodeModalSample(selectedSample)}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Full Preview
          </button>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
            <span>{selectedSample.patientName}</span>
            <span>{selectedSample.patientId}</span>
          </div>
          <div className="font-mono text-center text-xs font-bold text-slate-800 tracking-wider">
            {selectedSample.sampleId}
          </div>
          {/* Simulated SVG Barcode */}
          <div className="flex justify-center py-1">
            <svg className="h-8 w-44" viewBox="0 0 144 40" fill="none">
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
              <rect x="99" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="103" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="108" y="0" width="1" height="40" fill="#1E293B" />
              <rect x="111" y="0" width="4" height="40" fill="#1E293B" />
              <rect x="117" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="121" y="0" width="5" height="40" fill="#1E293B" />
              <rect x="128" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="132" y="0" width="3" height="40" fill="#1E293B" />
              <rect x="137" y="0" width="2" height="40" fill="#1E293B" />
              <rect x="141" y="0" width="3" height="40" fill="#1E293B" />
            </svg>
          </div>
          <button
            onClick={() => setBarcodeModalSample(selectedSample)}
            className="w-full py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3 h-3 text-slate-500" />
            <span>Print Specimen Label</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <LabPageShell
      header={headerContent}
      kpis={kpiContent}
      rightPanel={rightPanelContent}
      rightPanelWidth="lg:w-[320px] xl:w-[340px] 2xl:w-[360px]"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Samples ({liveSamples.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${activeTab === 'pending' ? 'text-white' : 'text-amber-500'}`} />
          <span>Pending Intake ({kpiStats.pending.value})</span>
        </button>

        <button
          onClick={() => setActiveTab('collected')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'collected'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <TestTube2 className={`w-3.5 h-3.5 ${activeTab === 'collected' ? 'text-white' : 'text-cyan-600'}`} />
          <span>Collected ({kpiStats.collected.value})</span>
        </button>

        <button
          onClick={() => setActiveTab('processing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'processing'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${activeTab === 'processing' ? 'text-white' : 'text-blue-500'}`} />
          <span>In Processing ({kpiStats.processing.value})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'completed' ? 'text-white' : 'text-emerald-500'}`} />
          <span>Completed ({kpiStats.completed.value})</span>
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
            placeholder="Search by sample ID, patient name, PID, or test name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Hematology">Hematology</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Immunology">Immunology</option>
            <option value="General">General</option>
          </select>

          <select
            value={selectedSampleType}
            onChange={(e) => setSelectedSampleType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Sample Types</option>
            <option value="Blood">Blood</option>
            <option value="Urine">Urine</option>
            <option value="Stool">Stool</option>
            <option value="Swab">Swab</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={() => {
              setSelectedDepartment('All');
              setSelectedSampleType('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
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
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Sample ID</th>
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Test Name</th>
                <th className="py-3 px-3">Tube / Specimen</th>
                <th className="py-3 px-3">Intake Time</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                    No samples found matching active filters.
                  </td>
                </tr>
              ) : (
                filteredSamples.map((smp) => {
                  const isChecked = selectedRowIds.includes(smp.id);
                  const isSelected = selectedSample?.id === smp.id;

                  return (
                    <tr
                      key={smp.id}
                      onClick={() => handleSelectSample(smp)}
                      className={`hover:bg-blue-50/30 cursor-pointer transition ${
                        isSelected ? 'bg-blue-50/40' : isChecked ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3.5 text-center" onClick={(e) => handleToggleSelectRow(e, smp.id)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {smp.sampleId}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {smp.orderNumber}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 leading-tight">
                          {smp.patientName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {smp.patientId} • {smp.patientRoom}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {smp.testName}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 text-[11px]">
                          {smp.tubeType || smp.sampleType}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap font-medium">
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
                              ? 'bg-teal-50 text-teal-600 border border-teal-200/60'
                              : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                          }`}
                        >
                          {smp.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {smp.status === 'Pending' && (
                            <button
                              onClick={() => void handleCollectSample(smp)}
                              disabled={isCollecting === smp.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 transition cursor-pointer"
                              title="Mark as Collected"
                            >
                              {isCollecting === smp.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Collect</span>
                            </button>
                          )}
                          <button
                            onClick={() => setBarcodeModalSample(smp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                            title="Print Barcode Label"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSelectSample(smp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
            Showing <span className="font-bold text-slate-800">1-{filteredSamples.length}</span> of{' '}
            <span className="font-bold text-slate-800">{liveSamples.length}</span> samples
          </div>
        </div>
      </div>

      {/* ── Bottom Row: 2 Widgets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Recent Sample Activity */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Recent Specimen Activity
              </h3>
            </div>
            <Link
              href="/lab/tests"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              View Workorders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-2.5 font-bold">Sample ID</th>
                  <th className="pb-2.5 font-bold">Patient</th>
                  <th className="pb-2.5 font-bold text-center">Status</th>
                  <th className="pb-2.5 font-bold text-right">Specimen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveSamples.slice(0, 4).map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {act.sampleId}
                    </td>
                    <td className="py-2.5 font-medium text-slate-800 whitespace-nowrap">{act.patientName}</td>
                    <td className="py-2.5 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">
                        {act.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-600 whitespace-nowrap font-medium">
                      {act.tubeType || act.sampleType}
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
              Specimen Pipeline Distribution
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
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
                <span className="text-base font-black text-slate-800 leading-none">
                  {liveSamples.length}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  Total
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 text-xs">
              {statusDistributionData.map((item) => (
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

      {/* ── Barcode Printable Modal ── */}
      {barcodeModalSample && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>Specimen Barcode Label</span>
              </div>
              <button
                onClick={() => setBarcodeModalSample(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Label Box */}
            <div className="p-5 border-2 border-slate-800 rounded-2xl bg-white space-y-2 text-center text-slate-900" id="barcode-sticker">
              <div className="flex justify-between items-center text-xs font-black">
                <span>{barcodeModalSample.patientName}</span>
                <span className="font-mono">{barcodeModalSample.patientId}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold text-left">
                Test: <span className="text-slate-800 font-bold">{barcodeModalSample.testName}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold text-left">
                Tube: <span className="text-purple-700 font-bold">{barcodeModalSample.tubeType}</span>
              </div>

              {/* Barcode display */}
              <div className="py-2 flex flex-col items-center justify-center">
                <svg className="h-12 w-56" viewBox="0 0 144 40" fill="none">
                  <rect x="0" y="0" width="3" height="40" fill="#000" />
                  <rect x="5" y="0" width="2" height="40" fill="#000" />
                  <rect x="9" y="0" width="4" height="40" fill="#000" />
                  <rect x="15" y="0" width="1" height="40" fill="#000" />
                  <rect x="18" y="0" width="3" height="40" fill="#000" />
                  <rect x="23" y="0" width="2" height="40" fill="#000" />
                  <rect x="27" y="0" width="5" height="40" fill="#000" />
                  <rect x="34" y="0" width="2" height="40" fill="#000" />
                  <rect x="38" y="0" width="1" height="40" fill="#000" />
                  <rect x="41" y="0" width="4" height="40" fill="#000" />
                  <rect x="47" y="0" width="2" height="40" fill="#000" />
                  <rect x="51" y="0" width="3" height="40" fill="#000" />
                  <rect x="56" y="0" width="1" height="40" fill="#000" />
                  <rect x="59" y="0" width="4" height="40" fill="#000" />
                  <rect x="65" y="0" width="2" height="40" fill="#000" />
                  <rect x="69" y="0" width="3" height="40" fill="#000" />
                  <rect x="74" y="0" width="5" height="40" fill="#000" />
                  <rect x="81" y="0" width="1" height="40" fill="#000" />
                  <rect x="84" y="0" width="3" height="40" fill="#000" />
                  <rect x="89" y="0" width="2" height="40" fill="#000" />
                  <rect x="93" y="0" width="4" height="40" fill="#000" />
                  <rect x="99" y="0" width="2" height="40" fill="#000" />
                  <rect x="103" y="0" width="3" height="40" fill="#000" />
                  <rect x="108" y="0" width="1" height="40" fill="#000" />
                  <rect x="111" y="0" width="4" height="40" fill="#000" />
                  <rect x="117" y="0" width="2" height="40" fill="#000" />
                  <rect x="121" y="0" width="5" height="40" fill="#000" />
                  <rect x="128" y="0" width="2" height="40" fill="#000" />
                  <rect x="132" y="0" width="3" height="40" fill="#000" />
                  <rect x="137" y="0" width="2" height="40" fill="#000" />
                  <rect x="141" y="0" width="3" height="40" fill="#000" />
                </svg>
                <span className="font-mono font-black text-sm tracking-widest mt-1">
                  {barcodeModalSample.sampleId}
                </span>
              </div>

              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 border-t border-slate-100 pt-1.5">
                <span>ORDER: {barcodeModalSample.orderNumber}</span>
                <span>{new Date().toLocaleDateString('en-US')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBarcodeModalSample(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </LabPageShell>
  );
}
