import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';
import { OfflineGate } from '@/components/offline-gate';
import { TabChrome } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { AppProviders } from '@/providers/app-providers';
import { useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'unspecified' ? 'light' : colorScheme;
  const colors = Colors[scheme];
  const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const { isChecking, isOffline } = useNetworkStatus();
  const { session, isLoading } = useAuth();
  const isAppReady = !isChecking && (isOffline || !isLoading);
  const chrome = TabChrome[scheme];
  const statusBarBackground = session ? chrome.statusBar : colors.background;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(statusBarBackground).catch(() => undefined);
  }, [statusBarBackground]);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isAppReady]);

  if (isChecking) {
    return null;
  }

  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          border: colors.backgroundElement,
          primary: colors.text,
        },
      }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <OfflineGate>
        {isLoading ? null : session ? <AppTabs /> : <LoginScreen />}
      </OfflineGate>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
