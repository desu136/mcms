import React, { useState, useEffect } from 'react';
import { DoctorSidebar, DoctorTab } from './DoctorSidebar';
import { DoctorHeader } from './DoctorHeader';
import { DashboardPage } from '../../pages/doctor/DashboardPage';
import { AppointmentsPage } from '../../pages/doctor/AppointmentsPage';
import { PatientsPage } from '../../pages/doctor/PatientsPage';
import { MedicalRecordsPage } from '../../pages/doctor/MedicalRecordsPage';
import { PrescriptionsPage } from '../../pages/doctor/PrescriptionsPage';
import { LabResultsPage } from '../../pages/doctor/LabResultsPage';
import { SettingsPage } from '../../pages/doctor/SettingsPage';
import { useAuth } from '../../auth/AuthContext';
import { CURRENT_DOCTOR } from './doctorMockData';

interface SyncStatus {
  ready: boolean;
  pendingOperations: number;
  cursor: string | null;
}

declare global {
  interface Window {
    mcmsDesktop?: {
      getSyncStatus: () => Promise<SyncStatus>;
      getVersion: () => Promise<string>;
    };
  }
}

export function DoctorLayout() {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<DoctorTab>('dashboard');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ ready: true, pendingOperations: 0, cursor: null });
  const [appVersion, setAppVersion] = useState<string>('0.0.1');

  useEffect(() => {
    if (window.mcmsDesktop) {
      window.mcmsDesktop.getSyncStatus().then(setSyncStatus).catch(() => {});
      window.mcmsDesktop.getVersion().then(setAppVersion).catch(() => {});
    }
  }, []);

  const titles: Record<DoctorTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: `Welcome Back, ${CURRENT_DOCTOR.name}`,
      subtitle: "Here's what's happening with your patients and appointments today.",
    },
    appointments: {
      title: 'My Appointments',
      subtitle: 'View and manage your scheduled outpatient appointments.',
    },
    patients: {
      title: 'Patients Registry',
      subtitle: 'View and manage patient clinical records and demographics.',
    },
    'medical-records': {
      title: 'Medical Records',
      subtitle: 'Diagnostic history, consultation notes, and clinical records.',
    },
    prescriptions: {
      title: 'Prescriptions',
      subtitle: 'Active medications, dosage instructions, and refill logs.',
    },
    'lab-results': {
      title: 'Laboratory Results',
      subtitle: 'Clinical diagnostics, pathology reports, and abnormal indicators.',
    },
    settings: {
      title: 'Workstation & Sync Settings',
      subtitle: 'Local SQLite offline database and delta sync engine diagnostics.',
    },
  };

  const currentInfo = titles[currentTab] || titles.dashboard;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        background: '#0b1329',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#f8fafc',
      }}
    >
      {/* ── Fixed Sidebar ── */}
      <DoctorSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={logout}
        pendingSyncOps={syncStatus.pendingOperations}
      />

      {/* ── Main Workstation Area ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <DoctorHeader
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
          date="Oct 19, 2026"
          syncReady={syncStatus.ready}
        />

        {/* Dynamic Page Body with Independent Scrolling */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            padding: '20px 24px',
          }}
        >
          {currentTab === 'dashboard' && <DashboardPage onNavigateTab={(t) => setCurrentTab(t as DoctorTab)} />}
          {currentTab === 'appointments' && <AppointmentsPage />}
          {currentTab === 'patients' && <PatientsPage />}
          {currentTab === 'medical-records' && <MedicalRecordsPage />}
          {currentTab === 'prescriptions' && <PrescriptionsPage />}
          {currentTab === 'lab-results' && <LabResultsPage />}
          {currentTab === 'settings' && <SettingsPage appVersion={appVersion} pendingSyncOps={syncStatus.pendingOperations} />}
        </main>
      </div>
    </div>
  );
}
