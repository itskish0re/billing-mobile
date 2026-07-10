import type { ReactNode } from 'react';
import { Host, Column } from '@expo/ui';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from 'react-native';

import { TabHeader } from '@/components/tab-header';
import { BRAND_SEED_COLOR, resolveColorScheme, TabChrome } from '@/constants/brand';

export type ScreenShellProps = {
  children?: ReactNode;
};

export function ScreenShell({ children }: ScreenShellProps) {
  const chrome = TabChrome[resolveColorScheme(useColorScheme())];

  return (
    <View style={[styles.root, { backgroundColor: chrome.contentBackground }]}>
      <Host style={styles.host} seedColor={BRAND_SEED_COLOR}>
        <View style={styles.column}>
          <TabHeader />
          <Column spacing={12} style={styles.content}>
            {children}
          </Column>
          <View style={[styles.tabBorder, { backgroundColor: chrome.divider }]} />
        </View>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
  column: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabBorder: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
