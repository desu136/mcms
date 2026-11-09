import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Database,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export interface DoctorHeaderProps {
  onOpenSearch?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
  syncReady?: boolean;
  onSwitchWorkstation?: ((w: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'lab') => void) | undefined;
}

export function DoctorHeader({
  onOpenSearch,
  onNavigateTab,
  onLogout,
  syncReady = true,
  onSwitchWorkstation,
}: DoctorHeaderProps) {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || user?.email || 'Doctor';
  const roleName = user?.role || 'DOCTOR';
  const email = user?.email || '';
  const initials = displayName
    .replace(/^Dr\.\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'DR';

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
      {/* Left: Quick Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:border-blue-400 hover:text-slate-600 transition-all text-xs cursor-pointer group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span className="flex-1 text-left">Search patient, PID, records...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Offline / Online Sync Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <Database className={`w-3.5 h-3.5 ${syncReady ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
          <span className="text-[11px] font-medium text-slate-600">
            {syncReady ? 'Local DB Online' : 'Syncing changes...'}
          </span>
        </div>

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
              className="px-2.5 py-1 rounded-lg bg-white text-blue-600 shadow-xs cursor-default font-bold"
            >
              Doctor
            </button>
            <button
              onClick={() => onSwitchWorkstation('nurse')}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Nurse
            </button>
            <button
              onClick={() => onSwitchWorkstation('receptionist')}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Receptionist
            </button>
            <button
              onClick={() => onSwitchWorkstation('lab')}
              type="button"
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            >
              Lab
            </button>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
              </div>
              <div className="py-6 text-center text-xs text-slate-400">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Doctor User Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/30">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 leading-none">
                {roleName}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">{displayName}</div>
                <div className="text-[11px] text-blue-600 font-medium">{roleName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{email}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigateTab?.('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Doctor Profile
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigateTab?.('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onLogout) onLogout();
                    else logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
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
