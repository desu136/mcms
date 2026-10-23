'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Building2,
  Wrench,
  FolderOpen,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor', label: 'Doctor Workspace', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/departments', label: 'Departments', icon: Building2 },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/medical-records', label: 'Medical Records', icon: FolderOpen },
  { href: '/billing', label: 'Billing & Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const firstName = user?.displayName?.split(' ')[0] ?? 'Admin';
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'CA';

  return (
    <div className="h-screen flex overflow-hidden bg-[#F5F7FA] font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1A2035] flex flex-col z-30 transition-transform duration-300 shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2979FF] to-[#1565C0] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">+</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">MCMS</div>
            <div className="text-[10px] text-slate-400 leading-tight">Modern Clinic Management System</div>
          </div>
        </div>

        {/* Nav — independently scrollable */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto min-h-0">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-[#2979FF] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Clinic info */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2979FF]/20 flex items-center justify-center">
              <Building2 size={18} className="text-[#2979FF]" />
            </div>
            <div>
              <div className="text-white text-xs font-semibold">City Health Clinic</div>
              <div className="text-slate-400 text-[10px]">Better Health, Brighter Future</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content shell */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Search */}
            <div className="relative max-w-md w-full hidden sm:flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, appointments, or anything..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-4">
            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition">
              <Bell size={17} className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold min-w-[18px] min-h-[18px] px-1">3</span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-gray-800">{user?.displayName ?? 'Admin'}</div>
                  <div className="text-[10px] text-gray-400">{user?.roles?.[0] ?? 'Clinic Admin'}</div>
                </div>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs font-semibold text-gray-800">{user?.displayName}</div>
                    <div className="text-[10px] text-gray-400">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content — independent scroll region */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
