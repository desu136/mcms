import React from 'react';
import {
  Home,
  FlaskConical,
  TestTube2,
  CalendarCheck2,
  Users,
  Package,
  FileBarChart2,
  MessageSquare,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Database,
  HeartPulse,
} from 'lucide-react';
import { CURRENT_LAB_TECH } from './labMockData';

export type LabTab =
  | 'dashboard'
  | 'tests'
  | 'samples'
  | 'results'
  | 'patients'
  | 'inventory'
  | 'reports'
  | 'messages'
  | 'profile'
  | 'settings';

export interface LabSidebarProps {
  currentTab: LabTab;
  onSelectTab: (tab: LabTab) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingSyncOps?: number;
  isOnline?: boolean;
}

const navItems: Array<{ id: LabTab; label: string; icon: React.ElementType; badge?: number }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'tests', label: 'Lab Tests', icon: FlaskConical, badge: 6 },
  { id: 'samples', label: 'Sample Management', icon: TestTube2, badge: 4 },
  { id: 'results', label: 'Results Verification', icon: CalendarCheck2, badge: 8 },
  { id: 'patients', label: 'Patient Lookup', icon: Users },
  { id: 'inventory', label: 'Inventory & Reagents', icon: Package },
  { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'settings', label: 'Settings & QC', icon: Settings },
];

export function LabSidebar({
  currentTab,
  onSelectTab,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  pendingSyncOps = 0,
  isOnline = true,
}: LabSidebarProps) {
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
            <HeartPulse className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-extrabold text-sm tracking-tight leading-tight text-white flex items-center gap-1.5">
                MCMS
              </div>
              <div className="text-[10px] font-medium text-cyan-400 tracking-wider truncate">
                Laboratory Station
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
      <nav className="flex-1 min-h-0 px-2 py-3 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left
                ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        isActive
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : item.id === 'results'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Offline Sync & System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 shrink-0 space-y-2">
        <div
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="truncate">{isOnline ? 'Online (LAN & Cloud)' : 'Offline (Local Only)'}</span>
              {pendingSyncOps > 0 && (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  {pendingSyncOps} sync
                </span>
              )}
            </div>
          )}
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center justify-between pt-1">
          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex-1 min-w-0"
          >
            <img
              src={CURRENT_LAB_TECH.avatar}
              alt={CURRENT_LAB_TECH.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/30 shrink-0"
            />
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-xs font-bold text-slate-200 truncate">
                  {CURRENT_LAB_TECH.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {CURRENT_LAB_TECH.role}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default LabSidebar;
