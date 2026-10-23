'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
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
} from 'lucide-react';
import { CURRENT_DOCTOR } from './doctorMockData';

interface DoctorSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor/appointments', label: 'My Appointments', icon: CalendarDays },
  { href: '/doctor/patients', label: 'Patients', icon: Users },
  { href: '/doctor/medical-records', label: 'Medical Records', icon: FileText },
  { href: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
  { href: '/doctor/lab-results', label: 'Lab Results', icon: FlaskConical },
  { href: '/doctor/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { href: '/doctor/profile', label: 'Profile', icon: User },
  { href: '/doctor/settings', label: 'Settings', icon: Settings },
];

export default function DoctorSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: DoctorSidebarProps) {
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
          bg-[#0D1527] text-white border-r border-slate-800/80 shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80 shrink-0">
          <Link href="/doctor" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
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

        {/* Navigation Items — independently scrollable */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const isActive =
              item.href === '/doctor'
                ? pathname === '/doctor'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
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
                  <span className="flex-1 truncate tracking-tight text-[13.5px]">
                    {item.label}
                  </span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[11px] font-extrabold bg-rose-500 text-white rounded-full leading-tight shrink-0 shadow-sm shadow-rose-500/40">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0D1527]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Doctor Profile Card (As seen in UI screenshot) */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090F1C]/80 shrink-0">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
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
                  <span className="text-[10px] font-semibold text-emerald-400">Online</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
