import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { isNetInfoOnline, resolveConnectivity } from '@/lib/network/connectivity';

type NetworkStatus = 'checking' | 'offline' | 'online';

type NetworkContextValue = {
  isOffline: boolean;
  isChecking: boolean;
};

const OFFLINE_RECHECK_MS = 2500;

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<NetworkStatus>('checking');
  const wasOfflineRef = useRef(false);
  const verifyRequestRef = useRef(0);

  const evaluate = useCallback(async (wasOffline: boolean) => {
    const requestId = verifyRequestRef.current + 1;
    verifyRequestRef.current = requestId;

    const isReachable = await resolveConnectivity(wasOffline);

    if (verifyRequestRef.current !== requestId) {
      return;
    }

    if (isReachable) {
      wasOfflineRef.current = false;
      setStatus('online');
      return;
    }

    wasOfflineRef.current = true;
    setStatus('offline');
  }, []);

  useEffect(() => {
    const handleChange = (state: NetInfoState) => {
      if (!isNetInfoOnline(state)) {
        verifyRequestRef.current += 1;
        wasOfflineRef.current = true;
        setStatus('offline');
        return;
      }

      void evaluate(wasOfflineRef.current);
    };

    NetInfo.fetch().then(handleChange);

    const unsubscribe = NetInfo.addEventListener(handleChange);

    return () => {
      verifyRequestRef.current += 1;
      unsubscribe();
    };
  }, [evaluate]);

  useEffect(() => {
    if (status !== 'offline') {
      return;
    }

    const interval = setInterval(() => {
      void evaluate(true);
    }, OFFLINE_RECHECK_MS);

    return () => clearInterval(interval);
  }, [evaluate, status]);

  const value = {
    isOffline: status === 'offline',
    isChecking: status === 'checking',
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkStatus() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error('useNetworkStatus must be used within NetworkProvider');
  }

  return context;
}
