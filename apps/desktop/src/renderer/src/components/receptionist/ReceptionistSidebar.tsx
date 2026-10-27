import React from 'react';
import {
  Users,
  UserPlus,
  CalendarDays,
  Clock,
  CreditCard,
  FolderOpen,
  MessageSquare,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
  Database,
  CloudOff,
  Cloud,
} from 'lucide-react';
import { CURRENT_RECEPTIONIST } from './receptionistMockData';

export type ReceptionistTab =
  | 'dashboard'
  | 'registration'
  | 'appointments'
  | 'queue'
  | 'billing'
  | 'patients'
  | 'messages'
  | 'reports'
  | 'settings';

export interface ReceptionistSidebarProps {
  currentTab: ReceptionistTab;
  onSelectTab: (tab: ReceptionistTab) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingSyncOps?: number;
  isOnline?: boolean;
}

const navItems: Array<{
  id: ReceptionistTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: Users },
  { id: 'registration', label: 'Patient Registration', icon: UserPlus },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'queue', label: 'Check-In & Queue', icon: Clock, badge: 8, badgeColor: 'bg-blue-600' },
  { id: 'billing', label: 'Billing & Invoices', icon: CreditCard, badge: 3, badgeColor: 'bg-emerald-600' },
  { id: 'patients', label: 'Patient Directory', icon: FolderOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2, badgeColor: 'bg-amber-600' },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'settings', label: 'Settings & Sync', icon: Settings },
];

export function ReceptionistSidebar({
  currentTab,
  onSelectTab,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  pendingSyncOps = 0,
  isOnline = true,
}: ReceptionistSidebarProps) {
  return (
    <aside
      className={`h-screen h-[100dvh] flex flex-col justify-between bg-[#0B132B] text-slate-300 border-r border-slate-800 transition-all duration-200 select-none shrink-0 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* ── Top Brand Header ── */}
      <div className="shrink-0 p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 text-white">
            <Activity className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-black text-sm text-white tracking-tight leading-none block truncate">
                MCMS
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block truncate mt-0.5">
                Reception Workstation
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Navigation Links ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              type="button"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white shrink-0 ${
                    item.badgeColor || 'bg-blue-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Floating Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  {item.label}
                  {item.badge && (
                    <span className="ml-1.5 text-[10px] px-1 rounded-full bg-blue-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Offline SQLite Sync Indicator & Profile Foot ── */}
      <div className="shrink-0 p-2.5 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
        {/* Offline Sync Banner / Pill */}
        <div
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
            pendingSyncOps > 0
              ? 'bg-amber-950/30 border-amber-800/50 text-amber-300 hover:bg-amber-950/50'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
          }`}
          title="SQLite Offline Storage & Sync Engine"
        >
          <div className="relative shrink-0">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span
              className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-[11px] leading-tight">
              <div className="flex items-center justify-between">
                <span className="font-bold truncate">SQLite Sync</span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {pendingSyncOps > 0 ? (
                  <span className="text-amber-400 font-bold">
                    {pendingSyncOps} pending queue
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">All local synced</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {CURRENT_RECEPTIONIST.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {CURRENT_RECEPTIONIST.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {CURRENT_RECEPTIONIST.role}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onLogout}
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default React.memo(ReceptionistSidebar);
