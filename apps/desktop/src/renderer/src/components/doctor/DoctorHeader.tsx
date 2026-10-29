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
} from 'lucide-react';
import { CURRENT_DOCTOR } from './doctorMockData';

export interface DoctorHeaderProps {
  onOpenSearch?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
  syncReady?: boolean;
  onSwitchWorkstation?: ((w: 'receptionist' | 'doctor' | 'nurse') => void) | undefined;
}

export function DoctorHeader({
  onOpenSearch,
  onNavigateTab,
  onLogout,
  syncReady = true,
  onSwitchWorkstation,
}: DoctorHeaderProps) {
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
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-slate-400 hover:text-slate-600 cursor-pointer transition-all shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 truncate flex-1 font-normal">
            Search patients, appointments, or anything...
          </span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right: Date, SQLite Sync Status, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Date pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Oct 19, 2026</span>
        </div>

        {/* SQLite Local Status Pill */}
        <div
          onClick={() => onNavigateTab?.('settings')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-100/60 transition-colors"
          title="Local SQLite database active and synchronized"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">{syncReady ? 'SQLite Active' : 'Connecting...'}</span>
          <Database className="w-3 h-3 text-emerald-600 sm:hidden" />
        </div>

        {/* Workstation Switcher */}
        {onSwitchWorkstation && (
          <div className="hidden lg:flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => onSwitchWorkstation('receptionist')}
              type="button"
              className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            >
              Reception
            </button>
            <button
              onClick={() => onSwitchWorkstation('doctor')}
              type="button"
              className="px-2 py-1 rounded-lg bg-blue-600 text-white shadow-2xs transition-all cursor-pointer"
            >
              Doctor
            </button>
            <button
              onClick={() => onSwitchWorkstation('nurse')}
              type="button"
              className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            >
              Nurse
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
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="py-1 space-y-1">
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Lab Results Ready</div>
                    <div className="text-[11px] text-slate-500">
                      Aster Mulu&apos;s Cardiac Panel results have been verified.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">10 mins ago</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">New Consultation Added</div>
                    <div className="text-[11px] text-slate-500">
                      Samuel Girma scheduled for 01:00 PM today.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">25 mins ago</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Prescription Refill Request</div>
                    <div className="text-[11px] text-slate-500">
                      Central Pharmacy requested verification for Lidya Kebede.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">1 hr ago</div>
                  </div>
                </div>
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
            <img
              src={CURRENT_DOCTOR.avatar}
              alt={CURRENT_DOCTOR.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                {CURRENT_DOCTOR.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-none">
                {CURRENT_DOCTOR.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">{CURRENT_DOCTOR.name}</div>
                <div className="text-[11px] text-blue-600 font-medium">{CURRENT_DOCTOR.role}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">doctor@mcms.local</div>
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
                  Account & Sync Settings
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
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
export default DoctorHeader;
