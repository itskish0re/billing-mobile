import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { mmkvJSONStorage } from '@/lib/storage/mmkv';

type ThemeMode = 'light' | 'dark' | 'system';

type AppState = {
  themeMode: ThemeMode;
  activeFinancialYearId: number | null;
  activeFinancialYearLabel: string | null;
  setThemeMode: (mode: ThemeMode) => void;
  setActiveFinancialYear: (id: number, label: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      activeFinancialYearId: null,
      activeFinancialYearLabel: null,
      setThemeMode: (themeMode) => set({ themeMode }),
      setActiveFinancialYear: (activeFinancialYearId, activeFinancialYearLabel) =>
        set({ activeFinancialYearId, activeFinancialYearLabel }),
    }),
    {
      name: 'billing-app-store',
      storage: mmkvJSONStorage,
      partialize: (state) => ({
        themeMode: state.themeMode,
        activeFinancialYearId: state.activeFinancialYearId,
        activeFinancialYearLabel: state.activeFinancialYearLabel,
      }),
    }
  )
);
