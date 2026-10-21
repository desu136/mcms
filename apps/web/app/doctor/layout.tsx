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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Doctor Workspace...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Doctor Sidebar */}
      <DoctorSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Shell */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Header */}
        <DoctorHeader
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Quick Search (Ctrl + K) */}
      <DoctorSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPatient={(pid) => {
          router.push(`/doctor/patients`);
        }}
      />
    </div>
  );
}
