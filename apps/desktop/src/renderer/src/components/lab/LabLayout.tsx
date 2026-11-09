import React, { useState, useEffect } from 'react';
import { LabSidebar, LabTab } from './LabSidebar';
import { LabHeader } from './LabHeader';
import { LabSearchModal } from './LabSearchModal';
import { DashboardPage } from '../../pages/lab/DashboardPage';
import { TestsPage } from '../../pages/lab/TestsPage';
import { SamplesPage } from '../../pages/lab/SamplesPage';
import { ResultsPage } from '../../pages/lab/ResultsPage';
import { PatientsPage } from '../../pages/lab/PatientsPage';
import { InventoryPage } from '../../pages/lab/InventoryPage';
import { ReportsPage } from '../../pages/lab/ReportsPage';
import { MessagesPage } from '../../pages/lab/MessagesPage';
import { ProfilePage } from '../../pages/lab/ProfilePage';
import { SettingsPage } from '../../pages/lab/SettingsPage';
import { useAuth } from '../../auth/AuthContext';
import { useSync } from '../../context/SyncContext';

export interface LabLayoutProps {
  onSwitchWorkstation?: (w: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'lab') => void;
}

export function LabLayout({ onSwitchWorkstation }: LabLayoutProps) {
  const { logout } = useAuth();
  const { syncStatus, isOnline, isSyncing, triggerSync } = useSync();
  const [currentTab, setCurrentTab] = useState<LabTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-cyan-600 selection:text-white select-none">
      {/* ── Fixed Dark Sidebar ── */}
      <LabSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={logout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        pendingSyncOps={syncStatus?.pendingOperations || 0}
        isOnline={isOnline}
      />

      {/* ── Main Workstation Shell: Header + Viewport Content ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        {/* Top Header */}
        <LabHeader
          onOpenSearch={() => setSearchOpen(true)}
          onNavigateTab={(tab) => setCurrentTab(tab as LabTab)}
          onLogout={logout}
          syncReady={syncStatus?.ready ?? true}
          isOnline={isOnline}
          isSyncing={isSyncing}
          pendingSyncOps={syncStatus?.pendingOperations || 0}
          onTriggerSync={triggerSync}
          currentWorkstation="lab"
          onSwitchWorkstation={onSwitchWorkstation}
        />

        {/* Dynamic Page Viewport with Independent Scrolling */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={(t) => setCurrentTab(t as LabTab)}
              onOpenNewOrder={() => setCurrentTab('tests')}
              onOpenCollectSample={() => setCurrentTab('samples')}
              onOpenEnterResult={() => setCurrentTab('results')}
            />
          )}
          {currentTab === 'tests' && <TestsPage />}
          {currentTab === 'samples' && <SamplesPage />}
          {currentTab === 'results' && <ResultsPage />}
          {currentTab === 'patients' && <PatientsPage />}
          {currentTab === 'inventory' && <InventoryPage />}
          {currentTab === 'reports' && <ReportsPage />}
          {currentTab === 'messages' && <MessagesPage />}
          {currentTab === 'profile' && <ProfilePage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Quick Search Modal (Ctrl + K) */}
      <LabSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab as LabTab)}
      />
    </div>
  );
}

export default LabLayout;
