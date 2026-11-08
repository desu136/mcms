import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export interface NurseHeaderProps {
  onOpenSearch?: (() => void) | undefined;
  onNavigateTab?: ((tab: string) => void) | undefined;
  onLogout?: (() => void) | undefined;
  syncReady?: boolean | undefined;
  isOnline?: boolean | undefined;
  isSyncing?: boolean | undefined;
  pendingSyncOps?: number | undefined;
  onTriggerSync?: (() => void) | undefined;
  currentWorkstation?: ('admin' | 'receptionist' | 'doctor' | 'nurse') | undefined;
  onSwitchWorkstation?: ((w: 'admin' | 'receptionist' | 'doctor' | 'nurse') => void) | undefined;
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
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || user?.email || 'Nurse';
  const roleName = user?.role || 'NURSE';
  const email = user?.email || '';
  const ward = user?.staffProfile?.department || 'Inpatient & Triage';
  const initials = displayName
    .replace(/^Sister\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'NR';

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors text-xs cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
          <span className="flex-1 text-left">Search patient, PID, triage...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded text-slate-400 font-mono shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Workstation Switcher */}
        {onSwitchWorkstation && (
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => onSwitchWorkstation('admin')}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Admin
            </button>
            <button
              onClick={() => onSwitchWorkstation('doctor')}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Doctor
            </button>
            <button
              onClick={() => onSwitchWorkstation('nurse')}
              className="px-2.5 py-1 rounded-lg bg-white text-emerald-600 shadow-xs cursor-default font-bold"
            >
              Nurse
            </button>
            <button
              onClick={() => onSwitchWorkstation('receptionist')}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Receptionist
            </button>
          </div>
        )}

        {/* Sync Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <Database className={`w-3.5 h-3.5 ${syncReady ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
          <span className="text-[11px] font-medium text-slate-600">
            {syncReady ? 'Local DB Online' : 'Syncing changes...'}
          </span>
          {onTriggerSync && (
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
              title="Force sync"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            type="button"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">Notifications</span>
              </div>
              <div className="py-6 text-center text-xs text-slate-400">
                No new notifications
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
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-1 ring-emerald-500/30">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                {roleName}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">{displayName}</div>
                <div className="text-[11px] text-slate-400 truncate">{email}</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{ward}</div>
              </div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigateTab?.('profile');
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                My Profile
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigateTab?.('settings');
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Settings
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  if (onLogout) onLogout();
                  else logout();
                }}
                className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
