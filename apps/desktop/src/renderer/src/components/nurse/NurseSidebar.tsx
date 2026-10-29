import React from 'react';
import {
  Activity,
  CalendarDays,
  Users,
  ClipboardList,
  Pill,
  FlaskConical,
  MessageSquare,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Database,
  HeartPulse,
} from 'lucide-react';
import { CURRENT_NURSE } from './nurseMockData';

export type NurseTab =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'tasks'
  | 'vitals'
  | 'medications'
  | 'lab-samples'
  | 'messages'
  | 'profile'
  | 'settings';

export interface NurseSidebarProps {
  currentTab: NurseTab;
  onSelectTab: (tab: NurseTab) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingSyncOps?: number;
  isOnline?: boolean;
}

const navItems: Array<{ id: NurseTab; label: string; icon: React.ElementType; badge?: number }> = [
  { id: 'dashboard', label: 'Ward Overview', icon: Activity },
  { id: 'patients', label: 'My Patients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'tasks', label: 'Nursing Tasks', icon: ClipboardList, badge: 5 },
  { id: 'vitals', label: 'Vitals Triage', icon: HeartPulse },
  { id: 'medications', label: 'Medications eMAR', icon: Pill },
  { id: 'lab-samples', label: 'Lab Samples', icon: FlaskConical },
  { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function NurseSidebar({
  currentTab,
  onSelectTab,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  pendingSyncOps = 0,
  isOnline = true,
}: NurseSidebarProps) {
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
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <HeartPulse className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-extrabold text-sm tracking-tight leading-tight text-white flex items-center gap-1.5">
                MCMS
              </div>
              <div className="text-[10px] font-medium text-slate-400 tracking-wider truncate">
                Nurse Station
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

      {/* Navigation Items */}
      <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Nursing Station
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
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 group-hover:scale-110'
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate tracking-tight text-[13px]">
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500 text-white rounded-full leading-tight shrink-0 shadow-sm shadow-blue-500/40">
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0D1527]" />
              )}
            </button>
          );
        })}

        {/* Offline-First SQLite Sync Card (When Expanded) */}
        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Ward Sync Engine</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Database</span>
              <span className="text-emerald-400 font-semibold">SQLite Active</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Sync Queue</span>
              <span className="text-white font-semibold">{pendingSyncOps} pending</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Station Link</span>
              <span className={isOnline ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {isOnline ? 'Online' : 'Local Offline'}
              </span>
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
          title={isCollapsed ? `${CURRENT_NURSE.name} (${CURRENT_NURSE.role})` : undefined}
        >
          <div className="relative shrink-0">
            <img
              src={CURRENT_NURSE.avatar}
              alt={CURRENT_NURSE.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D1527]" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate tracking-tight">
                {CURRENT_NURSE.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {CURRENT_NURSE.role} · {CURRENT_NURSE.department}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400">Station Active</span>
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

export default React.memo(NurseSidebar);
