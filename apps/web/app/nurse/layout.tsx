'use client';

import React, { useState, useCallback } from 'react';
import NurseSidebar from '../../components/nurse/NurseSidebar';
import NurseHeader from '../../components/nurse/NurseHeader';
import NurseSearchModal from '../../components/nurse/NurseSearchModal';

export default function NursePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Nurse Sidebar — persistent across navigation */}
      <NurseSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      {/* Main Right Area */}
      <div
        className={`flex flex-col flex-1 min-w-0 min-h-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header — persistent across navigation */}
        <NurseHeader
          onOpenSearch={handleOpenSearch}
          onOpenMobileSidebar={handleOpenMobile}
        />

        {/* Page Content Container: locked viewport, children control independent scrolling */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>

      {/* Quick Search Modal (Ctrl + K) */}
      <NurseSearchModal
        isOpen={searchOpen}
        onClose={handleCloseSearch}
      />
    </div>
  );
}
