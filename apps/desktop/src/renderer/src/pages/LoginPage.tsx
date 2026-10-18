import React, { useState, FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'Inter', system-ui, sans-serif; }

  .login-root {
    min-height: 100vh;
    background: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .login-bg-glow {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .login-card {
    position: relative;
    z-index: 1;
    background: rgba(30,41,59,0.8);
    border: 1px solid rgba(51,65,85,0.8);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 48px 44px;
    width: 420px;
    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
  }

  .login-logo-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }

  .login-logo-text { color: #f8fafc; font-size: 20px; font-weight: 700; }
  .login-logo-sub { color: #64748b; font-size: 12px; margin-top: 1px; }

  .login-title { font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 6px; }
  .login-subtitle { font-size: 14px; color: #64748b; margin-bottom: 32px; }

  .field { margin-bottom: 20px; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: #94a3b8; margin-bottom: 8px; }

  .field input {
    width: 100%;
    background: rgba(15,23,42,0.6);
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 11px 14px;
    font-size: 14px;
    color: #f8fafc;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .field input::placeholder { color: #475569; }
  .field input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
  }

  .login-btn {
    width: 100%;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    color: #0f172a;
    font-weight: 600;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    font-family: inherit;
    margin-top: 4px;
  }
  .login-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .login-error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #fca5a5;
    margin-bottom: 20px;
  }

  .login-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(15,23,42,0.6);
    border: 1px solid #1e293b;
    border-radius: 8px;
    padding: 10px 14px;
    margin-top: 28px;
  }
  .login-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
  .login-badge-text { font-size: 12px; color: #64748b; }

  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(15,23,42,0.3);
    border-top-color: #0f172a;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

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
    <>
      <style>{STYLES}</style>
      <div className="login-root">
        <div className="login-bg-glow" />
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">🏥</div>
            <div>
              <div className="login-logo-text">MCMS</div>
              <div className="login-logo-sub">Clinical Workstation</div>
            </div>
          </div>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to access the workstation</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@clinic.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading && <span className="spinner" />}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="login-badge">
            <div className="login-badge-dot" />
            <span className="login-badge-text">
              Isolated Electron session · contextIsolation enabled
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
