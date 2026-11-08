'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { CURRENT_LAB_TECH } from './labMockData';

interface LabSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { href: '/lab', label: 'Dashboard', icon: Home },
  { href: '/lab/tests', label: 'Lab Tests', icon: FlaskConical },
  { href: '/lab/samples', label: 'Sample Management', icon: TestTube2 },
  { href: '/lab/results', label: 'Results', icon: CalendarCheck2 },
  { href: '/lab/patients', label: 'Patient Lookup', icon: Users },
  { href: '/lab/inventory', label: 'Inventory', icon: CalendarDays },
  { href: '/lab/reports', label: 'Reports', icon: FileBarChart2 },
  { href: '/lab/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { href: '/lab/profile', label: 'Profile & Settings', icon: Settings },
];

export default function LabSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: LabSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen h-[100dvh] z-40 flex flex-col transition-all duration-300 ease-in-out
          bg-[#0B132B] text-white border-r border-slate-800 shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80 shrink-0">
          <Link href="/lab" className="flex items-center gap-3 overflow-hidden">
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
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white items-center justify-center transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const isActive =
              item.href === '/lab'
                ? pathname === '/lab' || pathname === '/lab/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
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
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Widget */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-inner hover:border-slate-600 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 ring-1 ring-white/10">
              <FlaskConical className="w-4.5 h-4.5" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-white truncate tracking-tight">
                  {CURRENT_LAB_TECH.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-medium">
                  {CURRENT_LAB_TECH.role}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
