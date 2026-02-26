const API_BASE = import.meta.env.VITE_API_URL || '';

let getAccessToken: () => string | null = () => null;
let onTokenRefreshed: (token: string) => void = () => {};
let onAuthFailed: () => void = () => {};

export function configureAuth(config: {
  getToken: () => string | null;
  onRefresh: (token: string) => void;
  onFail: () => void;
}) {
  getAccessToken = config.getToken;
  onTokenRefreshed = config.onRefresh;
  onAuthFailed = config.onFail;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(res => {
      if (!res.ok) return null;
      return res.json();
    })
    .then(data => data?.accessToken ?? null)
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      onTokenRefreshed(newToken);
      headers.set('Authorization', `Bearer ${newToken}`);
      const retry = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${retry.status}`);
      }
      return retry.json();
    }
    onAuthFailed();
    throw new Error('Authentication failed');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}
