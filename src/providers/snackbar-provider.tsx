import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';

type SnackbarContextValue = {
  showSnackbar: (message: string) => Promise<void>;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const showSnackbar = useCallback(async (message: string) => {
    Alert.alert('', message);
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return <SnackbarContext.Provider value={value}>{children}</SnackbarContext.Provider>;
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }

  return context;
}
