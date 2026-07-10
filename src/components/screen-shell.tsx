import type { ReactNode } from 'react';
import { Host, Column, Text } from '@expo/ui';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function ScreenShell({ title, subtitle, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Host style={styles.host}>
        <Column spacing={12} style={styles.column}>
          <Text>{title}</Text>
          {subtitle ? <Text>{subtitle}</Text> : null}
          {children}
        </Column>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
  column: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
