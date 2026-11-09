import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FlaskConical,
  TestTube2,
  CalendarCheck2,
  Users,
  Package,
  ArrowRight,
} from 'lucide-react';
import { EXACT_SCREENSHOT_ORDERS } from './labMockData';
import { EXACT_SAMPLE_ROWS, SampleItem } from './sampleMockData';
import { EXACT_INVENTORY_ITEMS, InventoryItem } from './inventoryMockData';

export interface LabSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectOrder?: (orderId: string) => void;
  onSelectSample?: (sampleId: string) => void;
}

export function LabSearchModal({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectOrder,
  onSelectSample,
}: LabSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigateTab?.('dashboard'); // trigger open from parent
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigateTab]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredOrders = q
    ? EXACT_SCREENSHOT_ORDERS.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.patientName.toLowerCase().includes(q) ||
          o.testName.toLowerCase().includes(q) ||
          o.patientId.toLowerCase().includes(q)
      )
    : EXACT_SCREENSHOT_ORDERS.slice(0, 3);

  const filteredSamples = q
    ? EXACT_SAMPLE_ROWS.filter(
        (s: SampleItem) =>
          s.sampleId.toLowerCase().includes(q) ||
          s.patientName.toLowerCase().includes(q) ||
          s.testCode.toLowerCase().includes(q) ||
          s.testName.toLowerCase().includes(q)
      )
    : EXACT_SAMPLE_ROWS.slice(0, 3);

  const filteredReagents = q
    ? EXACT_INVENTORY_ITEMS.filter(
        (r: InventoryItem) =>
          r.name.toLowerCase().includes(q) ||
          r.catalogId.toLowerCase().includes(q) ||
          (r.department && r.department.toLowerCase().includes(q))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <Search className="w-5 h-5 text-cyan-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search lab orders, barcode numbers, patient names, tests, reagents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={onClose}
            className="px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-200"
          >
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Navigations */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2">
              Workstation Navigation
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Lab Tests', tab: 'tests', icon: FlaskConical, color: 'text-blue-600 bg-blue-50' },
                { label: 'Samples', tab: 'samples', icon: TestTube2, color: 'text-cyan-600 bg-cyan-50' },
                { label: 'Results', tab: 'results', icon: CalendarCheck2, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Inventory', tab: 'inventory', icon: Package, color: 'text-amber-600 bg-amber-50' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      onNavigateTab(item.tab);
                      onClose();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition text-left cursor-pointer group"
                  >
                    <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Orders Section */}
          {filteredOrders.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                Lab Test Orders
              </div>
              <div className="space-y-1.5">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onSelectOrder?.(ord.id);
                      onNavigateTab('tests');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <span className="truncate">{ord.testName}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{ord.orderId}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {ord.patientName} ({ord.patientId}) • {ord.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ord.status === 'Processing'
                            ? 'bg-blue-50 text-blue-700'
                            : ord.status === 'Abnormal'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Samples Section */}
          {filteredSamples.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                Specimens & Barcodes
              </div>
              <div className="space-y-1.5">
                {filteredSamples.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectSample?.(s.id);
                      onNavigateTab('samples');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                        <TestTube2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <span className="truncate">{s.sampleId}</span>
                          <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded">
                            {s.testCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {s.patientName} • {s.testName} ({s.sampleType})
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reagents Section */}
          {filteredReagents.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                Inventory Reagents
              </div>
              <div className="space-y-1.5">
                {filteredReagents.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onNavigateTab('inventory');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{r.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Cat #{r.catalogId} • Stock: {r.quantity} {r.unit}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LabSearchModal;
