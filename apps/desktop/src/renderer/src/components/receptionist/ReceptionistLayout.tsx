import React, { useState } from 'react';
import { ReceptionistSidebar, ReceptionistTab } from './ReceptionistSidebar';
import { ReceptionistHeader } from './ReceptionistHeader';
import ReceptionistSearchModal from './ReceptionistSearchModal';
import { DashboardPage } from '../../pages/receptionist/DashboardPage';
import { RegistrationPage } from '../../pages/receptionist/RegistrationPage';
import { AppointmentsPage } from '../../pages/receptionist/AppointmentsPage';
import { QueuePage } from '../../pages/receptionist/QueuePage';
import { BillingPage } from '../../pages/receptionist/BillingPage';
import { PatientsPage } from '../../pages/receptionist/PatientsPage';
import { MessagesPage } from '../../pages/receptionist/MessagesPage';
import { ReportsPage } from '../../pages/receptionist/ReportsPage';
import { SettingsPage } from '../../pages/receptionist/SettingsPage';
import { useAuth } from '../../auth/AuthContext';
import { useSync } from '../../context/SyncContext';

interface ReceptionistLayoutProps {
  onSwitchWorkstation?: (w: 'receptionist' | 'doctor') => void;
}

export function ReceptionistLayout({ onSwitchWorkstation }: ReceptionistLayoutProps) {
  const { logout } = useAuth();
  const { syncStatus, isOnline, isSyncing, triggerSync } = useSync();
  const [currentTab, setCurrentTab] = useState<ReceptionistTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white select-none">
      {/* ── Fixed Sidebar ── */}
      <ReceptionistSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={logout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        pendingSyncOps={syncStatus.pendingOperations}
        isOnline={isOnline}
      />

      {/* ── Main Workstation Shell: Header + Viewport Content ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        {/* Top Header */}
        <ReceptionistHeader
          onOpenSearch={() => setSearchOpen(true)}
          onNavigateTab={(tab) => setCurrentTab(tab as ReceptionistTab)}
          onLogout={logout}
          syncReady={syncStatus.ready}
          isOnline={isOnline}
          isSyncing={isSyncing}
          pendingSyncOps={syncStatus.pendingOperations}
          onTriggerSync={triggerSync}
          currentWorkstation="receptionist"
          onSwitchWorkstation={onSwitchWorkstation}
        />

        {/* Dynamic Page Viewport with Independent Scrolling */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'registration' && (
            <RegistrationPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'appointments' && (
            <AppointmentsPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'queue' && (
            <QueuePage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'billing' && (
            <BillingPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'patients' && (
            <PatientsPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'messages' && (
            <MessagesPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'reports' && (
            <ReportsPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
          {currentTab === 'settings' && (
            <SettingsPage onNavigateTab={(t) => setCurrentTab(t as ReceptionistTab)} />
          )}
        </main>
      </div>

      {/* Global Quick Search (Ctrl + K) */}
      <ReceptionistSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab as ReceptionistTab)}
      />
    </div>
  );
}

export default React.memo(ReceptionistLayout);
