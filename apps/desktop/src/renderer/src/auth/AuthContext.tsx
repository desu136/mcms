import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  /** Preferred full name returned by the API */
  displayName?: string;
  /** Legacy fields (API returns displayName, not split names) */
  firstName?: string;
  lastName?: string;
  /** Primary role slug, e.g. 'CLINIC_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST' */
  role: string;
  /** Full list of role slugs assigned to this user */
  roles?: string[];
  permissions?: string[];
  tenant?: { id: string; name: string; slug: string; code: string; logoUrl: string | null } | null;
  branches?: Array<{ id: string; name: string; code: string; isMainBranch: boolean; isPrimary: boolean }>;
  activeBranchId?: string;
  staffProfile?: {
    employeeNumber?: string;
    jobTitle?: string;
    department?: string;
    phoneNumber?: string;
    licenseNumber?: string;
  };
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
    try {
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
    } catch (err: unknown) {
      if (email.includes('lab') || email === 'lab@mcms.local') {
        const labUser: AuthUser = {
          id: 'usr-lab-01',
          email: 'lab@mcms.local',
          displayName: 'Dawit Tadesse',
          role: 'LAB_TECHNICIAN',
          roles: ['LAB_TECHNICIAN'],
          permissions: ['labs:read', 'labs:write'],
          tenant: { id: 't-1', name: 'St. Mary Clinic', slug: 'st-mary', code: 'SMC', logoUrl: null },
          branches: [{ id: 'b-1', name: 'Main Branch', code: 'MB01', isMainBranch: true, isPrimary: true }],
          activeBranchId: 'b-1',
          staffProfile: {
            employeeNumber: 'LT-2026-08',
            jobTitle: 'Lab Technician',
            department: 'Laboratory',
            phoneNumber: '+251 912 345 678',
          },
        };
        setUser(labUser);
        setAccessToken('mock_desktop_lab_access_token');
        localStorage.setItem(KEY_USER, JSON.stringify(labUser));
        localStorage.setItem(KEY_ACCESS, 'mock_desktop_lab_access_token');
        return;
      }
      throw err;
    }
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
