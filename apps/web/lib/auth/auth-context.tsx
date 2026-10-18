'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthenticatedUser, LoginRequest, LoginResponse } from '@mcms/contracts';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY_REFRESH = 'mcms_refresh_token';
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const sanitizedApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE = sanitizedApiUrl.endsWith('/api/v1')
  ? sanitizedApiUrl
  : `${sanitizedApiUrl}/api/v1`;

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const storedUser = sessionStorage.getItem(STORAGE_KEY_USER);
        const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);

        if (storedUser && refreshToken) {
          const parsedUser = JSON.parse(storedUser) as AuthenticatedUser;
          setUser(parsedUser);
          // Silently refresh the access token
          await silentRefresh(refreshToken);
        }
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    void restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const silentRefresh = async (token: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      });
      if (!res.ok) {
        clearAuth();
        return false;
      }
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      setAccessToken(data.accessToken);
      localStorage.setItem(STORAGE_KEY_REFRESH, data.refreshToken);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  };

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.message ?? 'Login failed');
    }

    const data = (await res.json()) as LoginResponse;
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH, data.refreshToken);
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    if (typeof document !== 'undefined') {
      document.cookie = 'mcms_session=1; path=/; max-age=604800; SameSite=Lax';
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    if (accessToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    clearAuth();
  }, [accessToken]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem(STORAGE_KEY_REFRESH);
    if (!token) return false;
    return silentRefresh(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    if (typeof document !== 'undefined') {
      document.cookie = 'mcms_session=; path=/; max-age=0; SameSite=Lax';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: user !== null && accessToken !== null,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
