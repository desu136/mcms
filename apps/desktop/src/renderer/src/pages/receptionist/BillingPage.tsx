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

export function BillingPage({ onNavigateTab }: BillingPageProps) {
  const { enqueueOperation } = useSync();
  const [filterTab, setFilterTab] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<RecentInvoice[]>(RECENT_INVOICES_LIST);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchesFilter = filterTab === 'All' || inv.status === filterTab;
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleProcessPayment = async (inv: RecentInvoice) => {
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

  return (
    <ReceptionistPageShell
      banner={
        <ReceptionistBanner
          title="Billing & Patient Invoices"
          subtitle="Generate clinic invoices, collect cash/Telebirr/card payments and print patient receipts."
          icon={CreditCard}
          actionElement={
            <div className="flex items-center gap-2">
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
                    {inv.status !== 'Paid' ? (
                      <button
                        onClick={() => handleProcessPayment(inv)}
                        type="button"
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                      >
                        Collect Pay
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600">Settled ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

export default React.memo(BillingPage);
