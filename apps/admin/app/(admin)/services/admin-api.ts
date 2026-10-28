// Admin API service - centralised fetch layer for admin pages
// All calls go through the existing auth pattern (Bearer token from useAuth)

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const sanitizedApiUrl = rawApiUrl.replace(/\/+$/, '');
export const API_BASE = sanitizedApiUrl.endsWith('/api/v1')
  ? sanitizedApiUrl
  : `${sanitizedApiUrl}/api/v1`;

// ─── Generic request helper ───────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.message ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  isLocked: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
  staffProfile?: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
  };
}

export interface CreateUserPayload {
  email: string;
  password: string;
  displayName: string;
  roleIds: string[];
  staffProfile?: { department?: string; jobTitle?: string; phoneNumber?: string };
}

export interface UpdateUserPayload {
  displayName?: string;
  isActive?: boolean;
  roleIds?: string[];
  staffProfile?: { department?: string; jobTitle?: string; phoneNumber?: string };
}

export const adminUsersApi = {
  list: (token: string | null) => request<AdminUserSummary[]>('users', { token }),
  get: (id: string, token: string | null) => request<AdminUserSummary>(`users/${id}`, { token }),
  create: (data: CreateUserPayload, token: string | null) =>
    request<AdminUserSummary>('users', { method: 'POST', body: JSON.stringify(data), token }),
  update: (id: string, data: UpdateUserPayload, token: string | null) =>
    request<AdminUserSummary>(`users/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deactivate: (id: string, token: string | null) =>
    request<void>(`users/${id}/deactivate`, { method: 'PATCH', body: JSON.stringify({}), token }),
  activate: (id: string, token: string | null) =>
    request<void>(`users/${id}/activate`, { method: 'PATCH', body: JSON.stringify({}), token }),
};

// ─── Roles ───────────────────────────────────────────────────────────────────

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: string[];
}

export interface AdminPermission {
  id: string;
  slug: string;
  name: string;
  module: string;
  description: string;
}

export const adminRolesApi = {
  list: (token: string | null) => request<AdminRole[]>('roles', { token }),
  get: (id: string, token: string | null) => request<AdminRole>(`roles/${id}`, { token }),
  create: (data: { name: string; description?: string }, token: string | null) =>
    request<AdminRole>('roles', { method: 'POST', body: JSON.stringify(data), token }),
  assignPermissions: (id: string, permissionIds: string[], token: string | null) =>
    request<AdminRole>(`roles/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
      token,
    }),
  listPermissions: (token: string | null) => request<AdminPermission[]>('permissions', { token }),
};

// ─── Health ──────────────────────────────────────────────────────────────────

export const adminHealthApi = {
  check: (token: string | null) =>
    request<{ status: string; timestamp: string }>('health', { token }),
};
