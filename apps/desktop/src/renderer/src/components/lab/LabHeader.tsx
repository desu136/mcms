import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  AlertTriangle,
  Clock,
  Database,
  RefreshCw,
  User,
  Settings,
} from 'lucide-react';
import { CURRENT_LAB_TECH, LABORATORY_ALERTS } from './labMockData';

export interface LabHeaderProps {
  onOpenSearch?: (() => void) | undefined;
  onNavigateTab?: ((tab: string) => void) | undefined;
  onLogout?: (() => void) | undefined;
  syncReady?: boolean | undefined;
  isOnline?: boolean | undefined;
  isSyncing?: boolean | undefined;
  pendingSyncOps?: number | undefined;
  onTriggerSync?: (() => void) | undefined;
  currentWorkstation?: ('admin' | 'receptionist' | 'doctor' | 'nurse' | 'lab') | undefined;
  onSwitchWorkstation?: ((w: 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'lab') => void) | undefined;
}

export function LabHeader({
  onOpenSearch,
  onNavigateTab,
  onLogout,
  syncReady = true,
  isOnline: _isOnline = true,
  isSyncing = false,
  pendingSyncOps = 0,
  onTriggerSync,
  currentWorkstation = 'lab',
  onSwitchWorkstation,
}: LabHeaderProps) {
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
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-2xs select-none">
      {/* Left: Global Search Bar (Matching Web style) */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-400 hover:text-slate-600 cursor-pointer transition-all shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 truncate flex-1 font-normal">
            Search test orders, patients, or sample IDs...
          </span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right: Desktop Controls, Workstation Switcher, Notifications & User profile pill */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Offline SQLite Status Pill */}
        <div
          onClick={onTriggerSync}
          title="Local SQLite database cache is active and synchronized"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200/80 text-xs font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">{syncReady ? 'SQLite Active' : 'Connecting...'}</span>
          <Database className="w-3.5 h-3.5 text-emerald-600 sm:hidden" />
          {pendingSyncOps > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold">
              {pendingSyncOps}
            </span>
          )}
          {onTriggerSync && (
            <RefreshCw
              className={`w-3 h-3 text-slate-400 hover:text-slate-700 ml-0.5 ${
                isSyncing ? 'animate-spin text-blue-600' : ''
              }`}
            />
          )}
        </div>

        {/* Workstation Switcher */}
        {onSwitchWorkstation && (
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => onSwitchWorkstation('admin')}
              type="button"
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                currentWorkstation === 'admin'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
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
            <button
              onClick={() => onSwitchWorkstation('nurse')}
              type="button"
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                currentWorkstation === 'nurse'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nurse
            </button>
            <button
              onClick={() => onSwitchWorkstation('lab')}
              type="button"
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                currentWorkstation === 'lab'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lab
            </button>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
              {CURRENT_LAB_TECH.unreadNotifications}
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Laboratory Alerts
                </span>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {LABORATORY_ALERTS.length} Alerts
                </span>
              </div>
              <div className="py-1 divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {LABORATORY_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setNotificationsOpen(false);
                      if (alert.severity === 'critical') onNavigateTab?.('results');
                      else onNavigateTab?.('tests');
                    }}
                    className="p-2.5 hover:bg-slate-50 rounded-xl transition flex gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 text-rose-500'
                          : alert.severity === 'warning'
                          ? 'bg-amber-50 text-amber-500'
                          : 'bg-blue-50 text-blue-500'
                      }`}
                    >
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">{alert.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{alert.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill Dropdown (Avatar + Name + Role + Down Chevron) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <img
              src={CURRENT_LAB_TECH.avatar}
              alt={CURRENT_LAB_TECH.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight tracking-tight">
                {CURRENT_LAB_TECH.name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-tight">
                {CURRENT_LAB_TECH.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">{CURRENT_LAB_TECH.name}</div>
                <div className="text-[11px] text-slate-400">{CURRENT_LAB_TECH.role}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigateTab?.('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigateTab?.('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings & QC
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
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

export default LabHeader;
