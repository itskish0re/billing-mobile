import { Appearance } from 'react-native';

import type { ThemeMode } from '@/stores/app-store';

/** Push the saved preference into RN so Host, StatusBar, and native chrome stay in sync. */
export function applyThemePreference(mode: ThemeMode) {
  Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
}
