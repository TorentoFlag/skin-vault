import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

interface LanguageState {
  language: 'ru' | 'en';
  setLanguage: (lang: 'ru' | 'en') => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ru',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      toggleLanguage: () => {
        const next = get().language === 'ru' ? 'en' : 'ru';
        i18n.changeLanguage(next);
        set({ language: next });
      },
    }),
    {
      name: 'skinvault-language',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);
