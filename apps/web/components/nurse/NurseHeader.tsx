'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Bell, Menu, LogOut, User, Settings, ChevronDown, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NurseHeaderProps {
  onOpenSearch: () => void;
  onOpenMobileSidebar: () => void;
}

function NurseHeader({
  onOpenSearch,
  onOpenMobileSidebar,
}: NurseHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const nurseName = user?.displayName || 'Nurse';
  const nurseRole = user?.staffProfile?.jobTitle || 'Registered Nurse';
  const initials = nurseName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

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

  // Click-outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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

        {/* Search bar */}
        <div
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-400 hover:bg-white text-slate-400 cursor-pointer transition-all duration-150 group shadow-2xs"
        >
          <Search className="w-4 h-4 text-teal-500 group-hover:text-teal-600 transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-slate-500 font-medium truncate flex-1">
            Search patients, tasks, or anything...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs shrink-0">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right: Notifications + User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-teal-50/80 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-teal-600" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
              4
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
                <span className="text-[11px] text-teal-600 font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="py-1 space-y-1">
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Critical Vital Alert</div>
                    <div className="text-[11px] text-slate-500">Bed 12 — SPO₂ dropped to 88%. Immediate attention needed.</div>
                    <div className="text-[10px] text-slate-400 mt-1">3 mins ago</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Medication Due</div>
                    <div className="text-[11px] text-slate-500">Aster Mulu — Amoxicillin 500mg due in 10 minutes.</div>
                    <div className="text-[10px] text-slate-400 mt-1">10 mins ago</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">New Task Assigned</div>
                    <div className="text-[11px] text-slate-500">Dr. Fitsum: Record post-op vitals for Room 4 patient.</div>
                    <div className="text-[10px] text-slate-400 mt-1">25 mins ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold text-sm flex items-center justify-center ring-2 ring-teal-500/20">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{nurseName}</div>
              <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">{nurseRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">{nurseName}</div>
                <div className="text-[11px] text-teal-600 font-medium">{nurseRole}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{user?.email || ''}</div>
              </div>
              <div className="py-1">
                <Link
                  href="/nurse/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> My Profile
                </Link>
                <Link
                  href="/nurse/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Settings
                </Link>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(NurseHeader);
