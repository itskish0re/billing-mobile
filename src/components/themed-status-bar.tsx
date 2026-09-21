import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';

import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export function useThemedStatusBar(backgroundColor: string) {
  const scheme = useResolvedColorScheme();
  const style = scheme === 'dark' ? 'light' : 'dark';
  const barStyle = scheme === 'dark' ? 'light-content' : 'dark-content';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => undefined);
    RNStatusBar.setBarStyle(barStyle, true);
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(backgroundColor, true);
    }
  }, [backgroundColor, barStyle]);

  return { style, barStyle, backgroundColor };
}

/**
 * Keeps the system status bar background and icon color in contrast with the
 * current theme and the surface behind it.
 */
export function ThemedStatusBar({ backgroundColor }: { backgroundColor: string }) {
  const { style } = useThemedStatusBar(backgroundColor);
  return <StatusBar style={style} backgroundColor={backgroundColor} />;
}
