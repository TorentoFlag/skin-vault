import { apiFetch } from './client';
import type { User } from '../@types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}

export async function fetchRefreshToken(): Promise<{ accessToken: string }> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

export async function fetchLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export function getSteamLoginUrl(): string {
  return `${API_BASE}/api/auth/steam`;
}
