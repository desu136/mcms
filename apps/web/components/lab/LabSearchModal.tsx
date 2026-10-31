'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, FlaskConical, ArrowRight } from 'lucide-react';
import { EXACT_SCREENSHOT_ORDERS, LabTestOrderItem } from './labMockData';

interface LabSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (order: LabTestOrderItem) => void;
}

export default function LabSearchModal({
  isOpen,
  onClose,
  onSelectOrder,
}: LabSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredOrders: LabTestOrderItem[] = EXACT_SCREENSHOT_ORDERS.filter(
    (o: LabTestOrderItem) =>
      o.patientName.toLowerCase().includes(query.toLowerCase()) ||
      o.orderId.toLowerCase().includes(query.toLowerCase()) ||
      o.testName.toLowerCase().includes(query.toLowerCase()) ||
      o.sampleId.toLowerCase().includes(query.toLowerCase()) ||
      o.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search test orders, patient name, sample ID, department..."
            className="flex-1 px-3 py-1.5 text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching orders or samples found
            </div>
          ) : (
            filteredOrders.map((ord: LabTestOrderItem) => (
              <div
                key={ord.id}
                onClick={() => {
                  if (onSelectOrder) onSelectOrder(ord);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50/60 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {ord.patientName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {ord.patientRoom}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {ord.orderId}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-700">{ord.testName}</span>
                      <span>•</span>
                      <span>{ord.department}</span>
                      <span>•</span>
                      <span>{ord.sampleId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      ord.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : ord.status === 'Processing'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {ord.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

