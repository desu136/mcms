'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import ReceptionistBanner from '../../../components/receptionist/ReceptionistBanner';
import ReceptionistStatCard from '../../../components/receptionist/ReceptionistStatCard';
import ReceptionistPageShell from '../../../components/receptionist/ReceptionistPageShell';
import {
  BILLING_KPIS,
  INITIAL_INVOICE_LINES,
  InvoiceLineItem,
  RECENT_INVOICES_LIST,
  PAYMENT_HISTORY_LIST,
  OUTSTANDING_BALANCES_LIST,
  PAYMENT_METHODS_DONUT,
} from '../../../components/receptionist/receptionistMockData';

export default function BillingPaymentsPage() {
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLineItem[]>(INITIAL_INVOICE_LINES);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer'>('Cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Subtotal and Total Calculation
  const subtotal = invoiceLines.reduce((acc, curr) => acc + curr.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalAmount = subtotal - discountAmount;

  const handleRemoveLine = (id: string) => {
    setInvoiceLines((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddLine = () => {
    const nextId = String(invoiceLines.length + 1);
    const newLine: InvoiceLineItem = {
      id: nextId,
      item: 'Medical Consultation',
      category: 'General',
      price: 200,
      qty: 1,
      total: 200,
    };
    setInvoiceLines([...invoiceLines, newLine]);
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaidSuccess(true);
    setTimeout(() => {
      setPaidSuccess(false);
    }, 4000);
  };

  const handleReset = () => {
    setInvoiceLines(INITIAL_INVOICE_LINES);
    setDiscountPercent(0);
    setNotes('');
  };

  return (
    <ReceptionistPageShell
      banner={
        <>
          <ReceptionistBanner
            title="Billing & Payments"
            subtitle="Create invoices, collect payments, manage outstanding balances and view payment history."
            icon={CreditCard}
            actionElement={
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Invoice
              </button>
            }
          />

          {/* Payment Success Alert */}
          {paidSuccess && (
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Payment of ETB {totalAmount.toFixed(2)} collected successfully via {paymentMethod}! Receipt #REC-2026-9041 issued.</span>
              </div>
              <button
                onClick={() => setPaidSuccess(false)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}
        </>
      }
      kpis={
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
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
    >
      {/* ─── 3 Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* ─── LEFT COLUMN: Create Invoice Form (5 cols) ─── */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Create Invoice</h2>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Search className="w-3.5 h-3.5" />
              Search Patient
            </button>
          </div>

          <form onSubmit={handleCollectPayment} className="space-y-4">
            {/* Patient selector chip */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-bold text-blue-900">Aster Mulu</span>
                  <span className="text-blue-600">(P-2026-001245)</span>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title="Change Patient"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visit Type & Department */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visit Type</label>
                <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white">
                  <option>Consultation</option>
                  <option>Follow-up</option>
                  <option>Emergency</option>
                  <option>Lab Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white">
                  <option>Internal Medicine</option>
                  <option>General</option>
                  <option>Gynecology</option>
                  <option>Cardiology</option>
                  <option>Pediatrics</option>
                </select>
              </div>
            </div>

            {/* Services / Charges Table */}
            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">Services / Charges</div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2 px-2.5 font-medium">#</th>
                      <th className="py-2 px-2.5 font-medium">Service / Item</th>
                      <th className="py-2 px-2.5 font-medium">Category</th>
                      <th className="py-2 px-2.5 font-medium">Price (ETB)</th>
                      <th className="py-2 px-2.5 font-medium">Qty</th>
                      <th className="py-2 px-2.5 font-medium">Total (ETB)</th>
                      <th className="py-2 px-2.5 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceLines.map((line, idx) => (
                      <tr key={line.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-2.5 text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-bold text-slate-800">{line.item}</td>
                        <td className="py-2 px-2.5 text-slate-500">{line.category}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Service button */}
              <button
                type="button"
                onClick={handleAddLine}
                className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Service
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
                  { id: 'Mobile Money', label: 'Mobile Money', icon: Smartphone },
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
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
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
                placeholder="Enter any additional notes..."
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
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                Collect Payment
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
                <h2 className="text-sm font-bold text-slate-800">Recent Invoices</h2>
              </div>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2 font-medium">Invoice #</th>
                    <th className="pb-2 font-medium">Patient Name</th>
                    <th className="pb-2 font-medium">Amount (ETB)</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_INVOICES_LIST.map((inv) => (
                    <tr key={inv.invoiceNo} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-bold text-blue-600 whitespace-nowrap">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-2.5 font-bold text-slate-800 whitespace-nowrap">
                        {inv.patientName}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                        {inv.amount}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {inv.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Payment History</h2>
              </div>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2 font-medium">Date &amp; Time</th>
                    <th className="pb-2 font-medium">Patient Name</th>
                    <th className="pb-2 font-medium">Invoice #</th>
                    <th className="pb-2 font-medium">Amount (ETB)</th>
                    <th className="pb-2 font-medium">Method</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PAYMENT_HISTORY_LIST.map((pay, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {pay.dateTime}
                      </td>
                      <td className="py-2.5 font-bold text-slate-800 whitespace-nowrap">
                        {pay.patientName}
                      </td>
                      <td className="py-2.5 font-medium text-slate-500 whitespace-nowrap">
                        {pay.invoiceNo}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                        {pay.amount}
                      </td>
                      <td className="py-2.5 text-slate-600 whitespace-nowrap">{pay.method}</td>
                      <td className="py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pay.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Outstanding Balances & Donut & Quick Actions (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Outstanding Balances */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-bold text-slate-800">Outstanding Balances</h2>
              </div>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2 font-medium">Patient Name</th>
                    <th className="pb-2 font-medium">Amount (ETB)</th>
                    <th className="pb-2 font-medium text-right">Days Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {OUTSTANDING_BALANCES_LIST.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-bold text-slate-800">{item.patientName}</td>
                      <td className="py-2.5 font-semibold text-slate-700">{item.amount}</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                          {item.daysDue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods Today Donut */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Payment Methods Today</h2>
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
                <span className="text-[10px] font-semibold text-slate-400">ETB 11,250</span>
                <span className="text-[11px] font-black text-slate-800 leading-none mt-0.5">Total</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              {PAYMENT_METHODS_DONUT.map((m) => (
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
                onClick={handleAddLine}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Create Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setPaidSuccess(true)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Collect Payment</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">View Patient Bills</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Payment History</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Print Receipt</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ReceptionistPageShell>
  );
}

