import { resolveColorScheme, type ColorSchemeName } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores/app-store';

/** Saved preference (light / dark / system) mapped to the two schemes we theme. */
export function useResolvedColorScheme(): ColorSchemeName {
  const themeMode = useAppStore((state) => state.themeMode);
  const systemScheme = useColorScheme();

  if (themeMode === 'light' || themeMode === 'dark') {
    return themeMode;
  }

  return resolveColorScheme(systemScheme);
}
