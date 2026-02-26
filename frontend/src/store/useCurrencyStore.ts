import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'usd' | 'rub';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'usd',
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => {
        set({ currency: get().currency === 'usd' ? 'rub' : 'usd' });
      },
    }),
    {
      name: 'skinvault-currency',
    }
  )
);
