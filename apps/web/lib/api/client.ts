const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const sanitizedApiUrl = rawApiUrl.replace(/\/+$/, '');
export const API_BASE = sanitizedApiUrl.endsWith('/api/v1')
  ? sanitizedApiUrl
  : `${sanitizedApiUrl}/api/v1`;

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  token?: string | null | undefined;
  headers?: Record<string, string> | undefined;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers = {}, ...rest } = options;
  const buildHeaders = (authToken?: string | null) => {
    const merged: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (authToken) {
      merged['Authorization'] = `Bearer ${authToken}`;
    }
    return merged;
  };

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  let res = await fetch(`${API_BASE}/${cleanPath}`, {
    ...rest,
    headers: buildHeaders(token),
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('mcms_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = (await refreshRes.json()) as { accessToken: string; refreshToken: string };
          localStorage.setItem('mcms_refresh_token', data.refreshToken);
          res = await fetch(`${API_BASE}/${cleanPath}`, {
            ...rest,
            headers: buildHeaders(data.accessToken),
          });
        }
      } catch {
        // Fall through to error handler
      }
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string })?.message ??
      `Request to ${cleanPath} failed with status ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}
