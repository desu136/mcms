import React, { useState } from 'react';
import {
  Package,
  Search,
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  History,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  EXACT_INVENTORY_ITEMS,
  RECENT_TRANSACTIONS,
  EXPIRY_MONITOR_ITEMS,
  InventoryItem,
  InventoryTransaction,
} from '../../components/lab/inventoryMockData';
import { LabPageShell } from '../../components/lab/LabPageShell';
import { LabStatCard } from '../../components/lab/LabStatCard';

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(EXACT_INVENTORY_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [addQty, setAddQty] = useState(10);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.catalogId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category.toUpperCase() === categoryFilter.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  const handleConfirmRestock = () => {
    if (!selectedItem) return;
    setItems(
      items.map((i) =>
        i.id === selectedItem.id
          ? {
              ...i,
              quantity: i.quantity + Number(addQty),
              status: i.quantity + Number(addQty) > 10 ? 'In Stock' : 'Low Stock',
            }
          : i
      )
    );
    setRestockModalOpen(false);
    setSelectedItem(null);
  };

  const bannerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
          Laboratory Inventory & Reagent Management
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Track chemical reagents, testing kits, lot numbers, cold-chain buffers, and expiry dates.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setSelectedItem(items[0] || null);
            setRestockModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Restock / Receive Shipment</span>
        </button>
      </div>
    </div>
  );

  const kpisContent = (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
      <LabStatCard title="Total Reagents" value="52" color="blue" />
      <LabStatCard title="Supplies & Consumables" value="138" color="cyan" />
      <LabStatCard title="Active Equipment" value="12" color="emerald" />
      <LabStatCard title="Low Stock Warning" value={items.filter((i) => i.status === 'Low Stock').length} color="amber" />
      <LabStatCard title="Expiring Soon (<30d)" value={EXPIRY_MONITOR_ITEMS.length} color="rose" />
    </div>
  );

  const rightPanelContent = (
    <div className="space-y-3.5">
      {/* Expiry Warning Monitor */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-wider text-[11px]">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Reagent Expiry Monitor</span>
          </div>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
            {EXPIRY_MONITOR_ITEMS.length} Lots
          </span>
        </div>

        <div className="space-y-2">
          {EXPIRY_MONITOR_ITEMS.map((exp) => (
            <div key={exp.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">{exp.name}</div>
                <div className="text-[10px] text-slate-400">Exp: {exp.expiryDate}</div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-extrabold text-[10px]">
                {exp.daysLeft} days
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Inventory Transactions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-xs">
        <div className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-wider text-[11px] mb-3">
          <History className="w-4 h-4 text-cyan-600" />
          <span>Audit Log Transactions</span>
        </div>

        <div className="space-y-2">
          {RECENT_TRANSACTIONS.map((tx: InventoryTransaction) => (
            <div key={tx.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="truncate">{tx.itemName}</span>
                <span className={`text-[10px] font-black ${tx.type === 'In' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {tx.type === 'In' ? '+' : '-'}{tx.quantity}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{tx.user}</span>
                <span>{tx.dateTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <LabPageShell banner={bannerContent} kpis={kpisContent} rightPanel={rightPanelContent}>
      {/* Search & Category Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search reagents, catalog ID, batch number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 font-bold text-[11px]">
          {['ALL', 'REAGENT', 'SUPPLY', 'EQUIPMENT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                categoryFilter === cat ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Catalog #</th>
                <th className="py-2.5 px-3">Batch / Lot</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{item.catalogId}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-700">{item.batchNo}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.category}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {item.quantity} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">{item.expiryDate}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'Low Stock'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setRestockModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-slate-800">Restock Item</h3>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Item</div>
                <div className="font-bold text-slate-800 text-sm">{selectedItem.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">Lot: {selectedItem.batchNo}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quantity to Add ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRestockModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestock}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
              >
                Confirm Addition
              </button>
            </div>
          </div>
        </div>
      )}
    </LabPageShell>
  );
}

export default InventoryPage;
