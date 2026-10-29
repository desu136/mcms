import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DoctorLayout } from './components/doctor/DoctorLayout';
import { ReceptionistLayout } from './components/receptionist/ReceptionistLayout';
import { NurseLayout } from './components/nurse/NurseLayout';

type Workstation = 'receptionist' | 'doctor' | 'nurse';

function roleToWorkstation(role: string | undefined): Workstation {
  if (role === 'DOCTOR') return 'doctor';
  if (role === 'NURSE') return 'nurse';
  return 'receptionist';
}

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Initialize directly from user role (avoids one-render flash to wrong workstation)
  const [activeWorkstation, setActiveWorkstation] = useState<Workstation>(
    () => roleToWorkstation(user?.role)
  );

  // Track previous user id so we only auto-reset on actual user change (login/logout)
  // This allows manual workstation switching to still work between same-user sessions.
  const prevUserIdRef = useRef<string | undefined>(user?.id);

  useEffect(() => {
    if (user?.id !== prevUserIdRef.current) {
      prevUserIdRef.current = user?.id;
      setActiveWorkstation(roleToWorkstation(user?.role));
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
