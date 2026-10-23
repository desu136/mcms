import React from 'react';
import {
  Zap,
  CalendarDays,
  Users,
  FileText,
  Pill,
  FlaskConical,
  MessageSquare,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
  Database,
} from 'lucide-react';
import { CURRENT_DOCTOR } from './doctorMockData';

export type DoctorTab =
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'medical-records'
  | 'prescriptions'
  | 'lab-results'
  | 'messages'
  | 'profile'
  | 'settings';

export interface DoctorSidebarProps {
  currentTab: DoctorTab;
  onSelectTab: (tab: DoctorTab) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingSyncOps?: number;
}

const navItems: Array<{ id: DoctorTab; label: string; icon: React.ElementType; badge?: number }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Zap },
  { id: 'appointments', label: 'My Appointments', icon: CalendarDays },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'medical-records', label: 'Medical Records', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'lab-results', label: 'Lab Results', icon: FlaskConical },
  { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DoctorSidebar({
  currentTab,
  onSelectTab,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  pendingSyncOps = 0,
}: DoctorSidebarProps) {
  return (
    <aside
      className={`h-screen h-[100dvh] flex flex-col transition-all duration-300 ease-in-out shrink-0
        bg-[#0D1527] text-white border-r border-slate-800/80 shadow-2xl select-none z-30
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 shrink-0">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-extrabold text-sm tracking-tight leading-tight text-white flex items-center gap-1.5">
                MCMS
              </div>
              <div className="text-[10px] font-medium text-slate-400 tracking-wider truncate">
                Desktop Workstation
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="flex w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white items-center justify-center transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Items — independently scrollable */}
      <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Clinical Workstation
          </div>
        )}

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 group relative cursor-pointer ${
                isActive
                  ? 'bg-[#1E6BFF] text-white shadow-lg shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400 group-hover:scale-110'
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate tracking-tight text-[13px]">
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full leading-tight shrink-0 shadow-sm shadow-rose-500/40">
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0D1527]" />
              )}
            </button>
          );
        })}

        {/* Offline-First SQLite Sync Card (When Expanded) */}
        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Offline-First Engine</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Database</span>
              <span className="text-emerald-400 font-semibold">SQLite Active</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Outbound Queue</span>
              <span className="text-white font-semibold">{pendingSyncOps} pending</span>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Profile Card & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090F1C]/90 shrink-0 space-y-2">
        <div
          onClick={() => onSelectTab('profile')}
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 cursor-pointer transition-colors ${
            isCollapsed ? 'justify-center p-1.5' : ''
          }`}
          title={isCollapsed ? `${CURRENT_DOCTOR.name} (${CURRENT_DOCTOR.role})` : undefined}
        >
          <div className="relative shrink-0">
            <img
              src={CURRENT_DOCTOR.avatar}
              alt={CURRENT_DOCTOR.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D1527]" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate tracking-tight">
                {CURRENT_DOCTOR.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {CURRENT_DOCTOR.role}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400">Online Workstation</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer ${
            isCollapsed ? 'px-0' : 'px-3'
          }`}
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
export default DoctorSidebar;
