import { Column, HorizontalDivider, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { background, fillMaxWidth, padding } from '@expo/ui/jetpack-compose/modifiers';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStore } from '@/stores/app-store';

export function TabHeader() {
  const insets = useSafeAreaInsets();
  const colors = useMaterialColors();
  const financialYearLabel = useAppStore((state) => state.activeFinancialYearLabel);
  const headerColor = colors.secondaryContainer;
  const titleColor = colors.onSecondaryContainer;
  const subtitle = financialYearLabel ?? 'No financial year selected';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(headerColor).catch(() => undefined);
  }, [headerColor]);

  return (
    <Column modifiers={[fillMaxWidth(), background(headerColor)]}>
      <Column modifiers={[fillMaxWidth(), padding(16, insets.top + 12, 16, 8)]}>
        <Text color={titleColor} style={{ typography: 'headlineMedium' }}>
          Billing
        </Text>
        <Text color={titleColor} style={{ typography: 'bodyMedium' }}>
          {subtitle}
        </Text>
      </Column>
      <HorizontalDivider thickness={1} color={colors.outlineVariant} />
    </Column>
  );
}
