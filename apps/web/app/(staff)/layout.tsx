'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Staff Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              +
            </div>
            <span className="font-semibold text-white tracking-tight">MCMS Workstation</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium text-sm transition"
          >
            <span>📊</span>
            <span>Dashboard</span>
          </Link>

          <div className="pt-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3">
            Offline Persistence
          </div>
          <div className="px-3 py-2 text-xs text-emerald-400 flex items-center space-x-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>RxDB / IndexedDB Active</span>
          </div>

          <div className="pt-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3">
            Active Permissions
          </div>
          <div className="px-3 py-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">{user?.permissions?.length ?? 0}</span> granted actions
          </div>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user?.displayName ? user.displayName.slice(0, 2) : 'ST'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.displayName || 'Loading...'}
              </div>
              <div className="text-[10px] text-blue-400 font-medium truncate">
                {user?.roles?.[0] || 'Staff'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link href="/" className="text-slate-400 hover:text-slate-200 transition">
              &larr; Public Home
            </Link>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 font-medium transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Staff Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <header className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-white">Clinical Operation Hub</h2>
            <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-mono">
              RBAC Guarded
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {user?.roles?.map((r) => (
              <span
                key={r}
                className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-medium"
              >
                {r}
              </span>
            ))}
          </div>
        </header>
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
