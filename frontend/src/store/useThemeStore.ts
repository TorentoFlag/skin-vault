import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggleTheme: () => set({ isDark: !get().isDark }),
    }),
    { name: 'skinvault-theme' }
  )
);
