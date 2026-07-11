import { Host } from '@expo/ui';
import {
  Column as ComposeColumn,
  HorizontalDivider,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { background, fillMaxSize, fillMaxWidth, padding, weight } from '@expo/ui/jetpack-compose/modifiers';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabHeader } from '@/components/tab-header';
import { BRAND_SEED_COLOR } from '@/constants/brand';

export type ScreenShellProps = {
  children?: ReactNode;
  horizontalPadding?: number;
  topPadding?: number;
};

function ScreenBody({
  children,
  horizontalPadding = 16,
  topPadding = 16,
}: {
  children?: ReactNode;
  horizontalPadding?: number;
  topPadding?: number;
}) {
  const colors = useMaterialColors();

  return (
    <ComposeColumn
      modifiers={[
        fillMaxWidth(),
        weight(1),
        background(colors.surface),
        padding(horizontalPadding, topPadding, horizontalPadding, 16),
      ]}
      verticalArrangement={{ spacedBy: 12 }}>
      {children}
    </ComposeColumn>
  );
}

export function ScreenShell({
  children,
  horizontalPadding,
  topPadding,
}: ScreenShellProps) {
  return (
    <View style={styles.root}>
      <Host style={styles.host} seedColor={BRAND_SEED_COLOR}>
        <ScreenShellContent horizontalPadding={horizontalPadding} topPadding={topPadding}>
          {children}
        </ScreenShellContent>
      </Host>
    </View>
  );
}

function ScreenShellContent({
  children,
  horizontalPadding,
  topPadding,
}: ScreenShellProps) {
  const colors = useMaterialColors();

  return (
    <ComposeColumn modifiers={[fillMaxSize()]}>
      <TabHeader />
      <ScreenBody horizontalPadding={horizontalPadding} topPadding={topPadding}>
        {children}
      </ScreenBody>
      <HorizontalDivider thickness={1} color={colors.outlineVariant} />
    </ComposeColumn>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
});
