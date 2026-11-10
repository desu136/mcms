import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Printer,
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  AlertCircle,
  Database,
  ArrowRight,
  Plus,
  X,
  Building2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ReceptionistBanner from '../../components/receptionist/ReceptionistBanner';
import ReceptionistPageShell from '../../components/receptionist/ReceptionistPageShell';
import ReceptionistStatCard from '../../components/receptionist/ReceptionistStatCard';
import {
  BILLING_KPIS,
  RECENT_INVOICES_LIST,
  RecentInvoice,
  PAYMENT_METHODS_DONUT,
} from '../../components/receptionist/receptionistMockData';
import { useSync } from '../../context/SyncContext';
import { ReceptionistTab } from '../../components/receptionist/ReceptionistSidebar';

interface BillingPageProps {
  onNavigateTab: (tab: ReceptionistTab) => void;
}

interface DisplayInvoice extends RecentInvoice {
  method?: string;
}

export function BillingPage({ onNavigateTab }: BillingPageProps) {
  const { enqueueOperation } = useSync();
  const [filterTab, setFilterTab] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<DisplayInvoice[]>(RECENT_INVOICES_LIST);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // New Invoice Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [serviceName, setServiceName] = useState('General Consultation');
  const [amount, setAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');

  // Receipt Modal
  const [receiptInvoice, setReceiptInvoice] = useState<DisplayInvoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchesFilter = filterTab === 'All' || inv.status === filterTab;
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleProcessPayment = async (inv: DisplayInvoice) => {
    // Enqueue operation to local SQLite sync queue
    await enqueueOperation('invoice', inv.invoiceNo, 'UPDATE', {
      invoiceNo: inv.invoiceNo,
      status: 'Paid',
      paidAt: new Date().toISOString(),
      amount: inv.amount,
    });

    setInvoices((prev) =>
      prev.map((i) => (i.invoiceNo === inv.invoiceNo ? { ...i, status: 'Paid' as const } : i)),
    );

    setPaymentSuccess(inv.invoiceNo);
    setTimeout(() => setPaymentSuccess(null), 3000);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newInvoiceNo = `INV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newInv: DisplayInvoice = {
      invoiceNo: newInvoiceNo,
      patientName: patientName.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: amount.trim() || '500.00',
      status: 'Pending',
      method: paymentMethod,
    };

    // Save to local SQLite sync queue
    await enqueueOperation('invoice', newInvoiceNo, 'CREATE', {
      ...newInv,
      serviceName,
      createdAt: new Date().toISOString(),
    });

    setInvoices((prev) => [newInv, ...prev]);
    setIsCreateModalOpen(false);
    setPatientName('');
    setAmount('500');
  };

  const handlePrintReceipt = (inv: DisplayInvoice) => {
    setReceiptInvoice(inv);
  };

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
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Invoice</span>
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
            {BILLING_KPIS.map((kpi, idx) => (
              <ReceptionistStatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                change={kpi.change}
                trend={kpi.trend}
                trendLabel={kpi.trendLabel}
                iconName={kpi.iconName}
                color={kpi.color}
              />
            ))}
          </div>
        }
        subnav={
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'Pending', 'Paid', 'Overdue'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterTab === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice no, patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        }
        rightPanel={
          <div className="space-y-3.5">
            {/* Payment Methods Donut */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Payment Methods</h3>
              </div>
              <div className="relative h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PAYMENT_METHODS_DONUT}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="percent"
                      isAnimationActive={false}
                    >
                      {PAYMENT_METHODS_DONUT.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-semibold text-slate-400">Total</span>
                  <span className="text-[11px] font-black text-slate-800 leading-none mt-0.5">
                    ETB 11,250
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                {PAYMENT_METHODS_DONUT.map((item) => (
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

            {paymentSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-md animate-in fade-in space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Payment Collected
                </div>
                <div className="text-sm font-black">{paymentSuccess} Settled</div>
                <div className="text-[11px] text-emerald-100">
                  Receipt recorded and enqueued to SQLite sync storage.
                </div>
              </div>
            )}
          </div>
        }
      >
        {/* Invoices Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Invoice #</th>
                  <th className="pb-2.5">Patient Name</th>
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => (
                  <tr key={inv.invoiceNo} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-700">{inv.invoiceNo}</td>
                    <td className="py-2.5 font-bold text-slate-900">{inv.patientName}</td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">{inv.date}</td>
                    <td className="py-2.5 text-slate-600">{inv.method || 'Cash'}</td>
                    <td className="py-2.5 font-bold text-slate-900 font-mono">
                      ETB {inv.amount}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== 'Paid' ? (
                          <button
                            onClick={() => handleProcessPayment(inv)}
                            type="button"
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                          >
                            Collect Pay
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePrintReceipt(inv)}
                            type="button"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ReceptionistPageShell>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Create Patient Invoice</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Bikila"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service / Consultation</label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="General Consultation">General Consultation (ETB 500)</option>
                  <option value="Specialist Follow-up">Specialist Follow-up (ETB 750)</option>
                  <option value="Emergency Triage">Emergency Triage (ETB 1,000)</option>
                  <option value="Routine Lab Blood Panel">Routine Lab Blood Panel (ETB 650)</option>
                  <option value="Nursing Dressing & Vitals">Nursing Dressing & Vitals (ETB 300)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (ETB)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Telebirr">Telebirr</option>
                    <option value="Cash">Cash</option>
                    <option value="CBE Birr">CBE Birr</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Printable Slip Modal */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                M
              </div>
              <h3 className="text-base font-black text-slate-900 mt-2">METROPOLITAN CLINIC</h3>
              <p className="text-[10px] text-slate-500">Official Patient Payment Receipt</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-900">{receiptInvoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{receiptInvoice.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-mono text-slate-700">{receiptInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-medium text-slate-800">{receiptInvoice.method || 'Telebirr'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total Paid:</span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  ETB {receiptInvoice.amount}
                </span>
              </div>
              <div className="text-center pt-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  PAID IN FULL ✓
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-slate-300 flex gap-2">
              <button
                type="button"
                onClick={() => setReceiptInvoice(null)}
                className="flex-1 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(BillingPage);
