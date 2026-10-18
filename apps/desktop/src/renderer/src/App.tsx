import React from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
