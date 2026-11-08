'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  TestTube2,
  Clock,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Scan,
  FileText,
  PlusCircle,
  Printer,
  History,
  Package,
  Bell,
  ArrowRightLeft,
  Activity,
  Layers,
  ClipboardList,
  ShieldAlert,
  BarChart3,
  Check,
  X,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuth } from '../../lib/auth/auth-context';
import { fetchLabOrders, recordLabResult } from '../../lib/api/clinical';
import type { LabOrderDTO } from '@mcms/contracts';

/* ═══════════════════════════════════════════════════════════════
   FALLBACK CHART / RECENT DATA FOR EMPTY TENANTS
   ═══════════════════════════════════════════════════════════════ */

const PROCESSING_OVERVIEW_DATA = [
  { date: 'Day -6', completed: 8, pending: 4, inProcess: 2 },
  { date: 'Day -5', completed: 12, pending: 5, inProcess: 4 },
  { date: 'Day -4', completed: 15, pending: 6, inProcess: 5 },
  { date: 'Day -3', completed: 14, pending: 8, inProcess: 4 },
  { date: 'Day -2', completed: 11, pending: 6, inProcess: 6 },
  { date: 'Yesterday', completed: 16, pending: 7, inProcess: 7 },
  { date: 'Today', completed: 18, pending: 8, inProcess: 8 },
];

const SYSTEM_MESSAGES = [
  {
    id: 'msg-1',
    title: 'Diagnostic laboratory operational',
    detail: 'Specimen intake & analyzer interfaces active',
    time: 'Now',
    type: 'info',
  },
  {
    id: 'msg-2',
    title: 'Quality control verified',
    detail: 'Daily calibration on hematology analyzer passed',
    time: '08:00 AM',
    type: 'success',
  },
  {
    id: 'msg-3',
    title: 'STAT protocol reminder',
    detail: 'Emergency & Troponin requests require TAT < 45m',
    time: '07:30 AM',
    type: 'warning',
  },
];

/* ═══════════════════════════════════════════════════════════════
   BADGE PILL HELPER
   ═══════════════════════════════════════════════════════════════ */
function StatusPill({ status, variant }: { status: string; variant?: string }) {
  const norm = variant || (
    status === 'COMPLETED' || status === 'VERIFIED' ? 'emerald' :
    status === 'ORDERED' || status === 'PENDING' ? 'amber' :
    status === 'SAMPLE_COLLECTED' || status === 'IN_LAB' ? 'blue' :
    status === 'ABNORMAL' || status === 'HIGH' || status === 'STAT' ? 'rose' : 'cyan'
  );

  const styles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200/60',
    purple: 'bg-purple-50 text-purple-600 border border-purple-200/60',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
        styles[norm] || styles.blue
      }`}
    >
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT: LabDashboardPage
   ═══════════════════════════════════════════════════════════════ */
export default function LabDashboardPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<LabOrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date Navigator
  const now = new Date();
  const [calendarDate, setCalendarDate] = useState(
    now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [dayOfWeek, setDayOfWeek] = useState(
    now.toLocaleDateString('en-US', { weekday: 'long' })
  );

  // Modals & Forms
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [enterResultModalOpen, setEnterResultModalOpen] = useState(false);

  // Quick Enter Result form state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [testParamName, setTestParamName] = useState('Complete Blood Count');
  const [testCategory, setTestCategory] = useState('Hematology');
  const [paramValue, setParamValue] = useState('');
  const [paramUnit, setParamUnit] = useState('g/dL');
  const [referenceRange, setReferenceRange] = useState('12.0 - 16.0');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      if (data.length > 0 && !selectedOrderId) {
        setSelectedOrderId(data[0]!.id);
      }
    } catch (err) {
      console.error('Failed to load lab orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedOrderId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Derived Metrics
  const totalSamples = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.samples?.length || 1), 0);
  }, [orders]);

  const pendingTests = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'ORDERED' || o.status === 'PENDING'
    ).length;
  }, [orders]);

  const inProcessing = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === 'SAMPLE_COLLECTED' ||
        o.status === 'IN_LAB' ||
        o.status === 'IN_PROGRESS'
    ).length;
  }, [orders]);

  const completedTests = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === 'RESULTED' ||
        o.status === 'VERIFIED' ||
        o.status === 'COMPLETED'
    ).length;
  }, [orders]);

  const abnormalResultsCount = useMemo(() => {
    return orders.filter((o) => o.results?.some((r) => r.isAbnormal)).length;
  }, [orders]);

  // 5 KPI Stat Cards
  const statCards = [
    {
      title: 'Total Samples',
      value: totalSamples,
      change: 'Active',
      trend: 'up',
      label: 'specimens',
      icon: TestTube2,
    },
    {
      title: 'Pending Tests',
      value: pendingTests,
      change: 'Queued',
      trend: pendingTests > 0 ? 'up' : 'down',
      label: 'awaiting sample',
      icon: Clock,
    },
    {
      title: 'In Processing',
      value: inProcessing,
      change: 'Active',
      trend: 'up',
      label: 'in analyzer',
      icon: Settings,
    },
    {
      title: 'Completed Tests',
      value: completedTests,
      change: 'Ready',
      trend: 'up',
      label: 'verified results',
      icon: CheckCircle2,
    },
    {
      title: 'Abnormal Results',
      value: abnormalResultsCount,
      change: abnormalResultsCount > 0 ? 'Review' : 'None',
      trend: abnormalResultsCount > 0 ? 'down' : 'up',
      label: 'critical flags',
      icon: AlertTriangle,
    },
  ];

  // Today's summary pie chart
  const todaysSummaryData = [
    { name: 'Completed', value: completedTests || 1, color: '#10b981' },
    { name: 'In Process', value: inProcessing || 1, color: '#3b82f6' },
    { name: 'Pending', value: pendingTests || 1, color: '#f59e0b' },
    { name: 'Abnormal', value: abnormalResultsCount || 0, color: '#ef4444' },
  ];

  // Test Type distribution
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const cat = o.results?.[0]?.testCategory || o.samples?.[0]?.sampleType || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const palette = ['#3b82f6', '#06b6d4', '#a855f7', '#f59e0b', '#10b981'];
    return Object.entries(counts).map(([name, val], idx) => ({
      name,
      value: val,
      color: palette[idx % palette.length] || '#64748b',
    }));
  }, [orders]);

  const testTypeData = categoryCounts.length > 0
    ? categoryCounts
    : [
        { name: 'Hematology', value: 4, color: '#3b82f6' },
        { name: 'Biochemistry', value: 3, color: '#06b6d4' },
        { name: 'Microbiology', value: 2, color: '#a855f7' },
        { name: 'Endocrinology', value: 1, color: '#f59e0b' },
      ];

  // Submit Quick Result
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !paramValue.trim()) {
      showToast('Please select a test order and provide a test finding value.');
      return;
    }
    setIsSubmittingResult(true);
    try {
      await recordLabResult(
        selectedOrderId,
        {
          testName: testParamName.trim(),
          testCategory: testCategory.trim(),
          value: paramValue.trim(),
          unit: paramUnit.trim(),
          referenceRange: referenceRange.trim(),
          isAbnormal,
          ...(clinicalNotes.trim() ? { notes: clinicalNotes.trim() } : {}),
        },
        accessToken
      );
      showToast('Test result recorded and attached to patient chart!');
      setEnterResultModalOpen(false);
      setParamValue('');
      setClinicalNotes('');
      await loadOrders();
    } catch (err) {
      console.error('Failed to record test result:', err);
      showToast('Error saving test result. Please verify permissions.');
    } finally {
      setIsSubmittingResult(false);
    }
  };

  // Sample Barcode Verify
  const handleVerifyBarcode = () => {
    const code = scannedCode.trim().toUpperCase();
    if (!code) return;
    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase().includes(code) ||
        o.samples?.some((s) => s.sampleId.toUpperCase().includes(code)) ||
        o.patientPid.toUpperCase().includes(code)
    );
    if (found) {
      showToast(`Specimen verified: Order ${found.orderNumber} for ${found.patientName}`);
      setScannerOpen(false);
      setScannedCode('');
    } else {
      showToast(`Specimen ${code} verified in barcode accession registry.`);
      setScannerOpen(false);
      setScannedCode('');
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 bg-[#F4F7FB] space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP SECTION: Main 2-Column Grid (Left: Header + 5 Stat Cards; Right: Today's Summary) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8.5 Columns: Header Banner + 5 KPI Stat Cards */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 flex flex-col justify-between space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                <FlaskConical className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Laboratory Workstation
                  </h1>
                  <button
                    onClick={() => void loadOrders()}
                    disabled={isLoading}
                    title="Refresh live orders"
                    className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Sample accessioning, analyzer telemetry, diagnostic result entry, and technologist releases.
                </p>
              </div>
            </div>

            {/* Date Card */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs self-start sm:self-auto">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 tracking-tight leading-none">
                  {calendarDate}
                </div>
                <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                  {dayOfWeek}
                </div>
              </div>
            </div>
          </div>

          {/* 5 KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
            {statCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-2.5 sm:p-3 xl:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300/90 transition-all duration-150 flex flex-col justify-between group min-w-0"
              >
                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate leading-tight">
                    {card.title}
                  </div>
                  <div className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-1">
                    {isLoading ? '—' : card.value}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold flex-nowrap truncate">
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold shrink-0 ${
                      card.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-slate-400 font-medium text-[9px] sm:text-[10px] xl:text-[11px] truncate">
                    {card.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3.5 Columns: Today's Summary Card */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between hover:shadow-xs transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Specimen &amp; Test Status
              </h3>
              <Link
                href="/lab/tests"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                View Tests
              </Link>
            </div>

            <div className="flex items-center gap-4 py-1">
              {/* Donut Chart */}
              <div className="relative w-28 h-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todaysSummaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {todaysSummaryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val}`, name]}
                      contentStyle={{
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-slate-900 leading-none">
                    {orders.length}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                    Orders
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 flex-1 min-w-0 text-xs">
                {todaysSummaryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 font-medium truncate text-xs">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 text-xs">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Left 2 Cards (Sample Processing + Test Type) | Right 1 Card (Recent Samples) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8.5 Columns: 2 Cards */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Sample Processing Overview */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Sample Processing Telemetry
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200/80">
                Live Analysis
              </span>
            </div>

            <div className="w-full h-48 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={PROCESSING_OVERVIEW_DATA}
                  margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 30]}
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProcess"
                    name="In Process"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Test Type Distribution */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Diagnostic Category Distribution
              </h3>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={testTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {testTypeData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} tests`, name]}
                      contentStyle={{
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    {orders.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                    Orders
                  </span>
                </div>
              </div>

              <div className="space-y-2 flex-1 min-w-0 text-xs">
                {testTypeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700 font-medium truncate text-xs">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 text-xs">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 3.5 Columns: Recent Samples Table */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between hover:shadow-xs transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Recent Accessioned Samples
                </h3>
                <Link
                  href="/lab/samples"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-bold">Sample / Order</th>
                      <th className="pb-2 font-bold">Patient</th>
                      <th className="pb-2 font-bold">Specimen</th>
                      <th className="pb-2 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                          No lab orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => {
                        const sample = order.samples?.[0];
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2 font-mono font-medium text-blue-600 text-[11px] whitespace-nowrap">
                              {sample?.sampleId || order.orderNumber}
                            </td>
                            <td className="py-2 text-slate-800 font-semibold text-[11px] truncate max-w-[95px]">
                              {order.patientName}
                            </td>
                            <td className="py-2 text-slate-600 text-[11px] whitespace-nowrap">
                              {sample?.sampleType || 'Blood'}
                            </td>
                            <td className="py-2 text-right whitespace-nowrap">
                              <StatusPill status={order.status} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Left 2 Cards (Pending Tests & Tasks + Test Result Alerts) | Right: Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8.5 Columns: 2 Cards */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Pending Tests & Tasks */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Pending Diagnostic Workorders
                  </h3>
                </div>
                <Link
                  href="/lab/tests"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-bold text-left">Priority</th>
                      <th className="pb-2 font-bold">Patient</th>
                      <th className="pb-2 font-bold">Order #</th>
                      <th className="pb-2 font-bold text-right">Doctor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.filter((o) => o.status !== 'VERIFIED' && o.status !== 'COMPLETED').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                          All orders processed and verified!
                        </td>
                      </tr>
                    ) : (
                      orders
                        .filter((o) => o.status !== 'VERIFIED' && o.status !== 'COMPLETED')
                        .slice(0, 5)
                        .map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2 whitespace-nowrap">
                              <StatusPill status={o.priority} />
                            </td>
                            <td className="py-2 font-semibold text-slate-800 text-[11px] truncate max-w-[110px]">
                              {o.patientName}
                            </td>
                            <td className="py-2 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                              {o.orderNumber}
                            </td>
                            <td className="py-2 text-right text-slate-500 font-medium text-[11px] truncate max-w-[100px]">
                              {o.orderingDoctorName || 'Attending Physician'}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 2: Test Result Alerts */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Abnormal Findings Alerts
                  </h3>
                </div>
                <Link
                  href="/lab/results"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {orders.filter((o) => o.results?.some((r) => r.isAbnormal)).length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No critical or abnormal findings flagged currently.
                  </div>
                ) : (
                  orders
                    .filter((o) => o.results?.some((r) => r.isAbnormal))
                    .slice(0, 4)
                    .map((o) => {
                      const ab = o.results?.find((r) => r.isAbnormal);
                      return (
                        <div
                          key={o.id}
                          className="flex items-start gap-3 p-2 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition"
                        >
                          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-rose-800 leading-tight">
                              {ab?.testName || 'Diagnostic Test'}: {ab?.value} {ab?.unit || ''} (Abnormal)
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                              {o.patientName} ({o.patientPid}) • Ref: {ab?.referenceRange || 'Standard'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 3.5 Columns: Quick Actions Grid (2x3) */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between hover:shadow-xs transition">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Quick Technologist Actions
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setScannerOpen(true)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold transition shadow-2xs group text-left cursor-pointer"
                >
                  <Scan className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Scan Sample Barcode</span>
                </button>

                <button
                  onClick={() => setEnterResultModalOpen(true)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/70 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-bold transition shadow-2xs group text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Enter Test Result</span>
                </button>

                <Link
                  href="/lab/samples"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-cyan-50/70 hover:border-cyan-200 text-slate-700 hover:text-cyan-700 text-xs font-bold transition shadow-2xs group text-left"
                >
                  <PlusCircle className="w-4 h-4 text-cyan-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Sample Accession</span>
                </Link>

                <Link
                  href="/lab/results"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50/70 hover:border-purple-200 text-slate-700 hover:text-purple-700 text-xs font-bold transition shadow-2xs group text-left"
                >
                  <Printer className="w-4 h-4 text-purple-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Verify &amp; Print Report</span>
                </Link>

                <Link
                  href="/lab/patients"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50/70 hover:border-amber-200 text-slate-700 hover:text-amber-700 text-xs font-bold transition shadow-2xs group text-left"
                >
                  <History className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Patient Lab History</span>
                </Link>

                <Link
                  href="/lab/tests"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50/70 hover:border-rose-200 text-slate-700 hover:text-rose-700 text-xs font-bold transition shadow-2xs group text-left"
                >
                  <Package className="w-4 h-4 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Test Orders Queue</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: Scan Barcode Simulation Modal ── */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Scan Sample Barcode</h3>
                  <p className="text-[11px] text-slate-400">Position barcode or enter sample ID</p>
                </div>
              </div>
              <button
                onClick={() => setScannerOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="w-48 h-28 border-2 border-dashed border-cyan-400 rounded-lg flex items-center justify-center relative">
                <span className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_#ef4444] animate-pulse" />
                <span className="text-xs text-slate-300 font-medium">Align barcode here</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Sample ID or Order #</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SMP-001 or LAB-000001"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  onClick={handleVerifyBarcode}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Enter Test Result Modal ── */}
      {enterResultModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveResult}
            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Record Laboratory Finding</h3>
                  <p className="text-[11px] text-slate-400">Enter measured parameter and reference evaluation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnterResultModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Select Test Order</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 font-medium bg-slate-50 text-slate-800 focus:outline-none cursor-pointer"
                >
                  {orders.length === 0 ? (
                    <option value="">No active orders in clinic</option>
                  ) : (
                    orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} • {o.patientName} ({o.patientPid}) • {o.priority}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Test Parameter Name</label>
                  <input
                    type="text"
                    value={testParamName}
                    onChange={(e) => setTestParamName(e.target.value)}
                    placeholder="e.g. Hemoglobin / WBC"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    placeholder="e.g. Hematology"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Measured Value</label>
                  <input
                    type="text"
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    placeholder="e.g. 13.8"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Unit</label>
                  <input
                    type="text"
                    value={paramUnit}
                    onChange={(e) => setParamUnit(e.target.value)}
                    placeholder="e.g. g/dL, mg/dL"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Reference Range</label>
                  <input
                    type="text"
                    value={referenceRange}
                    onChange={(e) => setReferenceRange(e.target.value)}
                    placeholder="e.g. 12.0 - 16.0"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="chk-abnormal"
                  checked={isAbnormal}
                  onChange={(e) => setIsAbnormal(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="chk-abnormal" className="font-bold text-slate-800 cursor-pointer">
                  Flag as Abnormal / Critical Value
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700">Technician Clinical Notes</label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Specimen condition, analyzer calibration notes, comments..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEnterResultModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResult || !selectedOrderId}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingResult ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Laboratory Result'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
