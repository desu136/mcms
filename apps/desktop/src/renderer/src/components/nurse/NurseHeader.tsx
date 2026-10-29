import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Clock,
  HeartPulse,
  Pill,
} from 'lucide-react';
import { CURRENT_NURSE } from './nurseMockData';

export interface NurseHeaderProps {
  onOpenSearch?: (() => void) | undefined;
  onNavigateTab?: ((tab: string) => void) | undefined;
  onLogout?: (() => void) | undefined;
  syncReady?: boolean | undefined;
  isOnline?: boolean | undefined;
  isSyncing?: boolean | undefined;
  pendingSyncOps?: number | undefined;
  onTriggerSync?: (() => void) | undefined;
  currentWorkstation?: ('receptionist' | 'doctor' | 'nurse') | undefined;
  onSwitchWorkstation?: ((w: 'receptionist' | 'doctor' | 'nurse') => void) | undefined;
}

export function NurseHeader({
  onOpenSearch,
  onNavigateTab,
  onLogout,
  syncReady = true,
  isOnline = true,
  isSyncing = false,
  pendingSyncOps = 0,
  onTriggerSync,
  currentWorkstation = 'nurse',
  onSwitchWorkstation,
}: NurseHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Quick Search Input Trigger */}
      <div className="flex-1 max-w-md">
        <div
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl cursor-pointer transition-colors group"
        >
          <span className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-slate-600">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Search patients, vitals, beds, medications...</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right: Date, SQLite Sync Status, Workstation Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Date Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Oct 19, 2026</span>
        </div>

        {/* Local SQLite Sync Status */}
        <div
          onClick={onTriggerSync}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-100/60 transition-colors"
          title="Local SQLite database active and synchronized"
        >
          <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="hidden sm:inline text-[11px]">
            {isSyncing ? 'Syncing...' : syncReady ? 'SQLite Active' : 'Offline'}
          </span>
          <Database className="w-3 h-3 text-emerald-600 sm:hidden" />
          {pendingSyncOps > 0 && (
            <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {pendingSyncOps}
            </span>
          )}
        </div>

        {/* Workstation Switcher */}
        {onSwitchWorkstation && (
          <div className="hidden lg:flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => onSwitchWorkstation('receptionist')}
              type="button"
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                currentWorkstation === 'receptionist'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reception
            </button>
            <button
              onClick={() => onSwitchWorkstation('doctor')}
              type="button"
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                currentWorkstation === 'doctor'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => onSwitchWorkstation('nurse')}
              type="button"
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                currentWorkstation === 'nurse'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nurse
            </button>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            type="button"
            className="relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Ward Notifications</span>
                <span className="text-[10px] font-bold text-blue-600">3 new</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100/60">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
                    <span>Vitals Due · Room 302</span>
                  </div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    Samuel Girma Q4 vital signs observation due now.
                  </div>
                  <div className="text-[9px] text-blue-400 mt-1">2 mins ago</div>
                </div>

                <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-100/60">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <Pill className="w-3.5 h-3.5 text-purple-600" />
                    <span>Medication Administration</span>
                  </div>
                  <div className="text-[11px] text-purple-700 mt-0.5">
                    Aster Mulu — Ceftriaxone 1g IV scheduled for 10:00 AM.
                  </div>
                  <div className="text-[9px] text-purple-400 mt-1">15 mins ago</div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100/60">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lab Results Posted</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Complete Blood Count for Bed 04 verified by Laboratory.
                  </div>
                  <div className="text-[9px] text-emerald-400 mt-1">40 mins ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            type="button"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <img
              src={CURRENT_NURSE.avatar}
              alt={CURRENT_NURSE.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/30"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {CURRENT_NURSE.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                {CURRENT_NURSE.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">{CURRENT_NURSE.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{CURRENT_NURSE.email}</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{CURRENT_NURSE.ward}</div>
              </div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigateTab?.('profile');
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigateTab?.('settings');
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Station Settings</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onLogout?.();
                }}
                className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(NurseHeader);
