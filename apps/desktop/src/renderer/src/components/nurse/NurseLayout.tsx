import React, { useState, useEffect } from 'react';
import { NurseSidebar, NurseTab } from './NurseSidebar';
import { NurseHeader } from './NurseHeader';
import { NurseSearchModal } from './NurseSearchModal';
import { DashboardPage } from '../../pages/nurse/DashboardPage';
import { PatientsPage } from '../../pages/nurse/PatientsPage';
import { AppointmentsPage } from '../../pages/nurse/AppointmentsPage';
import { TasksPage } from '../../pages/nurse/TasksPage';
import { VitalsPage } from '../../pages/nurse/VitalsPage';
import { MedicationsPage } from '../../pages/nurse/MedicationsPage';
import { LabSamplesPage } from '../../pages/nurse/LabSamplesPage';
import { MessagesPage } from '../../pages/nurse/MessagesPage';
import { ProfilePage } from '../../pages/nurse/ProfilePage';
import { SettingsPage } from '../../pages/nurse/SettingsPage';
import { useAuth } from '../../auth/AuthContext';
import { useSync } from '../../context/SyncContext';

export interface NurseLayoutProps {
  onSwitchWorkstation?: (w: 'admin' | 'doctor' | 'nurse' | 'receptionist') => void;
}

export function NurseLayout({ onSwitchWorkstation }: NurseLayoutProps) {
  const { logout } = useAuth();
  const { syncStatus, isOnline, isSyncing, triggerSync } = useSync();
  const [currentTab, setCurrentTab] = useState<NurseTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('0.0.1');

  useEffect(() => {
    if (window.mcmsDesktop) {
      window.mcmsDesktop.getVersion().then(setAppVersion).catch(() => {});
    }
  }, []);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white select-none">
      {/* ── Fixed Sidebar ── */}
      <NurseSidebar
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
        <NurseHeader
          onOpenSearch={() => setSearchOpen(true)}
          onNavigateTab={(tab) => setCurrentTab(tab as NurseTab)}
          onLogout={logout}
          syncReady={syncStatus.ready}
          isOnline={isOnline}
          isSyncing={isSyncing}
          pendingSyncOps={syncStatus.pendingOperations}
          onTriggerSync={triggerSync}
          currentWorkstation="nurse"
          onSwitchWorkstation={onSwitchWorkstation}
        />

        {/* Dynamic Page Viewport with Independent Scrolling */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigateTab={(t) => setCurrentTab(t as NurseTab)} />
          )}
          {currentTab === 'patients' && <PatientsPage />}
          {currentTab === 'appointments' && <AppointmentsPage />}
          {currentTab === 'tasks' && <TasksPage />}
          {currentTab === 'vitals' && <VitalsPage />}
          {currentTab === 'medications' && <MedicationsPage />}
          {currentTab === 'lab-samples' && <LabSamplesPage />}
          {currentTab === 'messages' && <MessagesPage />}
          {currentTab === 'profile' && <ProfilePage />}
          {currentTab === 'settings' && (
            <SettingsPage
              appVersion={appVersion}
              pendingSyncOps={syncStatus.pendingOperations}
              onNavigateTab={(t) => setCurrentTab(t as NurseTab)}
            />
          )}
        </main>
      </div>

      {/* Global Quick Search (Ctrl + K) */}
      <NurseSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab as NurseTab)}
        onSelectPatient={(_pid) => {
          setCurrentTab('patients');
        }}
        onSelectAppointment={(_aptId) => {
          setCurrentTab('appointments');
        }}
      />
    </div>
  );
}

export default React.memo(NurseLayout);
