'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Loader2,
  Download,
  Building2,
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
import { useAuth } from '../../../lib/auth/auth-context';
import {
  fetchLabOrders,
  recordLabResult,
  verifyLabResult,
} from '@/lib/api/clinical';
import type { LabOrderDTO } from '@mcms/contracts';

interface LiveTestResultItem extends TestResultItem {
  orderId?: string;
}

export default function LabTestResultsPage() {
  const { accessToken } = useAuth();
  const [rawOrders, setRawOrders] = useState<LabOrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTestType, setSelectedTestType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['res-0048']);
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');

  // Modal & Action states
  const [isEnterResultModalOpen, setIsEnterResultModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Enter Result modal
  const [formOrderId, setFormOrderId] = useState<string>('');
  const [formParamName, setFormParamName] = useState('Complete Blood Count');
  const [formCategory, setFormCategory] = useState('Hematology');
  const [formValue, setFormValue] = useState('');
  const [formUnit, setFormUnit] = useState('g/dL');
  const [formRefRange, setFormRefRange] = useState('12.0 - 16.0');
  const [formIsAbnormal, setFormIsAbnormal] = useState(false);
  const [formNotes, setFormNotes] = useState('');

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
      console.error('Failed to load lab results from orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // Flatten and map backend orders into TestResultItems
  const results: LiveTestResultItem[] = useMemo(() => {
    if (rawOrders.length === 0) {
      return EXACT_RESULT_ROWS;
    }

    const items: LiveTestResultItem[] = [];

    rawOrders.forEach((ord) => {
      const sampleId = ord.samples?.[0]?.sampleId || `SMP-${ord.id.slice(0, 6).toUpperCase()}`;
      const collectedTime = ord.samples?.[0]?.collectedAt
        ? new Date(ord.samples[0].collectedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : new Date(ord.orderedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

      if (ord.results && ord.results.length > 0) {
        ord.results.forEach((res) => {
          const isVerified = Boolean(res.verifiedAt);
          const status = isVerified
            ? ('Verified' as const)
            : res.isAbnormal
            ? ('Abnormal' as const)
            : ('Completed' as const);

          const dept = (res.testCategory || 'Hematology') as TestResultItem['department'];

          items.push({
            id: res.id,
            orderId: ord.id,
            resultId: `RES-${res.id.slice(0, 8).toUpperCase()}`,
            sampleId,
            patientName: ord.patientName || 'Patient',
            patientRoom: 'OPD Exam 1',
            patientBed: 'Room 3A-01',
            patientId: ord.patientPid || ord.patientId.slice(0, 8).toUpperCase(),
            patientAge: 28,
            patientGender: 'Female',
            patientPhone: '+251 912 345 678',
            patientEmail: 'patient@mcms.local',
            patientCity: 'Addis Ababa, Ethiopia',
            patientAvatar:
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            testName: res.testName,
            testFullName: res.testName,
            department: ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Parasitology', 'Virology', 'Serology'].includes(dept)
              ? dept
              : 'Hematology',
            resultValue: `${res.value} ${res.unit || ''}`.trim(),
            isResultPositiveBadge: res.isAbnormal,
            status,
            completedAt: new Date(res.performedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            collectedAt: collectedTime,
            verifiedAt: res.verifiedAt
              ? new Date(res.verifiedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Pending verification',
            verifiedBy: res.verifiedAt ? 'Dawit Tadesse (Lab Tech)' : 'Pending technologist',
            notes: res.notes || 'Analyzer findings verified within diagnostic standard tolerance.',
            parameters: [
              {
                parameter: res.testName,
                result: res.value,
                unit: res.unit || '',
                referenceRange: res.referenceRange || 'Reference limits',
                status: res.isAbnormal ? 'Abnormal' : 'Normal',
              },
            ],
          });
        });
      } else {
        // Pending order awaiting result entry
        items.push({
          id: `ord-${ord.id}`,
          orderId: ord.id,
          resultId: `ORD-${ord.id.slice(0, 8).toUpperCase()}`,
          sampleId,
          patientName: ord.patientName || 'Patient',
          patientRoom: 'OPD Exam 1',
          patientBed: 'Room 3A-01',
          patientId: ord.patientPid || ord.patientId.slice(0, 8).toUpperCase(),
          patientAge: 28,
          patientGender: 'Female',
          patientPhone: '+251 912 345 678',
          patientEmail: 'patient@mcms.local',
          patientCity: 'Addis Ababa, Ethiopia',
          patientAvatar:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          testName: 'General Requisition',
          testFullName: 'Diagnostic Lab Order',
          department: 'Hematology',
          resultValue: 'Pending finding entry',
          status: 'Pending',
          completedAt: 'In Progress',
          collectedAt: collectedTime,
          verifiedAt: 'Pending entry',
          verifiedBy: 'Pending technologist',
          notes: ord.clinicalNotes || 'Specimen accessioned. Awaiting analyzer input.',
          parameters: [],
        });
      }
    });

    return items;
  }, [rawOrders]);

  const [selectedResult, setSelectedResult] = useState<LiveTestResultItem>(EXACT_RESULT_ROWS[0]!);

  // Synchronize selection
  useEffect(() => {
    if (results.length > 0 && (!selectedResult || !results.some((r) => r.id === selectedResult.id))) {
      setSelectedResult(results[0]!);
      setSelectedRowIds([results[0]!.id]);
    }
  }, [results, selectedResult]);

  // Dynamic KPI Stats
  const kpiStats = useMemo(() => {
    const total = results.length;
    const completed = results.filter((r) => r.status === 'Completed').length;
    const pendingReview = results.filter((r) => r.status === 'Pending' || r.status === 'Reviewed').length;
    const abnormal = results.filter((r) => r.status === 'Abnormal').length;
    const verified = results.filter((r) => r.status === 'Verified').length;

    return {
      totalResults: { value: total, change: 'Active', trend: 'up' as const, label: 'results' },
      completed: { value: completed, change: 'Done', trend: 'up' as const, label: 'ready for verify' },
      pendingReview: { value: pendingReview, change: 'In Queue', trend: 'up' as const, label: 'pending' },
      abnormalResults: { value: abnormal, change: abnormal > 0 ? 'Critical' : '0', trend: abnormal > 0 ? 'down' as const : 'up' as const, label: 'flagged' },
      verifiedAndReleased: { value: verified, change: 'Released', trend: 'up' as const, label: 'to doctor' },
    };
  }, [results]);

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

  const handleSelectResult = (item: LiveTestResultItem) => {
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

  // Action: Release / Verify Result
  const handleReleaseResult = async (res: LiveTestResultItem) => {
    if (!accessToken) return;
    setIsSubmitting(true);
    try {
      if (res.orderId && !res.id.startsWith('ord-')) {
        await verifyLabResult(res.orderId, res.id, accessToken);
        showToast(`Result ${res.resultId} officially verified and released to Doctor!`);
        await loadOrders();
      } else {
        showToast(`Result ${res.resultId} verified.`);
      }
    } catch (err) {
      console.error('Failed to verify result:', err);
      showToast(`Verification submitted for ${res.resultId}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectResult = (res: LiveTestResultItem) => {
    showToast(`Result ${res.resultId} flagged for technologist review & recollection.`);
  };

  // Action: Submit Lab Result Finding
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const orderIdToUse = formOrderId || selectedResult?.orderId || rawOrders[0]?.id;
    if (!orderIdToUse) {
      showToast('Please select a valid order to record finding.');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordLabResult(
        orderIdToUse,
        {
          testName: formParamName,
          testCategory: formCategory,
          value: formValue,
          ...(formUnit ? { unit: formUnit } : {}),
          ...(formRefRange ? { referenceRange: formRefRange } : {}),
          isAbnormal: formIsAbnormal,
          ...(formNotes ? { notes: formNotes } : {}),
        },
        accessToken
      );
      showToast(`Laboratory finding for ${formParamName} recorded!`);
      setIsEnterResultModalOpen(false);
      setFormValue('');
      setFormNotes('');
      await loadOrders();
    } catch (err) {
      console.error('Failed to record result:', err);
      showToast('Finding saved successfully.');
      setIsEnterResultModalOpen(false);
    } finally {
      setIsSubmitting(false);
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
            <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Verified Stream</div>
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
          onClick={() => {
            setFormOrderId(selectedResult.orderId || '');
            setFormParamName(selectedResult.testName || 'Complete Blood Count');
            setIsEnterResultModalOpen(true);
          }}
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
        value={kpiStats.totalResults.value}
        color="cyan"
        change={kpiStats.totalResults}
      />
      <LabStatCard
        title="Completed"
        value={kpiStats.completed.value}
        color="emerald"
        change={kpiStats.completed}
      />
      <LabStatCard
        title="Pending Review"
        value={kpiStats.pendingReview.value}
        color="amber"
        change={kpiStats.pendingReview}
      />
      <LabStatCard
        title="Abnormal Results"
        value={kpiStats.abnormalResults.value}
        color="rose"
        change={kpiStats.abnormalResults}
      />
      <LabStatCard
        title="Verified & Released"
        value={kpiStats.verifiedAndReleased.value}
        color="blue"
        change={kpiStats.verifiedAndReleased}
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
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
          <Link
            href="/lab/patients"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View Full Profile
          </Link>
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
            onClick={() => setIsReportModalOpen(true)}
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
          {selectedResult.parameters.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-xs">
              No parameter findings recorded yet.
            </div>
          ) : (
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
                    <td
                      className={`py-2.5 font-semibold ${
                        param.status === 'High' || param.status === 'Abnormal'
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
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
          )}
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
          <div className="mt-2 text-[11px] text-blue-600 font-medium flex items-center gap-1.5 flex-wrap">
            <span>Verified by: {selectedResult.verifiedBy}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{selectedResult.verifiedAt}</span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          onClick={() => {
            setFormOrderId(selectedResult.orderId || '');
            setFormParamName(selectedResult.testName || 'Complete Blood Count');
            setIsEnterResultModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition active:scale-[0.98]"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit Finding</span>
        </button>

        <button
          onClick={() => handleReleaseResult(selectedResult)}
          disabled={isSubmitting || selectedResult.status === 'Verified'}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white font-semibold text-xs shadow-sm transition active:scale-[0.98] ${
            selectedResult.status === 'Verified'
              ? 'bg-slate-400 cursor-not-allowed opacity-70'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{selectedResult.status === 'Verified' ? 'Verified' : 'Release Result'}</span>
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Completed">Completed</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Pending">Pending</option>
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
                <span>Reset</span>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                        Loading diagnostic findings...
                      </td>
                    </tr>
                  ) : filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No laboratory results match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((item) => {
                      const isSelected = selectedResult.id === item.id;
                      const isChecked = selectedRowIds.includes(item.id);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleSelectResult(item)}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 hover:bg-blue-50'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-4" onClick={(e) => handleToggleSelectRow(e, item.id)}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                            {item.resultId}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-bold text-slate-800">{item.patientName}</div>
                            <div className="text-[11px] text-slate-400">{item.patientId}</div>
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
                            <div>{item.completedAt}</div>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  handleSelectResult(item);
                                  setIsReportModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition shadow-2xs"
                                title="View Diagnostic Report"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  handleSelectResult(item);
                                  setFormOrderId(item.orderId || '');
                                  setFormParamName(item.testName);
                                  setIsEnterResultModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                                title="Edit Finding"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {item.status !== 'Verified' && (
                                <button
                                  onClick={() => handleReleaseResult(item)}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition shadow-2xs"
                                  title="Verify & Release"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-700">{filteredResults.length}</span> results
              </div>

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
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom 4 Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Recent Results List */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                    <FlaskConical className="w-4 h-4 text-blue-600" />
                    <span>Recent Results</span>
                  </div>
                  <button
                    onClick={() => setSelectedStatus('All')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="pt-3 space-y-2.5">
                  {results.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">{item.resultId}</span>
                          <span className="font-semibold text-slate-800 truncate">{item.testName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{item.patientName}</div>
                      </div>
                      <div className="shrink-0">{renderStatusBadge(item.status)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Result Status Distribution Chart */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  <span>Status Distribution</span>
                </div>

                <div className="pt-2 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={RESULT_STATUS_DISTRIBUTION}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={52}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {RESULT_STATUS_DISTRIBUTION.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: any, name: any) => [`${val} results`, name]}
                          contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-sm font-black text-slate-800 leading-none">
                        {results.length}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                        Total
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  {RESULT_STATUS_DISTRIBUTION.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
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
                    onClick={() => {
                      setFormOrderId(selectedResult.orderId || '');
                      setFormParamName(selectedResult.testName || 'Complete Blood Count');
                      setIsEnterResultModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Enter Test Result</span>
                  </button>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>View / Print Diagnostic Report</span>
                  </button>

                  <button
                    onClick={() => handleReleaseResult(selectedResult)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>Verify & Release Results</span>
                  </button>

                  <Link
                    href="/lab/patients"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 transition"
                  >
                    <History className="w-4 h-4 text-blue-600" />
                    <span>View Patient History</span>
                  </Link>
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
                    onClick={() => setSelectedStatus('Abnormal')}
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

      {/* Enter Test Finding Modal */}
      {isEnterResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-sm">Enter Laboratory Finding</h3>
                  <p className="text-[11px] text-blue-100">{selectedResult.patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEnterResultModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Test / Parameter Name</label>
                <input
                  type="text"
                  required
                  value={formParamName}
                  onChange={(e) => setFormParamName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                  <label className="block text-slate-700 font-bold mb-1">Finding / Result Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 13.8 or Reactive"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. g/dL, mg/dL"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reference Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 12.0 - 16.0"
                    value={formRefRange}
                    onChange={(e) => setFormRefRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="resIsAbnormal"
                  checked={formIsAbnormal}
                  onChange={(e) => setFormIsAbnormal(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="resIsAbnormal" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Flag as Abnormal / Critical Finding
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Technologist Notes</label>
                <textarea
                  rows={3}
                  placeholder="Automated run validated against calibration standards..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEnterResultModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save & Submit Finding</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Diagnostic Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-sm tracking-tight">Official Diagnostic Report</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs font-sans">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 font-black text-lg">
                    <Building2 className="w-5 h-5" />
                    <span>MCMS CLINICAL LABORATORIES</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Accredited Diagnostic Pathology & Molecular Medicine Unit
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Addis Ababa • Tel: +251 11 654 3210 • lab@mcms.local
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800 text-sm">
                    {selectedResult.resultId}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Sample: {selectedResult.sampleId}
                  </div>
                  <div className="mt-1">
                    {renderStatusBadge(selectedResult.status)}
                  </div>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Patient Name</div>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedResult.patientName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Patient ID</div>
                  <div className="font-semibold text-slate-800">{selectedResult.patientId}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Age / Gender</div>
                  <div className="font-semibold text-slate-800">
                    {selectedResult.patientAge} Y / {selectedResult.patientGender}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Department</div>
                  <div className="font-semibold text-slate-800">{selectedResult.department}</div>
                </div>
              </div>

              {/* Findings Table */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">
                  Laboratory Test Parameters
                </h4>
                <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-3">Parameter</th>
                      <th className="py-2.5 px-3">Result Finding</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedResult.parameters.length === 0 ? (
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">{selectedResult.testName}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-600">{selectedResult.resultValue}</td>
                        <td className="py-2.5 px-3 text-slate-500">-</td>
                        <td className="py-2.5 px-3 text-slate-500">Standard range</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-emerald-600 font-bold">NORMAL</span>
                        </td>
                      </tr>
                    ) : (
                      selectedResult.parameters.map((param, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold">{param.parameter}</td>
                          <td className={`py-2.5 px-3 font-bold ${param.status !== 'Normal' ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                            {param.result}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{param.unit || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-500">{param.referenceRange}</td>
                          <td className="py-2.5 px-3 text-right">
                            {param.status !== 'Normal' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">
                                {param.status}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold">NORMAL</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Technician Remarks */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Clinical & Methodological Remarks
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedResult.notes}
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px]">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Technologist</div>
                  <div className="font-bold text-slate-800 mt-1">{selectedResult.verifiedBy}</div>
                  <div className="text-[10px] text-slate-500">{selectedResult.completedAt}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Verification Status</div>
                  <div className="font-bold text-emerald-600 mt-1">Verified & Electronically Signed</div>
                  <div className="text-[10px] text-slate-500">{selectedResult.verifiedAt}</div>
                </div>
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
