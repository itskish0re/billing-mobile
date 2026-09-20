import type { ReactNode } from 'react';
import { Host, Column } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { TabHeader } from '@/components/tab-header';
import { BRAND_SEED_COLOR, TabChrome } from '@/constants/brand';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export type ScreenShellProps = {
  children?: ReactNode;
  horizontalPadding?: number;
  topPadding?: number;
};

export function ScreenShell({
  children,
  horizontalPadding = 16,
  topPadding = 16,
}: ScreenShellProps) {
  const scheme = useResolvedColorScheme();
  const chrome = TabChrome[scheme];

  return (
    <View style={[styles.root, { backgroundColor: chrome.contentBackground }]}>
      <Host style={styles.host} seedColor={BRAND_SEED_COLOR} colorScheme={scheme}>
        <View style={styles.column}>
          <TabHeader />
          <Column
            spacing={12}
            style={{
              ...styles.content,
              paddingHorizontal: horizontalPadding,
              paddingTop: topPadding,
            }}>
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
    paddingBottom: 16,
  },
  tabBorder: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
