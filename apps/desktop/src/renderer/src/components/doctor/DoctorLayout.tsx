import React, { useState, useEffect } from 'react';
import { DoctorSidebar, DoctorTab } from './DoctorSidebar';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSearchModal } from './DoctorSearchModal';
import { DashboardPage } from '../../pages/doctor/DashboardPage';
import { AppointmentsPage } from '../../pages/doctor/AppointmentsPage';
import { PatientsPage } from '../../pages/doctor/PatientsPage';
import { MedicalRecordsPage } from '../../pages/doctor/MedicalRecordsPage';
import { PrescriptionsPage } from '../../pages/doctor/PrescriptionsPage';
import { LabResultsPage } from '../../pages/doctor/LabResultsPage';
import { MessagesPage } from '../../pages/doctor/MessagesPage';
import { ProfilePage } from '../../pages/doctor/ProfilePage';
import { SettingsPage } from '../../pages/doctor/SettingsPage';
import { useAuth } from '../../auth/AuthContext';

interface SyncStatus {
  ready: boolean;
  pendingOperations: number;
  cursor: string | null;
}

export interface DoctorLayoutProps {
  onSwitchWorkstation?: ((w: 'admin' | 'doctor' | 'nurse' | 'receptionist') => void) | undefined;
}

export function DoctorLayout({ onSwitchWorkstation }: DoctorLayoutProps) {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<DoctorTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ ready: true, pendingOperations: 0, cursor: null });
  const [appVersion, setAppVersion] = useState<string>('0.0.1');

  useEffect(() => {
    if (window.mcmsDesktop) {
      window.mcmsDesktop.getSyncStatus().then(setSyncStatus).catch(() => {});
      window.mcmsDesktop.getVersion().then(setAppVersion).catch(() => {});
    }
  }, []);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white select-none">
      {/* ── Fixed Sidebar ── */}
      <DoctorSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={logout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        pendingSyncOps={syncStatus.pendingOperations}
      />

      {/* ── Main Workstation Shell: Header + Viewport Content ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        {/* Top Header */}
        <DoctorHeader
          onOpenSearch={() => setSearchOpen(true)}
          onNavigateTab={(tab) => setCurrentTab(tab as DoctorTab)}
          onLogout={logout}
          syncReady={syncStatus.ready}
          onSwitchWorkstation={onSwitchWorkstation}
        />

        {/* Dynamic Page Viewport with Independent Scrolling */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigateTab={(t) => setCurrentTab(t as DoctorTab)} />
          )}
          {currentTab === 'appointments' && <AppointmentsPage />}
          {currentTab === 'patients' && <PatientsPage />}
          {currentTab === 'medical-records' && <MedicalRecordsPage />}
          {currentTab === 'prescriptions' && <PrescriptionsPage />}
          {currentTab === 'lab-results' && <LabResultsPage />}
          {currentTab === 'messages' && <MessagesPage />}
          {currentTab === 'profile' && <ProfilePage />}
          {currentTab === 'settings' && (
            <SettingsPage
              appVersion={appVersion}
              pendingSyncOps={syncStatus.pendingOperations}
            />
          )}
        </main>
      </div>

      {/* Global Quick Search (Ctrl + K) */}
      <DoctorSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab as DoctorTab)}
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
export default DoctorLayout;
