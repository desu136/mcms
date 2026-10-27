import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DoctorLayout } from './components/doctor/DoctorLayout';
import { ReceptionistLayout } from './components/receptionist/ReceptionistLayout';

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeWorkstation, setActiveWorkstation] = useState<'receptionist' | 'doctor'>('receptionist');

  // Align default workstation with user role
  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      setActiveWorkstation('doctor');
    } else {
      setActiveWorkstation('receptionist');
    }
  }, [user]);

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

  return activeWorkstation === 'receptionist' ? (
    <ReceptionistLayout onSwitchWorkstation={setActiveWorkstation} />
  ) : (
    <DoctorLayout onSwitchWorkstation={setActiveWorkstation} />
  );
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
