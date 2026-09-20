import { useEffect } from 'react';

import { applyThemePreference } from '@/lib/theme-preference';
import { useAppStore } from '@/stores/app-store';

/** Applies the persisted theme after MMKV rehydrate and whenever Settings changes it. */
export function ThemePreferenceSync() {
  const themeMode = useAppStore((state) => state.themeMode);

  useEffect(() => {
    applyThemePreference(themeMode);
  }, [themeMode]);

  return null;
}
