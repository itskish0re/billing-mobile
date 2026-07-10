import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

function isOnline(state: NetInfoState) {
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    NetInfo.fetch().then((state) => setIsOffline(!isOnline(state)));

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!isOnline(state));
    });

    return unsubscribe;
  }, []);

  return { isOffline };
}
