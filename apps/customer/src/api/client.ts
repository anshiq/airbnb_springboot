export const BASE_URL = '/api/v1';

const ACCESS_TOKEN_KEY = 'rental_access_token';
const REFRESH_TOKEN_KEY = 'rental_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('rental_user');
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
type QueueItem = { resolve: (token: string | null) => void };
let failedQueue: QueueItem[] = [];

function processQueue(token: string | null) {
  failedQueue.forEach(({ resolve }) => resolve(token));
  failedQueue = [];
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const body = await res.json();
    const { accessToken, refreshToken: newRefresh } = body.data;
    setTokens(accessToken, newRefresh);
    return accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && !path.startsWith('/auth/')) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newToken) => {
            if (!newToken) { reject(new ApiError('Unauthorized', 401)); return; }
            try { resolve(await request<T>(path, init)); } catch (e) { reject(e); }
          },
        });
      });
    }
    isRefreshing = true;
    const newToken = await tryRefresh();
    isRefreshing = false;
    processQueue(newToken);
    if (newToken) return request<T>(path, init);
    clearTokens();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? body.error ?? message;
    } catch { /* ignore */ }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json();
  // Unwrap standard ApiResponse envelope
  return ('data' in body ? body.data : body) as T;
}

export const api = {
  get:    <T>(path: string)                   => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body?: unknown)   => request<T>(path, { method: 'POST',  body: body !== undefined ? JSON.stringify(body) : undefined }),
  put:    <T>(path: string, body?: unknown)   => request<T>(path, { method: 'PUT',   body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch:  <T>(path: string, body?: unknown)   => request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string)                   => request<T>(path, { method: 'DELETE' }),
};
