import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/providers/auth-provider';
import { NetworkProvider } from '@/providers/network-provider';
import { SnackbarProvider } from '@/providers/snackbar-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider>{children}</SnackbarProvider>
          </QueryClientProvider>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
