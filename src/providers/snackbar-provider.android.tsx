import { Host } from '@expo/ui';
import { SnackbarHost, type SnackbarHostRef } from '@expo/ui/jetpack-compose';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';

type SnackbarContextValue = {
  showSnackbar: (message: string) => Promise<void>;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const snackbarRef = useRef<SnackbarHostRef>(null);

  const showSnackbar = useCallback(async (message: string) => {
    await snackbarRef.current?.showSnackbar({ message, duration: 'short' });
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      <View style={styles.container}>
        {children}
        <Host matchContents style={styles.host}>
          <SnackbarHost ref={snackbarRef} />
        </Host>
      </View>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  host: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
