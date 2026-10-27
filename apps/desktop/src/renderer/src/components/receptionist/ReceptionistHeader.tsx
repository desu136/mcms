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
  Briefcase,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { CURRENT_RECEPTIONIST } from './receptionistMockData';

export interface ReceptionistHeaderProps {
  onOpenSearch?: (() => void) | undefined;
  onNavigateTab?: ((tab: string) => void) | undefined;
  onLogout?: (() => void) | undefined;
  syncReady?: boolean | undefined;
  isOnline?: boolean | undefined;
  isSyncing?: boolean | undefined;
  pendingSyncOps?: number | undefined;
  onTriggerSync?: (() => void) | undefined;
  currentWorkstation?: ('receptionist' | 'doctor') | undefined;
  onSwitchWorkstation?: ((w: 'receptionist' | 'doctor') => void) | undefined;
}

export function ReceptionistHeader({
  onOpenSearch,
  onNavigateTab,
  onLogout,
  syncReady = true,
  isOnline = true,
  isSyncing = false,
  pendingSyncOps = 0,
  onTriggerSync,
  currentWorkstation = 'receptionist',
  onSwitchWorkstation,
}: ReceptionistHeaderProps) {
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
    <header className="sticky top-0 z-20 h-12 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-5 flex items-center justify-between gap-3 shadow-2xs shrink-0 select-none">
      {/* Left: Global Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-slate-400 hover:text-slate-600 cursor-pointer transition-all shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 truncate flex-1 font-normal">
            Search patients, appointments, queue, or bills...
          </span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Sync status, Clinic badge, Workstation switch, Notifs & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Offline / Online Sync Status Pill */}
        <div className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500" title="Offline" />
            )}
            <span className="text-[11px] font-bold text-slate-700 hidden md:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {pendingSyncOps > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 ml-1">
              {pendingSyncOps} pending
            </span>
          )}

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            type="button"
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-all cursor-pointer disabled:opacity-50 ml-1"
            title="Sync with Clinic Central Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Workstation Switcher */}
        {onSwitchWorkstation && (
          <div className="hidden lg:flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => onSwitchWorkstation('receptionist')}
              type="button"
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
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
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                currentWorkstation === 'doctor'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Doctor
            </button>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            type="button"
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900">Notifications</span>
                <span className="text-[10px] font-bold text-blue-600">3 new</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100/60">
                  <div className="font-bold text-blue-900">New Walk-in Check-in</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    Aster Mulu added to Dr. Tadesse queue.
                  </div>
                  <div className="text-[9px] text-blue-400 mt-1">2 mins ago</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-colors">
                  <div className="font-bold text-slate-800">Payment Confirmed</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    ETB 1,420 settled by Telebirr.
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">10 mins ago</div>
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
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
              {CURRENT_RECEPTIONIST.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left pr-0.5">
              <div className="text-xs font-black text-slate-800 leading-tight">
                {CURRENT_RECEPTIONIST.name}
              </div>
              <div className="text-[10px] font-medium text-slate-500 leading-none">
                {CURRENT_RECEPTIONIST.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-black text-slate-900">{CURRENT_RECEPTIONIST.name}</div>
                <div className="text-[11px] text-slate-500">{CURRENT_RECEPTIONIST.role}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigateTab?.('settings');
                  }}
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Workstation Settings
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(ReceptionistHeader);
