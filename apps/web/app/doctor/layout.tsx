'use client';

import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorHeader from '../../components/doctor/DoctorHeader';
import DoctorSearchModal from '../../components/doctor/DoctorSearchModal';
import { useAuth } from '../../lib/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function DoctorPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Doctor Sidebar — fixed, independently scrollable nav */}
      <DoctorSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Right-hand shell: header + viewport content */}
      <div
        className={`flex flex-col flex-1 min-w-0 min-h-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top header — fixed height, never scrolls */}
        <DoctorHeader
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        {/* Viewport content shell */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-y-auto">
          {isLoading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Loading Doctor Workspace...
                </div>
              </div>
              <div className="hidden" aria-hidden="true">
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Global Quick Search (Ctrl + K) */}
      <DoctorSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
