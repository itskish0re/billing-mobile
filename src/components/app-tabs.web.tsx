import type { Href } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

import { resolveColorScheme, TabChrome } from '@/constants/brand';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  const chrome = TabChrome[resolveColorScheme(useColorScheme())];

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList style={[styles.tabList, { borderTopColor: chrome.divider }]}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton>Home</TabButton>
        </TabTrigger>
        <TabTrigger name="transactions" href="/transactions" asChild>
          <TabButton>Transactions</TabButton>
        </TabTrigger>
        <TabTrigger name="masters" href="/masters" asChild>
          <TabButton>Masters</TabButton>
        </TabTrigger>
        <TabTrigger name="settings" href={'/settings' as Href} asChild>
          <TabButton>Settings</TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props}>
      <ThemedView type={isFocused ? 'backgroundSelected' : 'backgroundElement'} style={styles.tabButton}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
