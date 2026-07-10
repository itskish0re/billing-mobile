import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { FinancialYearBootstrap } from '@/components/financial-year-bootstrap';
import { resolveColorScheme, TabChrome } from '@/constants/brand';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const resolvedScheme = scheme === 'unspecified' ? 'light' : scheme;
  const colors = Colors[resolvedScheme];
  const chrome = TabChrome[resolveColorScheme(resolvedScheme)];

  return (
    <FinancialYearBootstrap>
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        labelVisibilityMode="labeled"
        minimizeBehavior="never"
        shadowColor={chrome.divider}
        iconColor={{ default: colors.textSecondary, selected: colors.text }}
        labelStyle={{
          default: { color: colors.textSecondary },
          selected: { color: colors.text },
        }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="transactions">
          <NativeTabs.Trigger.Icon sf="list.bullet.rectangle" md="receipt_long" />
          <NativeTabs.Trigger.Label>Transactions</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="masters">
          <NativeTabs.Trigger.Icon sf="tray.full.fill" md="inventory_2" />
          <NativeTabs.Trigger.Label>Masters</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </FinancialYearBootstrap>
  );
}
