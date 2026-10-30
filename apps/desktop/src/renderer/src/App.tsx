import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DoctorLayout } from './components/doctor/DoctorLayout';
import { ReceptionistLayout } from './components/receptionist/ReceptionistLayout';
import { NurseLayout } from './components/nurse/NurseLayout';
import { AdminLayout } from './components/admin/AdminLayout';

import type { AuthUser } from './auth/AuthContext';

export type Workstation = 'admin' | 'doctor' | 'nurse' | 'receptionist';

/** Derive the default workstation from a user object. Checks both the primary
 *  `role` field and the `roles[]` array so we handle both correctly. */
function userToWorkstation(user: AuthUser | null | undefined): Workstation {
  if (!user) return 'receptionist';
  const primary = (user.role ?? '').toUpperCase();
  const all = (user.roles ?? []).map((r) => r.toUpperCase());
  const isAdmin = primary.includes('ADMIN') || all.some((r) => r.includes('ADMIN'));
  if (isAdmin) return 'admin';
  if (primary === 'DOCTOR' || all.includes('DOCTOR')) return 'doctor';
  if (primary === 'NURSE' || all.includes('NURSE')) return 'nurse';
  return 'receptionist';
}

/** Read user from localStorage directly — used to set initial workstation
 *  before AuthProvider's own useEffect has run. */
function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('mcms_desktop_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Initialize from localStorage directly so the correct workstation shows
  // immediately — even before AuthProvider's useEffect has hydrated `user`.
  const [activeWorkstation, setActiveWorkstation] = useState<Workstation>(
    () => userToWorkstation(getStoredUser())
  );

  // Track previous user id so we only auto-reset on actual user change (login/logout).
  // This allows manual workstation switching to still work within a session.
  const prevUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (user?.id !== prevUserIdRef.current) {
      prevUserIdRef.current = user?.id;
      setActiveWorkstation(userToWorkstation(user));
    }
  }, [user?.id, user?.role]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0b1329',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #1e293b',
            borderTopColor: '#38bdf8',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (activeWorkstation === 'admin') {
    return <AdminLayout onSwitchWorkstation={setActiveWorkstation} />;
  }
  if (activeWorkstation === 'doctor') {
    return <DoctorLayout onSwitchWorkstation={setActiveWorkstation} />;
  }
  if (activeWorkstation === 'nurse') {
    return <NurseLayout onSwitchWorkstation={setActiveWorkstation} />;
  }
  return <ReceptionistLayout onSwitchWorkstation={setActiveWorkstation} />;
}

export function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <AppRouter />
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
