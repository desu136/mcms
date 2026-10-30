import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  RefreshCw,
  Building2,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useSync } from '../../context/SyncContext';

export interface AdminHeaderProps {
  onOpenSearch?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
  currentWorkstation?: 'admin' | 'doctor' | 'nurse' | 'receptionist';
  onSwitchWorkstation?: ((w: 'admin' | 'doctor' | 'nurse' | 'receptionist') => void) | undefined;
}

export function AdminHeader({
  onOpenSearch,
  onNavigateTab,
  onLogout,
  currentWorkstation = 'admin',
  onSwitchWorkstation,
}: AdminHeaderProps) {
  const { user } = useAuth();
  const { isOnline, isSyncing, syncStatus, triggerSync } = useSync();
  const pendingSyncOps = syncStatus.pendingOperations;
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tenantName = (user as any)?.tenant?.name ?? 'Main Hospital Network';
  const branchName = (user as any)?.branches?.find((b: any) => b.isPrimary)?.name ?? (user as any)?.branches?.[0]?.name ?? 'Main Branch';
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Clinic Administrator';
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'AD' : 'AD';

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between gap-3 shadow-2xs shrink-0 select-none">
      {/* Left: Organization & Branch Context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-bold truncate max-w-[180px]">{tenantName}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium truncate max-w-[140px]">{branchName}</span>
        </div>
      </div>

      {/* Center: Search trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-slate-400 hover:text-slate-600 transition-all text-xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search doctors, departments, patients, appointments...</span>
        </button>
      </div>

      {/* Right: Controls & Workstation Switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Sync Pill */}
        <div className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}
            title={isOnline ? 'Online' : 'Offline'}
          />
          <span className="text-[11px] font-bold text-slate-700 hidden sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {pendingSyncOps > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
              {pendingSyncOps}
            </span>
          )}
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
            title="Sync database changes"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Workstation Switcher */}
        {onSwitchWorkstation && (
          <div className="hidden lg:flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => onSwitchWorkstation('admin')}
              className={`px-2 py-1 rounded-lg transition-all ${
                currentWorkstation === 'admin'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinic Admin
            </button>
            <button
              onClick={() => onSwitchWorkstation('doctor')}
              className={`px-2 py-1 rounded-lg transition-all ${
                currentWorkstation === 'doctor'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => onSwitchWorkstation('nurse')}
              className={`px-2 py-1 rounded-lg transition-all ${
                currentWorkstation === 'nurse'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nurse
            </button>
            <button
              onClick={() => onSwitchWorkstation('receptionist')}
              className={`px-2 py-1 rounded-lg transition-all ${
                currentWorkstation === 'receptionist'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reception
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold leading-tight">
                {user?.role ?? 'CLINIC_ADMIN'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">{displayName}</div>
                <div className="text-[11px] text-slate-500">{user?.email}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigateTab?.('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Clinic Settings
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl text-left"
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
export default AdminHeader;
