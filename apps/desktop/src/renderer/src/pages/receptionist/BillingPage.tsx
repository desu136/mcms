import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  Receipt,
  Printer,
  CheckCircle2,
  DollarSign,
  Building,
  Smartphone,
  X,
  Loader2,
  Users,
  ChevronDown,
  Database,
  RefreshCw,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import ReceiptModal, { ReceiptPrintData } from '../../components/receptionist/ReceiptModal';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../auth/AuthContext';
import { fetchPatients, fetchDepartments } from '../../api';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';
import type { PatientDTO, ClinicDepartmentDTO } from '@mcms/contracts';

interface BillingPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

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
  { item: 'Nursing Dressing & Vitals', category: 'Nursing', price: 150 },
];

export function BillingPage({ onNavigateTab }: BillingPageProps) {
  const { enqueueOperation, isOnline } = useSync();
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [departments, setDepartments] = useState<ClinicDepartmentDTO[]>([]);

  // Selected patient
  const [selectedPatient, setSelectedPatient] = useState<PatientDTO | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  // Department
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

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Telebirr' | 'Bank Transfer'>('Cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // History & Receipts
  const [issuedInvoices, setIssuedInvoices] = useState<IssuedInvoice[]>([]);
  const [printReceiptData, setPrintReceiptData] = useState<ReceiptPrintData | null>(null);
  const [paidSuccess, setPaidSuccess] = useState<string | null>(null);

  // Search filter for invoices history table
  const [historySearch, setHistorySearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, depts] = await Promise.all([
        fetchPatients(accessToken, { limit: 50 }),
        fetchDepartments(accessToken),
      ]);
      setPatients(patRes?.data || []);
      setDepartments(depts || []);
      if (patRes?.data && patRes.data.length > 0 && !selectedPatient) {
        setSelectedPatient(patRes.data[0] ?? null);
      }
      if (depts && depts.length > 0 && !selectedDeptId) {
        setSelectedDeptId(depts[0]?.id ?? '');
      }
    } catch (err) {
      console.warn('Failed to load billing patients/departments:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedPatient, selectedDeptId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Calculations
  const subtotal = useMemo(() => {
    return invoiceLines.reduce((acc, curr) => acc + curr.total, 0);
  }, [invoiceLines]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
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

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    if (invoiceLines.length === 0) {
      alert('Please add at least one charge item.');
      return;
    }

    const receiptNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0] ?? '';

    const deptObj = departments.find((d) => d.id === selectedDeptId);
    const departmentName = deptObj?.name || 'General Outpatient';

    const newInv: IssuedInvoice = {
      invoiceNo: receiptNo,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName || `${selectedPatient.firstName} ${selectedPatient.lastName}`.trim(),
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

    // Enqueue operation into SQLite sync queue
    await enqueueOperation('invoice', receiptNo, 'CREATE', {
      invoiceNo: receiptNo,
      patientId: selectedPatient.id,
      patientName: newInv.patientName,
      amount: totalAmount,
      method: paymentMethod,
      status: 'Paid',
      createdAt: new Date().toISOString(),
    });

    setIssuedInvoices((prev) => [newInv, ...prev]);
    setPaidSuccess(`Payment of ETB ${totalAmount.toFixed(2)} collected successfully! Receipt ${receiptNo} issued.`);

    // Trigger thermal receipt print modal
    setPrintReceiptData({
      receiptNumber: receiptNo,
      patientName: newInv.patientName,
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

  const handleResetForm = () => {
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
      (p) =>
        (p.fullName || `${p.firstName} ${p.lastName}`).toLowerCase().includes(q) ||
        p.pid.toLowerCase().includes(q) ||
        (p.phoneNumber ?? '').includes(q),
    ).slice(0, 8);
  }, [patients, patientSearchQuery]);

  // Dynamic KPIs
  const totalCollected = useMemo(() => {
    return issuedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [issuedInvoices]);

  const billingKpis = useMemo(() => {
    return [
      {
        title: "Today's Billings",
        value: totalCollected > 0 ? totalCollected.toFixed(2) : '0.00',
        prefix: 'ETB ',
        change: `${issuedInvoices.length} receipt${issuedInvoices.length === 1 ? '' : 's'}`,
        trend: 'up' as const,
        trendLabel: 'Collected',
        iconName: 'receipt' as const,
        color: 'blue' as const,
      },
      {
        title: 'Invoices Issued',
        value: String(issuedInvoices.length),
        change: 'POS Terminal Receipts',
        trend: 'up' as const,
        trendLabel: 'Issued',
        iconName: 'check-circle' as const,
        color: 'emerald' as const,
      },
      {
        title: 'Active Patients',
        value: String(patients.length),
        change: 'In directory',
        trend: 'up' as const,
        trendLabel: 'Total',
        iconName: 'users' as const,
        color: 'cyan' as const,
      },
      {
        title: 'SQLite Offline POS',
        value: isOnline ? 'Online Synced' : 'Offline Mode',
        change: 'Auto-sync active',
        trend: 'up' as const,
        trendLabel: 'Storage engine',
        iconName: 'clock' as const,
        color: 'amber' as const,
      },
    ];
  }, [totalCollected, issuedInvoices.length, patients.length, isOnline]);

  // Payment methods breakdown
  const paymentMethodsDonut = useMemo(() => {
    let cash = 0;
    let card = 0;
    let telebirr = 0;
    let bank = 0;

    issuedInvoices.forEach((inv) => {
      if (inv.method === 'Cash') cash += inv.amount;
      else if (inv.method === 'Card') card += inv.amount;
      else if (inv.method === 'Bank Transfer') bank += inv.amount;
      else telebirr += inv.amount;
    });

    const total = cash + card + telebirr + bank;
    if (total === 0) {
      return [
        { name: 'Cash', percent: 60, amount: '0', color: '#1E6BFF' },
        { name: 'Telebirr', percent: 40, amount: '0', color: '#F59E0B' },
      ];
    }

    const list = [
      { name: 'Cash', percent: Math.round((cash / total) * 100), amount: cash.toFixed(2), color: '#1E6BFF' },
      { name: 'Card', percent: Math.round((card / total) * 100), amount: card.toFixed(2), color: '#10B981' },
      { name: 'Telebirr', percent: Math.round((telebirr / total) * 100), amount: telebirr.toFixed(2), color: '#F59E0B' },
      { name: 'Bank Transfer', percent: Math.round((bank / total) * 100), amount: bank.toFixed(2), color: '#8B5CF6' },
    ];

    return list.filter((item) => Number(item.amount) > 0);
  }, [issuedInvoices]);

  // Filtered invoices history
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return issuedInvoices;
    const q = historySearch.toLowerCase();
    return issuedInvoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientPid.toLowerCase().includes(q),
    );
  }, [issuedInvoices, historySearch]);

  return (
    <>
      <ReceptionistPageShell
        banner={
          <ReceptionistBanner
            title="Billing & Patient Invoices"
            subtitle="Generate clinic invoices, collect cash/Telebirr/card payments and print patient receipts."
            icon={CreditCard}
            actionElement={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddLine(0)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service Line</span>
                </button>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  <Database className="w-3.5 h-3.5" />
                  <span>POS Offline Terminal</span>
                </span>
              </div>
            }
          />
        }
        kpis={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
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
        rightPanel={
          <div className="space-y-3.5">
            {/* Payment Methods Donut */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Session Payments</h3>
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
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-semibold text-slate-400">Total</span>
                  <span className="text-[11px] font-black text-slate-800 leading-none mt-0.5">
                    ETB {totalCollected.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                {paymentMethodsDonut.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {paidSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-md animate-in fade-in space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Payment Collected
                </div>
                <div className="text-xs font-bold">{paidSuccess}</div>
                <div className="text-[11px] text-emerald-100">
                  Receipt recorded and enqueued to SQLite sync storage.
                </div>
              </div>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Create Invoice / Billing Form Panel */}
          <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">New Patient Invoice</h2>
                <p className="text-[11px] text-slate-500">Select patient and add itemized clinic fees.</p>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-3.5">
              {/* Patient Autocomplete Selector */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Patient Dossier *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientSearchQuery || (selectedPatient ? `${selectedPatient.fullName || selectedPatient.firstName} (${selectedPatient.pid})` : '')}
                    onFocus={() => {
                      setPatientDropdownOpen(true);
                      setPatientSearchQuery('');
                    }}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setPatientDropdownOpen(true);
                    }}
                    placeholder="Search patient by name, PID, or phone..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {patientDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-56 overflow-y-auto p-1 divide-y divide-slate-100">
                    {filteredPatients.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No matching patients found.
                      </div>
                    ) : (
                      filteredPatients.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPatient(p);
                            setPatientSearchQuery('');
                            setPatientDropdownOpen(false);
                          }}
                          className="p-2 hover:bg-blue-50/70 rounded-lg cursor-pointer transition-colors text-xs flex justify-between items-center"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{p.fullName || `${p.firstName} ${p.lastName}`}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {p.pid} • {p.phoneNumber || 'No phone'}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Select
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Service Line Items</label>
                  <div className="flex items-center gap-1.5">
                    {PRESET_SERVICES.slice(0, 3).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddLine(idx)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        + {preset.category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {invoiceLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/70 text-xs gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={line.item}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInvoiceLines((prev) =>
                              prev.map((l) => (l.id === line.id ? { ...l, item: val } : l)),
                            );
                          }}
                          className="w-full bg-transparent font-bold text-slate-800 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">{line.category}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900">
                          ETB {line.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method & Discount */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Telebirr">Telebirr</option>
                    <option value="Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer (CBE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Total & Submit */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">ETB {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-mono font-bold">-ETB {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-600">ETB {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!selectedPatient || invoiceLines.length === 0}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Collect Payment & Print Receipt</span>
                </button>
              </div>
            </form>
          </div>

          {/* Invoices History Table */}
          <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today&apos;s Receipts</h3>
                <p className="text-[11px] text-slate-400">{issuedInvoices.length} transactions processed</p>
              </div>
              <div className="relative w-40">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter receipts..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No receipts issued in this session yet.
                </div>
              ) : (
                filteredHistory.map((inv) => (
                  <div
                    key={inv.invoiceNo}
                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-blue-700">{inv.invoiceNo}</span>
                        <div className="font-bold text-slate-900">{inv.patientName}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-600">
                          ETB {inv.amount.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400">{inv.method}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>{inv.dateTime}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPrintReceiptData({
                            receiptNumber: inv.invoiceNo,
                            patientName: inv.patientName,
                            patientPid: inv.patientPid,
                            departmentName: inv.departmentName,
                            paymentMethod: inv.method,
                            dateTime: inv.dateTime,
                            lineItems: inv.lines,
                            subtotal: inv.amount,
                            discountAmount: inv.discountAmount,
                            totalAmount: inv.amount,
                            notes: inv.notes,
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3 text-slate-400" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Official Receipt Thermal Print Modal */}
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

export default React.memo(BillingPage);
