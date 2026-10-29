'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Activity,
  Pill,
  FlaskConical,
  MessageSquare,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CURRENT_NURSE } from './nurseMockData';

interface NurseSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { href: '/nurse', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/nurse/patients', label: 'My Patients', icon: Users },
  { href: '/nurse/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/nurse/tasks', label: 'Nursing Tasks', icon: ClipboardList, badge: 7 },
  { href: '/nurse/vitals', label: 'Vital Signs', icon: Activity },
  { href: '/nurse/medications', label: 'Medications', icon: Pill },
  { href: '/nurse/lab-samples', label: 'Lab Samples', icon: FlaskConical },
  { href: '/nurse/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { href: '/nurse/profile', label: 'Profile', icon: User },
  { href: '/nurse/settings', label: 'Settings', icon: Settings },
];

function NurseSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: NurseSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen h-[100dvh] z-40 flex flex-col transition-all duration-300 ease-in-out
          bg-[#0B132B] text-white border-r border-slate-800/80 shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80 shrink-0">
          <Link href="/nurse" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Activity className="w-6 h-6 text-white stroke-[2.5]" />
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
          </Link>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white items-center justify-center transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const isActive =
              item.href === '/nurse'
                ? pathname === '/nurse'
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}

                {/* Badge Indicator */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center text-[10px] font-bold rounded-full ${
                      isCollapsed
                        ? 'absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white'
                        : 'px-2 py-0.5 bg-rose-500 text-white ml-auto'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs overflow-hidden">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B132B]" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  {CURRENT_NURSE.name}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <span>{CURRENT_NURSE.role}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Online</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default React.memo(NurseSidebar);
