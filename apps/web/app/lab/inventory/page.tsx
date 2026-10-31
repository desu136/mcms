'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  X,
  Check,
  ScanLine,
  FlaskConical,
  Zap,
  Info,
  CalendarDays,
  FileBarChart2,
  Boxes,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import LabStatCard from '../../../components/lab/LabStatCard';
import {
  InventoryItem,
  INVENTORY_KPI_STATS,
  EXACT_INVENTORY_ITEMS,
  INVENTORY_ALERTS,
  RECENT_TRANSACTIONS,
  STOCK_LEVELS,
  EXPIRY_MONITOR_ITEMS,
} from '../../../components/lab/inventoryMockData';

export default function LabInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(EXACT_INVENTORY_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [calendarDate, setCalendarDate] = useState('Oct 19, 2026');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered inventory items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      // Department filter
      if (selectedDepartment !== 'All' && item.department !== selectedDepartment) return false;
      // Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.catalogId.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [items, selectedCategory, selectedDepartment, selectedStatus, searchQuery]);

  const handleToggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRowIds.length === filteredItems.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredItems.map((item) => item.id));
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            Low Stock
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            Out of Stock
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4 bg-[#F4F7FB]">
      {/* 1. Page Header matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle with Package Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <Package className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Inventory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage reagents, supplies, and laboratory equipment.
            </p>
          </div>
        </div>

        {/* Date Selector & + Add Inventory Item */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">{calendarDate}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Tuesday</div>
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
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Stat Cards - Compact & displayed at one row without icons */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
        <LabStatCard
          title="Total Reagents"
          value={INVENTORY_KPI_STATS.totalReagents.value}
          color="cyan"
          change={INVENTORY_KPI_STATS.totalReagents}
        />
        <LabStatCard
          title="Total Supplies"
          value={INVENTORY_KPI_STATS.totalSupplies.value}
          color="cyan"
          change={INVENTORY_KPI_STATS.totalSupplies}
        />
        <LabStatCard
          title="Total Equipment"
          value={INVENTORY_KPI_STATS.totalEquipment.value}
          color="blue"
          change={INVENTORY_KPI_STATS.totalEquipment}
        />
        <LabStatCard
          title="Low Stock Items"
          value={INVENTORY_KPI_STATS.lowStockItems.value}
          color="rose"
          change={INVENTORY_KPI_STATS.lowStockItems}
        />
        <LabStatCard
          title="Expiring Soon (≤ 7 days)"
          value={INVENTORY_KPI_STATS.expiringSoon.value}
          color="purple"
          change={INVENTORY_KPI_STATS.expiringSoon}
        />
      </div>

      {/* 3. Upper Main Section: Table (Left) + Alerts & Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Inventory Items Table Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Inventory Items</h2>
            </div>
          </div>

          {/* Filters Bar inside card */}
          <div className="p-3.5 border-b border-slate-100 flex flex-col md:flex-row items-center gap-3 bg-slate-50/40">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name, catalog ID, or batch number..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Reagent">Reagents</option>
                <option value="Supply">Supplies</option>
                <option value="Equipment">Equipment</option>
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Immunology">Immunology</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDepartment('All');
                  setSelectedStatus('All');
                  setSearchQuery('');
                  showToast('Inventory filters reset.');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl transition cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>
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
                      checked={selectedRowIds.length === filteredItems.length && filteredItems.length > 0}
                      onChange={handleSelectAllRows}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Catalog ID</th>
                  <th className="py-3 px-3">Batch No.</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.map((item) => {
                  const isChecked = selectedRowIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4" onClick={(e) => handleToggleSelectRow(e, item.id)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {item.catalogId}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {item.batchNo}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            item.quantity === 0
                              ? 'text-rose-600'
                              : item.status === 'Low Stock'
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {item.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {item.expiryDate}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => showToast(`Actions for ${item.name}`)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer matching screenshot */}
          <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">1-10</span> of{' '}
              <span className="font-semibold text-slate-700">52</span> items
            </div>

            {/* Pagination Controls */}
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
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                2
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                3
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                4
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-xs transition">
                5
              </button>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                title="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Items Per Page */}
            <div className="flex items-center gap-2">
              <select className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>items per page:</span>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory Alerts & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Inventory Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Inventory Alerts</span>
              </div>
              <button
                onClick={() => showToast('Opening all inventory alerts...')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="pt-3.5 space-y-3">
              {INVENTORY_ALERTS.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        alert.badgeType === 'red'
                          ? 'bg-rose-500'
                          : alert.badgeType === 'amber'
                          ? 'bg-amber-500'
                          : 'bg-orange-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">{alert.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        {alert.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      alert.badgeType === 'red'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                        : alert.badgeType === 'amber'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                        : 'bg-orange-50 text-orange-700 border border-orange-200/80'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Quick Actions</span>
            </div>

            <div className="pt-3.5 grid grid-cols-2 gap-2.5">
              {/* 1. Add Reagent */}
              <button
                onClick={() => {
                  setIsAddItemModalOpen(true);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Add Reagent</span>
              </button>

              {/* 2. Add Supply */}
              <button
                onClick={() => {
                  setIsAddItemModalOpen(true);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Add Supply</span>
              </button>

              {/* 3. Add Equipment */}
              <button
                onClick={() => {
                  setIsAddItemModalOpen(true);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Add Equipment</span>
              </button>

              {/* 4. Scan Barcode */}
              <button
                onClick={() => showToast('Opening barcode scanner tool...')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ScanLine className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Scan Barcode</span>
              </button>

              {/* 5. Print Labels */}
              <button
                onClick={() => showToast('Generating print labels for inventory...')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Print Labels</span>
              </button>

              {/* 6. View Reports */}
              <button
                onClick={() => showToast('Redirecting to inventory stock reports...')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 transition group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileBarChart2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Section: 3 Cards Grid matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Card 1: Recent Inventory Transactions (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Recent Inventory Transactions</span>
            </div>
            <button
              onClick={() => showToast('Opening all inventory transactions...')}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="pt-3 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-2">Date & Time</th>
                  <th className="pb-2">Item Name</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {RECENT_TRANSACTIONS.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 whitespace-nowrap text-slate-500 font-medium">
                      {txn.dateTime}
                    </td>
                    <td className="py-2.5 whitespace-nowrap font-bold text-slate-800">
                      {txn.itemName}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      {txn.type === 'In' ? (
                        <span className="font-bold text-emerald-600">In</span>
                      ) : (
                        <span className="font-bold text-rose-500">Out</span>
                      )}
                    </td>
                    <td className="py-2.5 whitespace-nowrap font-semibold text-slate-700">
                      {txn.quantity}
                    </td>
                    <td className="py-2.5 whitespace-nowrap text-slate-600 font-medium">
                      {txn.user}
                    </td>
                    <td className="py-2.5 whitespace-nowrap text-slate-500">
                      {txn.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Stock Levels (Top 5) (3.5 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Stock Levels (Top 5)</span>
            </div>
            <button
              onClick={() => showToast('Opening detailed stock analytics...')}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          {/* Subheader Legend */}
          <div className="pt-3 flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>In Stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Low Stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Out of Stock</span>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="pt-4 space-y-3.5 text-xs">
            {STOCK_LEVELS.map((stock) => (
              <div key={stock.name} className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
                  <span>{stock.name}</span>
                  <span className="font-bold text-slate-800">{stock.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stock.status === 'in-stock'
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : stock.status === 'low-stock'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(stock.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Expiry Monitor (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Expiry Monitor</span>
              </div>
              <button
                onClick={() => showToast('Opening expiry calendar...')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="pt-3 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-2">Item Name</th>
                    <th className="pb-2">Expiry Date</th>
                    <th className="pb-2">Days Left</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {EXPIRY_MONITOR_ITEMS.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 font-bold text-slate-800 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-2 text-slate-500 whitespace-nowrap">
                        {item.expiryDate}
                      </td>
                      <td className="py-2 text-slate-600 font-semibold whitespace-nowrap">
                        {item.daysLeft}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        {item.status === 'Expiring Soon' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            Expiring Soon
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info note at bottom */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-[11px] text-blue-800 font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Keep your inventory updated to ensure accurate test results and smooth operations.
            </span>
          </div>
        </div>
      </div>

      {/* Add Inventory Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Add New Inventory Item</h3>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddItemModalOpen(false);
                showToast('New inventory item added successfully.');
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBC Reagent"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="Reagent">Reagent</option>
                    <option value="Supply">Supply</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Catalog ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RGT-005"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    defaultValue="Pack"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
                >
                  Save Item
                </button>
              </div>
            </form>
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
    </div>
  );
}

