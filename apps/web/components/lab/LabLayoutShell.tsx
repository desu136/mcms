'use client';

import React, { useState } from 'react';
import LabSidebar from './LabSidebar';
import LabHeader from './LabHeader';
import LabSearchModal from './LabSearchModal';

export default function LabLayoutShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Lab Technician Sidebar — fixed, independently scrollable */}
      <LabSidebar
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
        <LabHeader
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        {/* Viewport content shell */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Search (Ctrl + K) */}
      <LabSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

