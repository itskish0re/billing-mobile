import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { FinancialYearBootstrap } from '@/components/financial-year-bootstrap';
import { BRAND_SEED_COLOR, TabChrome } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export default function AppTabs() {
  const scheme = useResolvedColorScheme();
  const colors = Colors[scheme];
  const chrome = TabChrome[scheme];
  const tabAccent = scheme === 'dark' ? chrome.onHeaderMuted : BRAND_SEED_COLOR;

  return (
    <FinancialYearBootstrap>
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundSelected}
        rippleColor={chrome.tabRipple}
        tintColor={tabAccent}
        labelVisibilityMode="labeled"
        minimizeBehavior="never"
        shadowColor={chrome.divider}
        iconColor={{ default: colors.textSecondary, selected: tabAccent }}
        labelStyle={{
          default: { color: colors.textSecondary },
          selected: { color: tabAccent },
        }}>
        <NativeTabs.Trigger name="index">
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
