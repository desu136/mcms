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
  AlertTriangle,
  FlaskConical,
  TestTube2,
  CheckCircle2,
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
  isOnline = true,
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
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Quick Search Input Trigger */}
      <div className="flex-1 max-w-md">
        <div
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl cursor-pointer transition-colors group"
        >
          <span className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-slate-600">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
            <span>Search tests, specimens, barcodes, reagents, patients...</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Database sync, Workstation switcher, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync / Database Badge */}
        <div
          onClick={onTriggerSync}
          title="Local SQLite database cache is active and synchronized"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-200/70 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">{syncReady ? 'SQLite Active' : 'Connecting...'}</span>
          <Database className="w-3 h-3 text-emerald-600 sm:hidden" />
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
          <div className="hidden lg:flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
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
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lab
            </button>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            type="button"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Lab Alerts & Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
              {LABORATORY_ALERTS.reduce((acc, a) => acc + (a.count > 0 ? 1 : 0), 0) || 4}
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                  Laboratory Alerts
                </span>
                <span
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-cyan-600 font-semibold cursor-pointer hover:underline"
                >
                  Dismiss
                </span>
              </div>
              <div className="p-2 space-y-2 max-h-72 overflow-y-auto">
                {LABORATORY_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setNotificationsOpen(false);
                      if (alert.severity === 'critical') onNavigateTab?.('results');
                      else if (alert.severity === 'warning') onNavigateTab?.('tests');
                      else if (alert.severity === 'maintenance') onNavigateTab?.('settings');
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      alert.severity === 'critical'
                        ? 'bg-rose-50/80 border-rose-100 hover:bg-rose-100/70 text-rose-900'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50/80 border-amber-100 hover:bg-amber-100/70 text-amber-900'
                        : 'bg-blue-50/80 border-blue-100 hover:bg-blue-100/70 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>{alert.title}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white shadow-2xs">
                        {alert.count}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-80 mt-1">{alert.description}</div>
                  </div>
                ))}
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
              src={CURRENT_LAB_TECH.avatar}
              alt={CURRENT_LAB_TECH.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/30"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {CURRENT_LAB_TECH.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                {CURRENT_LAB_TECH.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">{CURRENT_LAB_TECH.name}</div>
                <div className="text-[11px] text-slate-400 truncate">lab@mcms.local</div>
                <div className="text-[10px] text-cyan-600 font-semibold mt-0.5">Clinical Pathology Lab</div>
              </div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigateTab?.('profile');
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile & Credentials</span>
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigateTab?.('settings');
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Analyzer Calibration & QC</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onLogout?.();
                }}
                className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold cursor-pointer"
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

export default LabHeader;
