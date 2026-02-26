import { create } from 'zustand';
import type { User } from '../@types';
import { fetchMe, fetchRefreshToken, fetchLogout } from '../api/auth';
import { configureAuth } from '../api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (token: string, user: User) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  configureAuth({
    getToken: () => get().accessToken,
    onRefresh: (token) => set({ accessToken: token }),
    onFail: () => set({ user: null, accessToken: null, isAuthenticated: false }),
  });

  return {
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,

    setAuth: (token, user) =>
      set({ accessToken: token, user, isAuthenticated: true, isLoading: false }),

    setToken: (token) => set({ accessToken: token }),

    logout: async () => {
      try {
        await fetchLogout();
      } catch {
        // ignore — cookie may already be gone
      }
      set({ user: null, accessToken: null, isAuthenticated: false });
    },

    init: async () => {
      try {
        const { accessToken } = await fetchRefreshToken();
        set({ accessToken });
        const user = await fetchMe();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});
