'use client';

import React, { useState, useCallback } from 'react';
import ReceptionistSidebar from '../../components/receptionist/ReceptionistSidebar';
import ReceptionistHeader from '../../components/receptionist/ReceptionistHeader';
import ReceptionistSearchModal from '../../components/receptionist/ReceptionistSearchModal';

export default function ReceptionistPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders of header and sidebar during page navigation
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
      {/* Receptionist Sidebar — persistent across navigation */}
      <ReceptionistSidebar
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
        <ReceptionistHeader
          onOpenSearch={handleOpenSearch}
          onOpenMobileSidebar={handleOpenMobile}
        />

        {/* Page Content Container: locked viewport, children control independent scrolling */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>

      {/* Quick Search Modal (Ctrl + K) */}
      <ReceptionistSearchModal
        isOpen={searchOpen}
        onClose={handleCloseSearch}
      />
    </div>
  );
}
