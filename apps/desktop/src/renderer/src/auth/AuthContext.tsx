import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEY_USER = 'mcms_desktop_user';
const KEY_REFRESH = 'mcms_desktop_refresh';
const KEY_ACCESS = 'mcms_desktop_access';

const API_BASE = (
  (typeof process !== 'undefined' && (process as any).env?.DESKTOP_API_URL) ||
  'http://localhost:3001'
).replace(/\/+$/, '') + '/api/v1';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(KEY_USER);
      const savedAccess = localStorage.getItem(KEY_ACCESS);
      if (savedUser && savedAccess) {
        setUser(JSON.parse(savedUser) as AuthUser);
        setAccessToken(savedAccess);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.message ?? 'Login failed');
    }

    const data = await res.json() as {
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    };

    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(KEY_USER, JSON.stringify(data.user));
    localStorage.setItem(KEY_ACCESS, data.accessToken);
    localStorage.setItem(KEY_REFRESH, data.refreshToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(KEY_USER);
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
