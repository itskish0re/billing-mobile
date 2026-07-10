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
};

function ScreenBody({ children }: { children?: ReactNode }) {
  const colors = useMaterialColors();

  return (
    <ComposeColumn
      modifiers={[
        fillMaxWidth(),
        weight(1),
        background(colors.surface),
        padding(16, 16, 16, 16),
      ]}
      verticalArrangement={{ spacedBy: 12 }}>
      {children}
    </ComposeColumn>
  );
}

export function ScreenShell({ children }: ScreenShellProps) {
  return (
    <View style={styles.root}>
      <Host style={styles.host} seedColor={BRAND_SEED_COLOR}>
        <ScreenShellContent>{children}</ScreenShellContent>
      </Host>
    </View>
  );
}

function ScreenShellContent({ children }: ScreenShellProps) {
  const colors = useMaterialColors();

  return (
    <ComposeColumn modifiers={[fillMaxSize()]}>
      <TabHeader />
      <ScreenBody>{children}</ScreenBody>
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
