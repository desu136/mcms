import React, { useState } from 'react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuth } from '../../auth/AuthContext';
import { useSync } from '../../context/SyncContext';

// Import Admin Pages
import { DashboardPage } from '../../pages/admin/DashboardPage';
import { DoctorsPage } from '../../pages/admin/DoctorsPage';
import { DepartmentsPage } from '../../pages/admin/DepartmentsPage';
import { AppointmentsPage } from '../../pages/admin/AppointmentsPage';
import { PatientsPage } from '../../pages/admin/PatientsPage';
import { ServicesPage } from '../../pages/admin/ServicesPage';
import { BillingPage } from '../../pages/admin/BillingPage';
import { ReportsPage } from '../../pages/admin/ReportsPage';
import { SettingsPage } from '../../pages/admin/SettingsPage';

export interface AdminLayoutProps {
  onSwitchWorkstation?: (w: 'admin' | 'doctor' | 'nurse' | 'receptionist') => void;
}

export function AdminLayout({ onSwitchWorkstation }: AdminLayoutProps) {
  const { logout } = useAuth();
  const { syncStatus } = useSync();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen h-[100dvh] w-full flex overflow-hidden bg-[#F4F7FC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white select-none">
      {/* ── Fixed Sidebar ── */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={logout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        pendingSyncOps={syncStatus.pendingOperations}
      />

      {/* ── Main Shell: Header + Page Content ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <AdminHeader
          onNavigateTab={(tab) => setCurrentTab(tab as AdminTab)}
          onLogout={logout}
          currentWorkstation="admin"
          onSwitchWorkstation={onSwitchWorkstation}
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {currentTab === 'dashboard' && <DashboardPage />}
          {currentTab === 'doctors' && <DoctorsPage />}
          {currentTab === 'departments' && <DepartmentsPage />}
          {currentTab === 'appointments' && <AppointmentsPage />}
          {currentTab === 'patients' && <PatientsPage />}
          {currentTab === 'services' && <ServicesPage />}
          {currentTab === 'billing' && <BillingPage />}
          {currentTab === 'reports' && <ReportsPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;
