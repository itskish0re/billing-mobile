import { Button, Column, Host, Text, TextInput, useNativeState } from '@expo/ui';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { useAuth } from '@/providers/auth-provider';

export function LoginScreen() {
  const { signIn } = useAuth();
  const { isOffline } = useNetworkStatus();
  const email = useNativeState('');
  const password = useNativeState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (isOffline) {
      setError('You are offline. Connect to the internet to sign in.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const message = await signIn(email.value, password.value);

    if (message) {
      setError(message);
    }

    setIsSubmitting(false);
  }, [email.value, isOffline, password.value, signIn]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Host style={styles.host}>
        <Column spacing={16} style={styles.column}>
          <Text>Billing Mobile</Text>
          <Text>Sign in with your admin-created account.</Text>

          <TextInput
            value={email}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
          />

          <TextInput
            value={password}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
          />

          {error ? <Text>{error}</Text> : null}

          {isSubmitting ? (
            <ActivityIndicator />
          ) : (
            <Button label="Sign in" onPress={handleSignIn} disabled={isOffline} />
          )}
        </Column>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
  column: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
