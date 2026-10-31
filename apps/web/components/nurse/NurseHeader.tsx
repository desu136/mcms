'use client';

import React, { useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { CURRENT_NURSE } from './nurseMockData';

interface NurseHeaderProps {
  onOpenSearch: () => void;
  onOpenMobileSidebar: () => void;
}

function NurseHeader({
  onOpenSearch,
  onOpenMobileSidebar,
}: NurseHeaderProps) {
  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger + Global Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar matching design */}
        <div
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white text-slate-400 cursor-pointer transition-all duration-150 group shadow-2xs"
        >
          <Search className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-slate-500 font-medium truncate flex-1">
            Search patients, appointments, or anything...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs shrink-0">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right: Notifications + User Profile */}
      <div className="flex items-center gap-3.5 shrink-0">
        {/* Notifications Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-blue-600" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
            {CURRENT_NURSE.unreadNotifications}
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CURRENT_NURSE.avatar}
              alt={CURRENT_NURSE.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {CURRENT_NURSE.name}
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              {CURRENT_NURSE.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(NurseHeader);
