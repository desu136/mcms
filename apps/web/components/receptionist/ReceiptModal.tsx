'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';

export interface ReceiptPrintData {
  receiptNumber: string;
  patientName: string;
  patientPid: string;
  departmentName?: string;
  doctorName?: string;
  paymentMethod: string;
  dateTime: string;
  lineItems: Array<{
    item: string;
    category?: string | undefined;
    qty: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string | undefined;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptPrintData | null;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  receipt,
}: ReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Receipt</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket Body (Thermal Style) */}
        <div className="p-6 text-center" id="printable-receipt">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2 font-black text-xl">
            MCMS
          </div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Official Clinic Receipt</div>
          <div className="text-sm font-black text-slate-800 mt-0.5">Medical Center</div>

          <div className="my-4 py-3 border-y-2 border-dashed border-slate-200 bg-slate-50/80 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receipt No</div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight my-0.5">{receipt.receiptNumber}</div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
              Paid via {receipt.paymentMethod}
            </div>
          </div>

          <div className="space-y-1.5 text-left text-xs bg-white p-3 rounded-xl border border-slate-100 mb-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Patient:</span>
              <span className="font-bold text-slate-800 text-right">{receipt.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">PID:</span>
              <span className="font-mono font-bold text-blue-600 text-right">{receipt.patientPid}</span>
            </div>
            {receipt.departmentName && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Department:</span>
                <span className="font-semibold text-slate-700 text-right">{receipt.departmentName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Date &amp; Time:</span>
              <span className="font-semibold text-slate-600 text-right">{receipt.dateTime}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border border-slate-100 rounded-xl p-2.5 text-xs text-left space-y-1.5 mb-3 bg-slate-50/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
              Charges Breakdown
            </div>
            {receipt.lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="text-slate-700">
                  {item.item} {item.qty > 1 ? `x${item.qty}` : ''}
                </span>
                <span className="font-semibold text-slate-900">ETB {item.total.toFixed(2)}</span>
              </div>
            ))}
            {receipt.discountAmount > 0 && (
              <div className="flex justify-between text-[11px] text-emerald-600 font-medium pt-1 border-t border-slate-100">
                <span>Discount</span>
                <span>-ETB {receipt.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-emerald-600 text-sm">ETB {receipt.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 italic">
            Thank you for choosing our healthcare facility. Please retain this receipt.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

