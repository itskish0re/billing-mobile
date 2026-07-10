import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { mmkvJSONStorage } from '@/lib/storage/mmkv';

type ThemeMode = 'light' | 'dark' | 'system';

type AppState = {
  themeMode: ThemeMode;
  activeFinancialYearId: number | null;
  setThemeMode: (mode: ThemeMode) => void;
  setActiveFinancialYearId: (id: number | null) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      activeFinancialYearId: null,
      setThemeMode: (themeMode) => set({ themeMode }),
      setActiveFinancialYearId: (activeFinancialYearId) => set({ activeFinancialYearId }),
    }),
    {
      name: 'billing-app-store',
      storage: mmkvJSONStorage,
      partialize: (state) => ({
        themeMode: state.themeMode,
        activeFinancialYearId: state.activeFinancialYearId,
      }),
    }
  )
);
