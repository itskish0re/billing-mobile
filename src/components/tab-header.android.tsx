import { Column, HorizontalDivider, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { background, fillMaxWidth, padding } from '@expo/ui/jetpack-compose/modifiers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_NAME } from '@/constants/brand';
import { useThemedStatusBar } from '@/components/themed-status-bar';
import { useAppStore } from '@/stores/app-store';

export function TabHeader() {
  const insets = useSafeAreaInsets();
  const colors = useMaterialColors();
  const financialYearLabel = useAppStore((state) => state.activeFinancialYearLabel);
  const headerColor = colors.secondaryContainer;
  const titleColor = colors.onSecondaryContainer;
  const subtitle = financialYearLabel ?? 'No financial year selected';
  useThemedStatusBar(headerColor);

  return (
    <Column modifiers={[fillMaxWidth(), background(headerColor)]}>
      <Column modifiers={[fillMaxWidth(), padding(16, insets.top + 12, 16, 8)]}>
        <Text color={titleColor} style={{ typography: 'headlineMedium' }}>
          {APP_NAME}
        </Text>
        <Text color={titleColor} style={{ typography: 'bodyMedium' }}>
          {subtitle}
        </Text>
      </Column>
      <HorizontalDivider thickness={1} color={colors.outlineVariant} />
    </Column>
  );
}
