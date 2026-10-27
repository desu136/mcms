'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  Database,
  FileText,
  HardDrive,
  Shield,
  BarChart3,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Activity,
  Heart,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users-roles', label: 'Users & Roles', icon: Users },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
  { href: '/admin/clinic-management', label: 'Clinic Management', icon: Building2 },
  { href: '/admin/database-management', label: 'Database Management', icon: Database },
  { href: '/admin/logs-activity', label: 'Logs & Activity', icon: FileText },
  { href: '/admin/backup-restore', label: 'Backup & Restore', icon: HardDrive },
  { href: '/admin/security', label: 'Security', icon: Shield },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-dropdown]')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SA';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2979FF] to-[#1565C0] flex items-center justify-center animate-pulse">
            <Activity size={20} className="text-white" />
          </div>
          <p className="text-sm text-slate-500">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FF] font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[220px] bg-[#141C2E] flex flex-col z-30 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-[18px] border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2979FF] to-[#0D47A1] flex items-center justify-center shadow-lg flex-shrink-0">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">MCMS</div>
            <div className="text-[10px] text-slate-400 leading-tight">Modern Clinic Management System</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    active
                      ? 'bg-[#2979FF] text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Clinic info footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2979FF]/15 flex items-center justify-center flex-shrink-0">
              <Building2 size={17} className="text-[#2979FF]" />
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">City Health Clinic</div>
              <div className="text-slate-400 text-[10px] truncate">Better Health, Brighter Future</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Header */}
        <header className="h-[60px] bg-white border-b border-gray-100 px-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            {/* Search */}
            <div className="relative max-w-sm w-full hidden sm:flex items-center">
              <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search users, settings, or anything..."
                className="w-full pl-9 pr-16 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
              <span className="absolute right-3 text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5 ml-3">
            {/* Notifications */}
            <Link
              href="/admin/notifications"
              className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
            >
              <Bell size={16} className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                3
              </span>
            </Link>

            {/* Profile */}
            <div className="relative" data-profile-dropdown>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow flex-shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">{user?.displayName ?? 'Admin'}</div>
                  <div className="text-[10px] text-gray-400 whitespace-nowrap">{user?.roles?.[0] ?? 'System Admin'}</div>
                </div>
                <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <div className="text-xs font-semibold text-gray-800">{user?.displayName}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{user?.email}</div>
                    <div className="text-[10px] text-blue-500 mt-0.5">{user?.roles?.[0] ?? 'System Admin'}</div>
                  </div>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
