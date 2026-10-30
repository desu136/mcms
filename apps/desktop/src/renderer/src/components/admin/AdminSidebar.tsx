import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Building2,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'doctors'
  | 'departments'
  | 'patients'
  | 'appointments'
  | 'services'
  | 'billing'
  | 'reports'
  | 'settings';

export interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingSyncOps?: number;
}

export function AdminSidebar({
  currentTab,
  onSelectTab,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  pendingSyncOps = 0,
}: AdminSidebarProps) {
  const navItems: Array<{ tab: AdminTab; label: string; icon: React.ElementType; badge?: number }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'doctors', label: 'Doctors', icon: Stethoscope },
    { tab: 'departments', label: 'Departments', icon: Building2 },
    { tab: 'patients', label: 'Patients', icon: Users },
    { tab: 'appointments', label: 'Appointments', icon: CalendarDays },
    { tab: 'services', label: 'Services', icon: Wrench },
    { tab: 'billing', label: 'Billing & Cashier', icon: Receipt },
    { tab: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { tab: 'settings', label: 'Clinic Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative h-full flex flex-col bg-[#0F172A] text-slate-300 transition-all duration-300 border-r border-slate-800 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="leading-none truncate">
              <div className="text-sm font-bold text-white tracking-tight">MCMS</div>
              <div className="text-[10px] font-medium text-blue-400 mt-0.5">Clinic Admin</div>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {!isCollapsed && item.badge ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Sign out */}
      <div className="p-2 border-t border-slate-800/80 space-y-1">
        {pendingSyncOps > 0 && !isCollapsed && (
          <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium">
            ⚡ {pendingSyncOps} sync ops queued
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          title={isCollapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
export default AdminSidebar;
