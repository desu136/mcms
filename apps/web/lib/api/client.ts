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
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const res = await fetch(`${API_BASE}/${cleanPath}`, {
    ...rest,
    headers: mergedHeaders,
  });

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
