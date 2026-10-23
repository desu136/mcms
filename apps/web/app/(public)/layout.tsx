import React from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              +
            </div>
            <span className="font-semibold text-xl text-slate-900 tracking-tight">MCMS Clinic</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm">
            <a href="#services" className="text-slate-600 hover:text-slate-900 transition">
              Services
            </a>
            <a href="#about" className="text-slate-600 hover:text-slate-900 transition">
              About
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Staff Portal
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} MCMS Healthcare Systems. All rights reserved.
      </footer>
    </div>
  );
}
