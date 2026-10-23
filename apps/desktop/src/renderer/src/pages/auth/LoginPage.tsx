import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Activity } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          background: 'rgba(21,30,51,0.8)',
          border: '1px solid rgba(51,65,85,0.8)',
          borderRadius: '16px',
          padding: '44px 40px',
          width: '420px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0b1329',
              boxShadow: '0 4px 12px rgba(56,189,248,0.25)',
            }}
          >
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 800 }}>MCMS</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '1px' }}>Clinical Workstation</div>
          </div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>Welcome back</h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '28px' }}>Sign in to access workstation</p>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#fca5a5',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="doctor@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#f8fafc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#f8fafc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#0b1329',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              borderRadius: '8px',
              padding: '11px',
              cursor: 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In to Workstation'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '10px 14px',
            marginTop: '24px',
          }}
        >
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Isolated Electron Session · SQLite Local
          </span>
        </div>
      </div>
    </div>
  );
}
