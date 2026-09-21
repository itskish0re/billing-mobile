import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { OfflineAlertDialog } from '@/components/offline-alert-dialog';
import { useNetworkStatus } from '@/hooks/use-network-status';

type OfflineGateProps = {
  children: ReactNode;
};

/**
 * Keep the signed-in/login tree mounted. Replacing it on disconnect releases
 * Compose SharedObjects and crashes OutlinedTextField on reconnect.
 */
export function OfflineGate({ children }: OfflineGateProps) {
  const { isChecking, isOffline } = useNetworkStatus();

  if (isChecking) {
    return null;
  }

  return (
    <View style={styles.root}>
      <View style={styles.tree} pointerEvents={isOffline ? 'none' : 'auto'}>
        {children}
      </View>
      {isOffline ? (
        <View style={styles.overlay} pointerEvents="auto">
          <OfflineAlertDialog />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tree: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
