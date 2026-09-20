import { Text } from '@expo/ui';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_NAME, TabChrome } from '@/constants/brand';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { useAppStore } from '@/stores/app-store';

export function TabHeader() {
  const insets = useSafeAreaInsets();
  const scheme = useResolvedColorScheme();
  const chrome = TabChrome[scheme];
  const financialYearLabel = useAppStore((state) => state.activeFinancialYearLabel);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(chrome.statusBar).catch(() => undefined);
  }, [chrome.statusBar]);

  return (
    <View style={[styles.header, { backgroundColor: chrome.headerBackground, paddingTop: insets.top + 12 }]}>
      <Text textStyle={{ ...styles.title, color: chrome.onHeader }}>{APP_NAME}</Text>
      <Text textStyle={{ ...styles.subtitle, color: chrome.onHeaderMuted }}>
        {financialYearLabel ?? 'No financial year selected'}
      </Text>
      <View style={[styles.divider, { backgroundColor: chrome.divider }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
  },
});
