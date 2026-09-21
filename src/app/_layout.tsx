import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';
import { OfflineGate } from '@/components/offline-gate';
import { ThemedStatusBar } from '@/components/themed-status-bar';
import { TabChrome } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { AppProviders } from '@/providers/app-providers';
import { useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const scheme = useResolvedColorScheme();
  const colors = Colors[scheme];
  const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const { isChecking, isOffline } = useNetworkStatus();
  const { session, isLoading } = useAuth();
  const isAppReady = !isChecking && (isOffline || !isLoading);
  const chrome = TabChrome[scheme];
  const statusBarBackground = session ? chrome.statusBar : chrome.contentBackground;

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
      <ThemedStatusBar backgroundColor={statusBarBackground} />
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
