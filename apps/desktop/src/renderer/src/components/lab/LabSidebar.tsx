import React from 'react';
import {
  Home,
  FlaskConical,
  TestTube2,
  CalendarCheck2,
  Users,
  CalendarDays,
  FileBarChart2,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

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
  { id: 'tests', label: 'Lab Tests', icon: FlaskConical },
  { id: 'samples', label: 'Sample Management', icon: TestTube2 },
  { id: 'results', label: 'Results', icon: CalendarCheck2 },
  { id: 'patients', label: 'Patient Lookup', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: CalendarDays },
  { id: 'reports', label: 'Reports', icon: FileBarChart2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { id: 'profile', label: 'Profile & Settings', icon: Settings },
];

export function LabSidebar({
  currentTab,
  onSelectTab,
  onLogout: _onLogout,
  isCollapsed,
  onToggleCollapse,
  pendingSyncOps = 0,
  isOnline = true,
}: LabSidebarProps) {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || 'Lab Technician';
  const jobTitle =
    user?.staffProfile?.jobTitle ||
    (user?.role?.toUpperCase().includes('LAB') ? 'Lab Technician' : 'Lab Staff');

  return (
    <aside
      className={`fixed top-0 left-0 h-screen h-[100dvh] z-40 flex flex-col transition-all duration-300 ease-in-out
        bg-[#0B132B] text-white border-r border-slate-800 shadow-2xl select-none
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80 shrink-0">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <HeartPulse className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-extrabold text-base tracking-tight leading-tight text-white flex items-center gap-1.5">
                MCMS
              </div>
              <div className="text-[10px] font-medium text-slate-400 tracking-wider truncate">
                Modern Clinic Management System
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="flex w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white items-center justify-center transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 min-h-0 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const isActive =
            currentTab === item.id ||
            (item.id === 'profile' && currentTab === 'settings');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-white stroke-[2.2]' : 'text-slate-400 group-hover:text-blue-400 stroke-[1.8]'
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 truncate tracking-tight">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-rose-500 text-white shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Widget */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <div
          onClick={() => onSelectTab('profile')}
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-inner hover:border-slate-600 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? displayName : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 ring-1 ring-white/10">
            <FlaskConical className="w-4.5 h-4.5" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-white truncate tracking-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-medium">
                {jobTitle}
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold ${
                      isOnline ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {pendingSyncOps > 0 && (
                  <span className="text-[9px] bg-slate-900/80 text-cyan-300 px-1 rounded font-semibold">
                    {pendingSyncOps} sync
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default LabSidebar;
