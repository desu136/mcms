'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  Receipt,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  Wallet,
  Building,
  Smartphone,
  X,
  Loader2,
  Users,
  ChevronDown,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import dynamic from 'next/dynamic';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import { useAuth } from '../../../lib/auth/auth-context';
import { fetchPatients, fetchDepartments } from '../../../lib/api';
import type { PatientDTO, ClinicDepartmentDTO } from '@mcms/contracts';
import type { ReceiptPrintData } from '../../../components/receptionist/ReceiptModal';

const ReceiptModal = dynamic(() => import('../../../components/receptionist/ReceiptModal'), { ssr: false });

export interface InvoiceLineItem {
  id: string;
  item: string;
  category: string;
  price: number;
  qty: number;
  total: number;
}

export interface IssuedInvoice {
  invoiceNo: string;
  patientId: string;
  patientName: string;
  patientPid: string;
  departmentName: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Pending';
  date: string;
  dateTime: string;
  lines: InvoiceLineItem[];
  discountAmount: number;
  notes?: string | undefined;
}

const PRESET_SERVICES = [
  { item: 'Outpatient General Consultation', category: 'Consultation', price: 200 },
  { item: 'Specialist Consultation', category: 'Specialist', price: 350 },
  { item: 'Follow-up Consultation', category: 'Consultation', price: 150 },
  { item: 'Patient Card & Registration', category: 'Administrative', price: 50 },
  { item: 'Emergency Triage & Evaluation', category: 'Emergency', price: 300 },
  { item: 'Routine Diagnostic Lab Panel', category: 'Laboratory', price: 400 },
];

export default function BillingPaymentsPage() {
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);

  // Selected patient
  const [selectedPatient, setSelectedPatient] = useState<PatientDTO | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  // Selected department & visit type
  const [visitType, setVisitType] = useState('Consultation');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  // Invoice Lines
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLineItem[]>([
    {
      id: '1',
      item: 'Outpatient General Consultation',
      category: 'Consultation',
      price: 200,
      qty: 1,
      total: 200,
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer'>('Cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // History & Receipts
  const [issuedInvoices, setIssuedInvoices] = useState<IssuedInvoice[]>([]);
  const [printReceiptData, setPrintReceiptData] = useState<ReceiptPrintData | null>(null);
  const [paidSuccess, setPaidSuccess] = useState<string | null>(null);

  // Load backend patients and departments
  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [patRes, depts] = await Promise.all([
        fetchPatients(accessToken, { limit: 20 }),
        fetchDepartments(accessToken),
      ]);
      setPatients(patRes.data || []);
      setDepartments(depts || []);
      if (patRes.data.length > 0 && !selectedPatient) {
        setSelectedPatient(patRes.data[0] ?? null);
      }
      if (depts.length > 0 && !selectedDeptId) {
        setSelectedDeptId(depts[0]?.id ?? '');
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedPatient, selectedDeptId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Subtotal and Total Calculation
  const subtotal = useMemo(() => {
    return invoiceLines.reduce((acc, curr) => acc + curr.total, 0);
  }, [invoiceLines]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const totalAmount = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  const handleRemoveLine = (id: string) => {
    setInvoiceLines((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddLine = (serviceIndex: number = 0) => {
    const preset = PRESET_SERVICES[serviceIndex % PRESET_SERVICES.length] ?? {
      item: 'Medical Consultation',
      category: 'General',
      price: 200,
    };
    const nextId = String(Date.now() + Math.random());
    const newLine: InvoiceLineItem = {
      id: nextId,
      item: preset.item,
      category: preset.category,
      price: preset.price,
      qty: 1,
      total: preset.price,
    };
    setInvoiceLines((prev) => [...prev, newLine]);
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    if (invoiceLines.length === 0) {
      alert('Please add at least one charge item.');
      return;
    }

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0] ?? '';

    const deptObj = departments.find((d) => d.id === selectedDeptId);
    const departmentName = deptObj?.name || 'General Outpatient';

    const newInv: IssuedInvoice = {
      invoiceNo: receiptNo,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientPid: selectedPatient.pid,
      departmentName,
      amount: totalAmount,
      method: paymentMethod,
      status: 'Paid',
      date: todayStr,
      dateTime: `${todayStr} ${nowStr}`,
      lines: [...invoiceLines],
      discountAmount,
      notes: notes.trim() || undefined,
    };

    setIssuedInvoices((prev) => [newInv, ...prev]);
    setPaidSuccess(`Payment of ETB ${totalAmount.toFixed(2)} collected successfully! Receipt ${receiptNo} issued.`);

    // Automatically trigger receipt print view
    setPrintReceiptData({
      receiptNumber: receiptNo,
      patientName: selectedPatient.fullName,
      patientPid: selectedPatient.pid,
      departmentName,
      paymentMethod,
      dateTime: `${todayStr} ${nowStr}`,
      lineItems: invoiceLines,
      subtotal,
      discountAmount,
      totalAmount,
      notes: notes.trim() || undefined,
    });

    setTimeout(() => {
      setPaidSuccess(null);
    }, 4000);
  };

  const handleReset = () => {
    setInvoiceLines([
      {
        id: '1',
        item: 'Outpatient General Consultation',
        category: 'Consultation',
        price: 200,
        qty: 1,
        total: 200,
      },
    ]);
    setDiscountPercent(0);
    setNotes('');
  };

  // Filtered patients for dropdown
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery.trim()) return patients.slice(0, 8);
    const q = patientSearchQuery.toLowerCase();
    return patients.filter(
      (p) => p.fullName.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q) || (p.phoneNumber ?? '').includes(q),
    ).slice(0, 8);
  }, [patients, patientSearchQuery]);

  // Dynamic KPIs calculated from session and database
  const totalCollected = useMemo(() => {
    return issuedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [issuedInvoices]);

  const billingKpis: Array<{
    title: string;
    value: string;
    prefix?: string | undefined;
    change?: string | undefined;
    trend?: 'up' | 'down' | undefined;
    trendLabel?: string | undefined;
    iconName?: ('users' | 'calendar' | 'check-circle' | 'receipt' | 'clock' | 'dollar') | undefined;
    color?: ('blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose') | undefined;
  }> = [
    {
      title: "Today's Billings",
      value: totalCollected > 0 ? totalCollected.toFixed(2) : '0.00',
      prefix: 'ETB ',
      change: `${issuedInvoices.length} receipt${issuedInvoices.length === 1 ? '' : 's'}`,
      trend: 'up',
      trendLabel: 'Collected',
      iconName: 'receipt',
      color: 'blue',
    },
    {
      title: 'Invoices Issued',
      value: String(issuedInvoices.length),
      change: 'Front desk receipts',
      trend: 'up',
      trendLabel: 'Issued',
      iconName: 'check-circle',
      color: 'emerald',
    },
    {
      title: 'Active Patients',
      value: String(patients.length),
      change: 'In directory',
      trend: 'up',
      trendLabel: 'Total',
      iconName: 'users',
      color: 'cyan',
    },
    {
      title: 'Departments',
      value: String(departments.length),
      change: 'Clinical units',
      trend: 'up',
      trendLabel: 'Available',
      iconName: 'calendar',
      color: 'purple',
    },
    {
      title: 'Average Ticket',
      value: issuedInvoices.length > 0 ? (totalCollected / issuedInvoices.length).toFixed(2) : '200.00',
      prefix: 'ETB ',
      change: 'Per patient',
      trend: 'up',
      trendLabel: 'Standard fee',
      iconName: 'dollar',
      color: 'amber',
    },
  ];

  // Dynamic payment methods breakdown
  const paymentMethodsDonut = useMemo(() => {
    let cash = 0;
    let card = 0;
    let mobile = 0;
    let bank = 0;

    issuedInvoices.forEach((inv) => {
      if (inv.method === 'Cash') cash += inv.amount;
      else if (inv.method === 'Card') card += inv.amount;
      else if (inv.method === 'Bank Transfer') bank += inv.amount;
      else mobile += inv.amount;
    });

    const total = cash + card + mobile + bank;

    if (total === 0) {
      return [
        { name: 'Cash', percent: 60, amount: '0', color: '#1E6BFF' },
        { name: 'Telebirr', percent: 40, amount: '0', color: '#F59E0B' },
      ];
    }

    const list = [
      { name: 'Cash', percent: Math.round((cash / total) * 100), amount: cash.toFixed(2), color: '#1E6BFF' },
      { name: 'Card', percent: Math.round((card / total) * 100), amount: card.toFixed(2), color: '#10B981' },
      { name: 'Telebirr', percent: Math.round((mobile / total) * 100), amount: mobile.toFixed(2), color: '#F59E0B' },
      { name: 'Bank Transfer', percent: Math.round((bank / total) * 100), amount: bank.toFixed(2), color: '#8B5CF6' },
    ];

    return list.filter((item) => Number(item.amount) > 0);
  }, [issuedInvoices]);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <>
            <ReceptionistBanner
              title="Billing & Payments"
              subtitle="Create consultation invoices, collect patient fees, issue thermal receipts and view front-desk payment history."
              icon={CreditCard}
              actionElement={
                <button
                  type="button"
                  onClick={() => handleAddLine(0)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Service
                </button>
              }
            />

            {/* Payment Success Alert */}
            {paidSuccess && (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{paidSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPaidSuccess(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}
          </>
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {billingKpis.map((kpi, idx) => (
              <ReceptionistStatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                prefix={kpi.prefix}
                change={kpi.change}
                trend={kpi.trend}
                trendLabel={kpi.trendLabel}
                iconName={kpi.iconName}
                color={kpi.color}
              />
            ))}
          </div>
        }
      >
        {/* ─── 3 Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
          {/* ─── LEFT COLUMN: Create Invoice Form (5 cols) ─── */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Front Desk Receipt</h2>
              </div>
              <button
                type="button"
                onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Search className="w-3.5 h-3.5" />
                {patientDropdownOpen ? 'Close Search' : 'Select Patient'}
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-4">
              {/* Patient selector chip & Dropdown */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient <span className="text-rose-500">*</span>
                </label>

                {selectedPatient ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span className="font-bold text-blue-900 truncate">{selectedPatient.fullName}</span>
                      <span className="text-blue-600 font-mono shrink-0">({selectedPatient.pid})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPatientDropdownOpen(true)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded ml-2"
                      title="Change Patient"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPatientDropdownOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600 transition"
                  >
                    Click to choose registered patient...
                  </button>
                )}

                {/* Patient Search Popover */}
                {patientDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        placeholder="Search patient name, PID or phone..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                      {filteredPatients.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">No patient found.</div>
                      ) : (
                        filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient(p);
                              setPatientDropdownOpen(false);
                            }}
                            className="p-2 hover:bg-blue-50/70 rounded-lg cursor-pointer transition flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-slate-800">{p.fullName}</span>
                            <span className="font-mono text-blue-600 text-[11px]">{p.pid}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Visit Type & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="Consultation">General Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Routine">Routine Checkup</option>
                    <option value="Lab Only">Laboratory Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    {departments.length === 0 ? (
                      <option value="">General Clinic</option>
                    ) : (
                      departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Services / Charges Table */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span>Services / Charges</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-normal">Add Preset:</span>
                    <button
                      type="button"
                      onClick={() => handleAddLine(0)}
                      className="text-[10px] text-blue-600 hover:underline font-bold px-1"
                    >
                      +Consult
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLine(3)}
                      className="text-[10px] text-blue-600 hover:underline font-bold px-1"
                    >
                      +Card
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLine(5)}
                      className="text-[10px] text-blue-600 hover:underline font-bold px-1"
                    >
                      +Lab
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2 px-2.5 font-medium">#</th>
                        <th className="py-2 px-2.5 font-medium">Service / Item</th>
                        <th className="py-2 px-2.5 font-medium">Price (ETB)</th>
                        <th className="py-2 px-2.5 font-medium">Qty</th>
                        <th className="py-2 px-2.5 font-medium">Total</th>
                        <th className="py-2 px-2.5 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoiceLines.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400">
                            No charges added yet. Click &quot;Add Service&quot; below.
                          </td>
                        </tr>
                      ) : (
                        invoiceLines.map((line, idx) => (
                          <tr key={line.id} className="hover:bg-slate-50/70">
                            <td className="py-2 px-2.5 text-slate-400 font-medium">{idx + 1}</td>
                            <td className="py-2 px-2.5 font-bold text-slate-800">{line.item}</td>
                            <td className="py-2 px-2.5 text-slate-700">{line.price.toFixed(2)}</td>
                            <td className="py-2 px-2.5 text-slate-700">{line.qty}</td>
                            <td className="py-2 px-2.5 font-semibold text-slate-900">{line.total.toFixed(2)}</td>
                            <td className="py-2 px-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(line.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                                title="Remove line"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add Service button */}
                <button
                  type="button"
                  onClick={() => handleAddLine(0)}
                  className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Service
                </button>
              </div>

              {/* Subtotal, Discount & Total Amount */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">ETB {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Discount</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-14 px-2 py-0.5 text-right border border-slate-200 rounded text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-extrabold text-slate-800 text-sm">Total Amount</span>
                  <span className="font-black text-blue-600 text-lg">ETB {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'Cash', label: 'Cash', icon: Wallet },
                    { id: 'Card', label: 'Card', icon: CreditCard },
                    { id: 'Mobile Money', label: 'Telebirr', icon: Smartphone },
                    { id: 'Bank Transfer', label: 'Bank Transfer', icon: Building },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] truncate leading-none">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for receipt..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  <DollarSign className="w-4 h-4" />
                  Collect &amp; Print Receipt
                </button>
              </div>
            </form>
          </div>

          {/* ─── MIDDLE COLUMN: Recent Invoices & Payment History (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Issued Receipts ({issuedInvoices.length})</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-2 font-medium">Receipt #</th>
                      <th className="pb-2 font-medium">Patient</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {issuedInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No receipts issued during this session yet.
                        </td>
                      </tr>
                    ) : (
                      issuedInvoices.map((inv) => (
                        <tr key={inv.invoiceNo} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 font-mono font-bold text-blue-600 whitespace-nowrap">
                            {inv.invoiceNo}
                          </td>
                          <td className="py-2 font-bold text-slate-800 whitespace-nowrap">
                            <div>{inv.patientName}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">{inv.patientPid}</div>
                          </td>
                          <td className="py-2 font-semibold text-slate-900 whitespace-nowrap">
                            ETB {inv.amount.toFixed(2)}
                          </td>
                          <td className="py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setPrintReceiptData({
                                  receiptNumber: inv.invoiceNo,
                                  patientName: inv.patientName,
                                  patientPid: inv.patientPid,
                                  departmentName: inv.departmentName,
                                  paymentMethod: inv.method,
                                  dateTime: inv.dateTime,
                                  lineItems: inv.lines,
                                  subtotal: inv.amount + inv.discountAmount,
                                  discountAmount: inv.discountAmount,
                                  totalAmount: inv.amount,
                                  notes: inv.notes,
                                });
                              }}
                              className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              Print
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Pricing Reference */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Clinic Standard Tariff</h2>
              </div>

              <div className="space-y-2">
                {PRESET_SERVICES.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{srv.item}</div>
                      <div className="text-[10px] text-slate-400">{srv.category}</div>
                    </div>
                    <span className="font-extrabold text-blue-600">ETB {srv.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Payment Methods Donut & Quick Actions (3 cols) ─── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Payment Methods Today Donut */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Payment Breakdown</h2>
              </div>

              <div className="relative h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodsDonut}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="percent"
                      isAnimationActive={false}
                    >
                      {paymentMethodsDonut.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color ?? '#1E6BFF'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-semibold text-slate-400">Total Collected</span>
                  <span className="text-[11px] font-black text-slate-800 leading-none mt-0.5">
                    ETB {totalCollected.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {paymentMethodsDonut.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-slate-600 font-medium">{m.name}</span>
                    </div>
                    <div className="font-bold text-slate-800">
                      {m.percent}% <span className="font-normal text-slate-400">(ETB {m.amount})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleAddLine(0)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">New Charge</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Print Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Printable Thermal Receipt Modal */}
      {printReceiptData && (
        <ReceiptModal
          isOpen={!!printReceiptData}
          receipt={printReceiptData}
          onClose={() => setPrintReceiptData(null)}
        />
      )}
    </>
  );
}
