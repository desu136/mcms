import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { fetchLabOrders } from '../../api/clinical';
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

export interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
  onOpenNewOrder?: () => void;
  onOpenCollectSample?: () => void;
  onOpenEnterResult?: (order?: any) => void;
}

// 5 KPI Stat Cards
const STAT_CARDS = [
  {
    title: 'Total Samples',
    value: 48,
    change: '↑ 12%',
    trend: 'up',
    label: 'vs. yesterday',
    icon: TestTube2,
    iconBg: 'bg-cyan-50 border-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    title: 'Pending Tests',
    value: 15,
    change: '↑ 7%',
    trend: 'up',
    label: 'vs. yesterday',
    icon: Clock,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-500',
  },
  {
    title: 'In Processing',
    value: 12,
    change: '↑ 20%',
    trend: 'up',
    label: 'vs. yesterday',
    icon: Settings,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Completed Tests',
    value: 21,
    change: '↑ 18%',
    trend: 'up',
    label: 'vs. yesterday',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Abnormal Results',
    value: 3,
    change: '↓ 50%',
    trend: 'down',
    label: 'vs. yesterday',
    icon: AlertTriangle,
    iconBg: 'bg-rose-50 border-rose-100',
    iconColor: 'text-rose-500',
  },
];

// Today's Summary Donut Chart Data
const TODAYS_SUMMARY_DATA = [
  { name: 'Completed', value: 21, percent: '44%', color: '#10b981' },
  { name: 'In Process', value: 12, percent: '25%', color: '#8b5cf6' },
  { name: 'Pending', value: 15, percent: '31%', color: '#f59e0b' },
  { name: 'Abnormal', value: 3, percent: '6%', color: '#ef4444' },
];

// Sample Processing Overview Line Chart Data (Last 7 Days)
const PROCESSING_OVERVIEW_DATA = [
  { date: 'Oct 13', completed: 18, pending: 8, inProcess: 5 },
  { date: 'Oct 14', completed: 23, pending: 10, inProcess: 7 },
  { date: 'Oct 15', completed: 26, pending: 12, inProcess: 9 },
  { date: 'Oct 16', completed: 24, pending: 15, inProcess: 8 },
  { date: 'Oct 17', completed: 22, pending: 11, inProcess: 10 },
  { date: 'Oct 18', completed: 27, pending: 13, inProcess: 12 },
  { date: 'Oct 19', completed: 28, pending: 15, inProcess: 12 },
];

// Test Type Distribution Donut Chart Data
const TEST_TYPE_DISTRIBUTION_DATA = [
  { name: 'Hematology', value: 16, percent: '33%', color: '#3b82f6' },
  { name: 'Biochemistry', value: 12, percent: '25%', color: '#06b6d4' },
  { name: 'Microbiology', value: 8, percent: '17%', color: '#a855f7' },
  { name: 'Immunology', value: 6, percent: '13%', color: '#f59e0b' },
  { name: 'Others', value: 6, percent: '12%', color: '#64748b' },
];

// Recent Samples Table Data (Right Column Card 2)
const RECENT_SAMPLES = [
  {
    id: 'SMP-2026-0018',
    patient: 'Aster Mulu',
    test: 'CBC',
    status: 'Processing',
    statusVariant: 'blue',
    received: '08:20 AM',
  },
  {
    id: 'SMP-2026-0019',
    patient: 'Samuel Girma',
    test: 'RBS',
    status: 'Pending',
    statusVariant: 'amber',
    received: '09:15 AM',
  },
  {
    id: 'SMP-2026-0020',
    patient: 'Lidya Kebede',
    test: 'Urine Analysis',
    status: 'In Lab',
    statusVariant: 'purple',
    received: '10:00 AM',
  },
  {
    id: 'SMP-2026-0021',
    patient: 'Getachew Tadese',
    test: 'LFT',
    status: 'Completed',
    statusVariant: 'emerald',
    received: '11:10 AM',
  },
  {
    id: 'SMP-2026-0022',
    patient: 'Betlehem Abebe',
    test: 'KFT',
    status: 'Processing',
    statusVariant: 'blue',
    received: '11:30 AM',
  },
];

// Pending Tests & Tasks (Row 3 Left)
const PENDING_TESTS_TASKS = [
  {
    priority: 'High',
    priorityVariant: 'rose',
    patient: 'Samuel Girma',
    test: 'RBS',
    sampleId: 'SMP-2026-0019',
    time: '09:15 AM',
  },
  {
    priority: 'High',
    priorityVariant: 'rose',
    patient: 'Lidya Kebede',
    test: 'Urine Analysis',
    sampleId: 'SMP-2026-0020',
    time: '10:00 AM',
  },
  {
    priority: 'Medium',
    priorityVariant: 'amber',
    patient: 'Tigist Alemu',
    test: 'Stool Examination',
    sampleId: 'SMP-2026-0024',
    time: '02:20 PM',
  },
  {
    priority: 'Medium',
    priorityVariant: 'amber',
    patient: 'Aster Mulu',
    test: 'Blood Culture',
    sampleId: 'SMP-2026-0025',
    time: '03:10 PM',
  },
  {
    priority: 'Low',
    priorityVariant: 'emerald',
    patient: 'Yonas Gebre',
    test: 'Hepatitis B Ag',
    sampleId: 'SMP-2026-0027',
    time: '05:00 PM',
  },
];

// Test Result Alerts (Row 3 Center)
const TEST_RESULT_ALERTS = [
  {
    id: 'alt-1',
    title: 'High WBC Count',
    patientTest: 'Samuel Girma – CBC',
    date: 'Oct 19, 2026 • 08:45 AM',
    severity: 'critical',
  },
  {
    id: 'alt-2',
    title: 'Positive for Malaria',
    patientTest: 'Getachew Tadese – Malaria Test',
    date: 'Oct 19, 2026 • 10:30 AM',
    severity: 'critical',
  },
  {
    id: 'alt-3',
    title: 'Low Hemoglobin',
    patientTest: 'Lidya Kebede – CBC',
    date: 'Oct 19, 2026 • 11:15 AM',
    severity: 'warning',
  },
];

// Recent Tests (Row 4 Left)
const RECENT_TESTS = [
  { name: 'CBC', patients: 16, completed: 14, tat: '2.5 hrs' },
  { name: 'RBS', patients: 12, completed: 10, tat: '1.2 hrs' },
  { name: 'Urine Analysis', patients: 8, completed: 6, tat: '1.8 hrs' },
  { name: 'LFT', patients: 6, completed: 5, tat: '2.1 hrs' },
  { name: 'KFT', patients: 4, completed: 3, tat: '2.4 hrs' },
];

// Laboratory Handover (Row 4 Center)
const LAB_HANDOVER = [
  {
    sampleId: 'SMP-2026-0018',
    collected: '08:20 AM',
    handoverTime: '10:15 AM',
    status: 'Delivered',
    statusVariant: 'emerald',
  },
  {
    sampleId: 'SMP-2026-0019',
    collected: '09:15 AM',
    handoverTime: '11:00 AM',
    status: 'Delivered',
    statusVariant: 'emerald',
  },
  {
    sampleId: 'SMP-2026-0020',
    collected: '10:00 AM',
    handoverTime: '11:45 AM',
    status: 'In Lab',
    statusVariant: 'purple',
  },
  {
    sampleId: 'SMP-2026-0021',
    collected: '11:10 AM',
    handoverTime: '12:30 PM',
    status: 'Pending',
    statusVariant: 'amber',
  },
  {
    sampleId: 'SMP-2026-0022',
    collected: '11:30 AM',
    handoverTime: '—',
    status: 'Collected',
    statusVariant: 'cyan',
  },
];

// System Messages (Row 4 Right)
const SYSTEM_MESSAGES = [
  {
    id: 'msg-1',
    title: 'New test order received',
    detail: 'Dr. Fitsum Alemu ordered 3 tests',
    time: '10:42 AM',
    type: 'info',
  },
  {
    id: 'msg-2',
    title: 'Critical Result Alert sent',
    detail: 'Malaria test result notified to Ward 3',
    time: '10:35 AM',
    type: 'warning',
  },
  {
    id: 'msg-3',
    title: 'Hematology Analyzer QC passed',
    detail: 'Daily calibration check complete',
    time: '08:00 AM',
    type: 'success',
  },
  {
    id: 'msg-4',
    title: 'Low reagent stock warning',
    detail: 'CBC Diluent remaining: 15%',
    time: '07:30 AM',
    type: 'warning',
  },
];

function StatusPill({ status, variant }: { status: string; variant: string }) {
  const styles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
        styles[variant] || styles.blue
      }`}
    >
      {status}
    </span>
  );
}

export function DashboardPage({
  onNavigateTab,
  onOpenNewOrder,
  onOpenCollectSample,
  onOpenEnterResult,
}: DashboardPageProps) {
  const { accessToken } = useAuth();
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [dayOfWeek, setDayOfWeek] = useState('Tuesday');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [enterResultModalOpen, setEnterResultModalOpen] = useState(false);

  // Live KPI state
  const [kpiTotal, setKpiTotal] = useState<number | null>(null);
  const [kpiPending, setKpiPending] = useState<number | null>(null);
  const [kpiProcessing, setKpiProcessing] = useState<number | null>(null);
  const [kpiCompleted, setKpiCompleted] = useState<number | null>(null);
  const [kpiAbnormal, setKpiAbnormal] = useState<number | null>(null);

  const loadKpis = useCallback(async () => {
    try {
      const orders = await fetchLabOrders(accessToken);
      setKpiTotal(orders.length);
      setKpiPending(orders.filter((o) => o.status === 'PENDING').length);
      setKpiProcessing(
        orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'PROCESSING').length,
      );
      setKpiCompleted(orders.filter((o) => o.status === 'COMPLETED').length);
      setKpiAbnormal(orders.filter((o) => o.results.some((r) => r.isAbnormal)).length);
    } catch {
      // keep nulls — UI shows '—'
    }
  }, [accessToken]);

  useEffect(() => {
    void loadKpis();
  }, [loadKpis]);

  // Derived stat cards using live data (null = loading → shows '—')
  const liveStatCards = [
    {
      title: 'Total Samples',
      value: kpiTotal ?? '—',
      change: '',
      trend: 'up' as const,
      label: 'all orders',
      icon: STAT_CARDS[0]!.icon,
      iconBg: STAT_CARDS[0]!.iconBg,
      iconColor: STAT_CARDS[0]!.iconColor,
    },
    {
      title: 'Pending Tests',
      value: kpiPending ?? '—',
      change: '',
      trend: 'up' as const,
      label: 'awaiting processing',
      icon: STAT_CARDS[1]!.icon,
      iconBg: STAT_CARDS[1]!.iconBg,
      iconColor: STAT_CARDS[1]!.iconColor,
    },
    {
      title: 'In Processing',
      value: kpiProcessing ?? '—',
      change: '',
      trend: 'up' as const,
      label: 'in progress',
      icon: STAT_CARDS[2]!.icon,
      iconBg: STAT_CARDS[2]!.iconBg,
      iconColor: STAT_CARDS[2]!.iconColor,
    },
    {
      title: 'Completed Tests',
      value: kpiCompleted ?? '—',
      change: '',
      trend: 'up' as const,
      label: 'done today',
      icon: STAT_CARDS[3]!.icon,
      iconBg: STAT_CARDS[3]!.iconBg,
      iconColor: STAT_CARDS[3]!.iconColor,
    },
    {
      title: 'Abnormal Results',
      value: kpiAbnormal ?? '—',
      change: '',
      trend: 'down' as const,
      label: 'flagged',
      icon: STAT_CARDS[4]!.icon,
      iconBg: STAT_CARDS[4]!.iconBg,
      iconColor: STAT_CARDS[4]!.iconColor,
    },
  ];

  const handlePrevDay = () => {
    setCalendarDate('Oct 18, 2026');
    setDayOfWeek('Monday');
  };

  const handleNextDay = () => {
    setCalendarDate('Oct 20, 2026');
    setDayOfWeek('Wednesday');
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 bg-[#F4F7FB] space-y-4">
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
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Laboratory Dashboard
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Manage samples, tests, and results efficiently.
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
              <div className="flex items-center gap-0.5 ml-2 border-l border-slate-200 pl-1.5">
                <button
                  onClick={handlePrevDay}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextDay}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 5 KPI Stat Cards - Compact & displayed at one row without icons */}
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
            {liveStatCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-2.5 sm:p-3 xl:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300/90 transition-all duration-150 flex flex-col justify-between group min-w-0"
              >
                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate leading-tight">
                    {card.title}
                  </div>
                  <div className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-1">
                    {card.value}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold flex-nowrap truncate">
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold shrink-0 ${
                      card.trend === 'up'
                        ? 'text-emerald-600'
                        : 'text-rose-500'
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
                Today&apos;s Summary
              </h3>
              <button
                onClick={() => onNavigateTab?.('reports')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                View Report
              </button>
            </div>

            <div className="flex items-center gap-4 py-1">
              {/* Donut Chart */}
              <div className="relative w-28 h-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TODAYS_SUMMARY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {TODAYS_SUMMARY_DATA.map((entry, i) => (
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
                  <span className="text-lg font-black text-slate-900 leading-none">48</span>
                  <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                    Total Samples
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 flex-1 min-w-0 text-xs">
                {TODAYS_SUMMARY_DATA.map((item) => (
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
                      {item.value} ({item.percent})
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
                  Sample Processing Overview
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200/80">
                Last 7 Days
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
                    domain={[0, 40]}
                    ticks={[0, 10, 20, 30, 40]}
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
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1.5, stroke: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProcess"
                    name="In Process"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 1.5, stroke: '#fff' }}
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
                Test Type Distribution
              </h3>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TEST_TYPE_DISTRIBUTION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {TEST_TYPE_DISTRIBUTION_DATA.map((entry, i) => (
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
                  <span className="text-xl font-black text-slate-900 leading-none">48</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                    Total Tests
                  </span>
                </div>
              </div>

              <div className="space-y-2 flex-1 min-w-0 text-xs">
                {TEST_TYPE_DISTRIBUTION_DATA.map((item) => (
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
                      {item.value} ({item.percent})
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
                  Recent Samples
                </h3>
                <button
                  onClick={() => onNavigateTab?.('samples')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-bold">Sample ID</th>
                      <th className="pb-2 font-bold">Patient</th>
                      <th className="pb-2 font-bold">Test</th>
                      <th className="pb-2 font-bold text-center">Status</th>
                      <th className="pb-2 font-bold text-right">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {RECENT_SAMPLES.map((sample) => (
                      <tr key={sample.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 font-medium text-blue-600 text-[11px] whitespace-nowrap">
                          {sample.id}
                        </td>
                        <td className="py-2 text-slate-800 font-semibold text-[11px] truncate max-w-[90px]">
                          {sample.patient}
                        </td>
                        <td className="py-2 text-slate-600 text-[11px] whitespace-nowrap">
                          {sample.test}
                        </td>
                        <td className="py-2 text-center whitespace-nowrap">
                          <StatusPill status={sample.status} variant={sample.statusVariant} />
                        </td>
                        <td className="py-2 text-right text-slate-400 font-medium text-[11px] whitespace-nowrap">
                          {sample.received}
                        </td>
                      </tr>
                    ))}
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
                    Pending Tests &amp; Tasks
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('tests')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-bold text-left">Priority</th>
                      <th className="pb-2 font-bold">Patient</th>
                      <th className="pb-2 font-bold">Test</th>
                      <th className="pb-2 font-bold">Sample ID</th>
                      <th className="pb-2 font-bold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {PENDING_TESTS_TASKS.map((task, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 whitespace-nowrap">
                          <StatusPill status={task.priority} variant={task.priorityVariant} />
                        </td>
                        <td className="py-2 font-semibold text-slate-800 text-[11px] truncate max-w-[95px]">
                          {task.patient}
                        </td>
                        <td className="py-2 text-slate-600 text-[11px] truncate max-w-[90px]">
                          {task.test}
                        </td>
                        <td className="py-2 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {task.sampleId}
                        </td>
                        <td className="py-2 text-right text-slate-400 font-medium text-[11px] whitespace-nowrap">
                          {task.time}
                        </td>
                      </tr>
                    ))}
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
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Test Result Alerts
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('results')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {TEST_RESULT_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => onNavigateTab?.('results')}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition cursor-pointer"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 text-rose-500 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-500 border border-amber-200/60'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-bold leading-tight ${
                          alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {alert.title}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                        {alert.patientTest}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{alert.date}</div>
                    </div>
                  </div>
                ))}
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
                  Quick Actions
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
                  onClick={() => {
                    if (onOpenEnterResult) onOpenEnterResult();
                    else setEnterResultModalOpen(true);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/70 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-bold transition shadow-2xs group text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Enter Test Result</span>
                </button>

                <button
                  onClick={onOpenCollectSample || (() => onNavigateTab?.('samples'))}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-cyan-50/70 hover:border-cyan-200 text-slate-700 hover:text-cyan-700 text-xs font-bold transition shadow-2xs group text-left cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-cyan-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Register New Sample</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50/70 hover:border-purple-200 text-slate-700 hover:text-purple-700 text-xs font-bold transition shadow-2xs group text-left cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-purple-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Print Labels</span>
                </button>

                <button
                  onClick={() => onNavigateTab?.('patients')}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50/70 hover:border-amber-200 text-slate-700 hover:text-amber-700 text-xs font-bold transition shadow-2xs group text-left cursor-pointer"
                >
                  <History className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">View Patient History</span>
                </button>

                <button
                  onClick={() => onNavigateTab?.('inventory')}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50/70 hover:border-rose-200 text-slate-700 hover:text-rose-700 text-xs font-bold transition shadow-2xs group text-left cursor-pointer"
                >
                  <Package className="w-4 h-4 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="leading-tight">Check Inventory</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 4: Left 2 Cards (Recent Tests + Lab Handover) | Right 1 Card (System Messages) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8.5 Columns: 2 Cards */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Recent Tests */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Recent Tests
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('tests')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-bold">Test Name</th>
                      <th className="pb-2 font-bold text-center">Patients</th>
                      <th className="pb-2 font-bold text-center">Completed</th>
                      <th className="pb-2 font-bold text-right">Turnaround Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {RECENT_TESTS.map((test, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 font-bold text-slate-800 text-[11px]">
                          {test.name}
                        </td>
                        <td className="py-2.5 text-center text-slate-700 font-semibold text-[11px]">
                          {test.patients}
                        </td>
                        <td className="py-2.5 text-center text-slate-700 font-semibold text-[11px]">
                          {test.completed}
                        </td>
                        <td className="py-2.5 text-right text-slate-500 font-medium text-[11px]">
                          {test.tat}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 2: Laboratory Handover */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Laboratory Handover
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('samples')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-bold">Sample ID</th>
                      <th className="pb-2 font-bold">Collected</th>
                      <th className="pb-2 font-bold">Handover Time</th>
                      <th className="pb-2 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {LAB_HANDOVER.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 font-medium text-blue-600 text-[11px] whitespace-nowrap">
                          {item.sampleId}
                        </td>
                        <td className="py-2.5 text-slate-600 text-[11px] whitespace-nowrap">
                          {item.collected}
                        </td>
                        <td className="py-2.5 text-slate-600 text-[11px] whitespace-nowrap">
                          {item.handoverTime}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <StatusPill status={item.status} variant={item.statusVariant} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3.5 Columns: System Messages */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between hover:shadow-xs transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    System Messages
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab?.('messages')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {SYSTEM_MESSAGES.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        msg.type === 'info'
                          ? 'bg-blue-50 text-blue-600'
                          : msg.type === 'warning'
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {msg.type === 'info' && <Bell className="w-3.5 h-3.5" />}
                      {msg.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {msg.type === 'success' && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {msg.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{msg.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BARCODE SCANNER MODAL ── */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Scan Sample Barcode</h3>
                  <p className="text-xs text-slate-400">Position barcode in front of reader</p>
                </div>
              </div>
              <button
                onClick={() => setScannerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse">
                <Scan className="w-8 h-8" />
              </div>
              <div className="text-xs font-bold text-slate-600">Simulate Sample Scan:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SMP-2026-0018"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    alert(`Scanned: ${scannedCode || 'SMP-2026-0018'}`);
                    setScannerOpen(false);
                    onNavigateTab?.('samples');
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setScannerOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ENTER RESULT MODAL ── */}
      {enterResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Enter Lab Test Result</h3>
                  <p className="text-xs text-slate-400">Record quantitative or qualitative result</p>
                </div>
              </div>
              <button
                onClick={() => setEnterResultModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Order / Sample
                </label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
                  <option>ORD-1024 — Aster Mulu (CBC / SMP-2026-0018)</option>
                  <option>ORD-1025 — Samuel Girma (RBS / SMP-2026-0019)</option>
                  <option>ORD-1026 — Lidya Kebede (Urine Analysis / SMP-2026-0020)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Parameter / Test
                  </label>
                  <input
                    type="text"
                    defaultValue="Hemoglobin (Hb)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Measured Value
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14.2 g/dL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Status Flag
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 font-bold cursor-pointer">
                    Normal
                  </span>
                  <span className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium cursor-pointer">
                    Abnormal High
                  </span>
                  <span className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium cursor-pointer">
                    Critical Value
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pathologist Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes or clinical observations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEnterResultModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Test result saved successfully!');
                  setEnterResultModalOpen(false);
                  onNavigateTab?.('results');
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Save &amp; Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
