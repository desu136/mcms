import React, { useState, useEffect, useRef, useMemo } from 'react';
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
export function userToWorkstation(user: AuthUser | null | undefined): Workstation {
  if (!user) return 'receptionist';
  const primary = (user.role ?? '').toUpperCase();
  const all = (user.roles ?? []).map((r) => r.toUpperCase());
  const isAdmin = primary.includes('ADMIN') || all.some((r) => r.includes('ADMIN'));
  if (isAdmin) return 'admin';
  if (primary === 'DOCTOR' || all.includes('DOCTOR')) return 'doctor';
  if (primary === 'NURSE' || all.includes('NURSE')) return 'nurse';
  return 'receptionist';
}

/** Determine which workstations a user has permission to access based strictly on their assigned roles. */
export function getAllowedWorkstations(user: AuthUser | null | undefined): Workstation[] {
  if (!user) return [];
  const primary = (user.role ?? '').toUpperCase();
  const all = (user.roles ?? []).map((r) => r.toUpperCase());
  const roleSet = new Set([primary, ...all]);

  const allowed: Workstation[] = [];
  if (Array.from(roleSet).some((r) => r.includes('ADMIN'))) {
    allowed.push('admin');
  }
  if (roleSet.has('DOCTOR')) {
    allowed.push('doctor');
  }
  if (roleSet.has('NURSE')) {
    allowed.push('nurse');
  }
  if (roleSet.has('RECEPTIONIST')) {
    allowed.push('receptionist');
  }
  if (allowed.length === 0) {
    allowed.push(userToWorkstation(user));
  }
  return allowed;
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

  const allowedWorkstations = useMemo(() => getAllowedWorkstations(user), [user]);

  // Track previous user id so we only auto-reset on actual user change (login/logout).
  const prevUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (user?.id !== prevUserIdRef.current) {
      prevUserIdRef.current = user?.id;
      const initial = userToWorkstation(user);
      setActiveWorkstation(initial);
    } else if (user && allowedWorkstations.length > 0 && !allowedWorkstations.includes(activeWorkstation)) {
      // If user is currently on an unauthorized workstation, enforce fallback to first allowed
      setActiveWorkstation(allowedWorkstations[0]!);
    }
  }, [user?.id, user?.role, allowedWorkstations, activeWorkstation]);

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

  // Only pass onSwitchWorkstation if the user actually has more than 1 allowed workstation
  const handleSwitch = (target: Workstation) => {
    if (allowedWorkstations.includes(target)) {
      setActiveWorkstation(target);
    }
  };
  const switchCallback = allowedWorkstations.length > 1 ? handleSwitch : undefined;
  const switchProps = switchCallback ? { onSwitchWorkstation: switchCallback } : {};

  if (activeWorkstation === 'admin' && allowedWorkstations.includes('admin')) {
    return <AdminLayout {...switchProps} />;
  }
  if (activeWorkstation === 'doctor' && allowedWorkstations.includes('doctor')) {
    return <DoctorLayout {...switchProps} />;
  }
  if (activeWorkstation === 'nurse' && allowedWorkstations.includes('nurse')) {
    return <NurseLayout {...switchProps} />;
  }
  if (activeWorkstation === 'receptionist' && allowedWorkstations.includes('receptionist')) {
    return <ReceptionistLayout {...switchProps} />;
  }

  // Fallback to the first allowed workstation
  const fallback = allowedWorkstations[0] || 'receptionist';
  if (fallback === 'doctor') return <DoctorLayout {...switchProps} />;
  if (fallback === 'nurse') return <NurseLayout {...switchProps} />;
  if (fallback === 'admin') return <AdminLayout {...switchProps} />;
  return <ReceptionistLayout {...switchProps} />;
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
