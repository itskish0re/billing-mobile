import type { ReactNode } from 'react';

import { OfflineAlertDialog } from '@/components/offline-alert-dialog';
import { useNetworkStatus } from '@/hooks/use-network-status';

type OfflineGateProps = {
  children: ReactNode;
};

export function OfflineGate({ children }: OfflineGateProps) {
  const { isChecking, isOffline } = useNetworkStatus();

  if (isChecking) {
    return null;
  }

  if (isOffline) {
    return <OfflineAlertDialog />;
  }

  return children;
}
