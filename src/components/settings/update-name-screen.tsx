import { Button, Text, TextInput } from '@expo/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/providers/auth-provider';
import { useSnackbar } from '@/providers/snackbar-provider';

export function UpdateNameScreen() {
  const router = useRouter();
  const { profile, updateProfileName } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
  }, [profile?.full_name]);

  const handleSave = async () => {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    const message = await updateProfileName(trimmedName);

    if (message) {
      setErrorMessage(message);
      setIsSaving(false);
      return;
    }

    await showSnackbar('Name updated successfully', { variant: 'success' });
    setIsSaving(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Button label="Back" variant="text" onPress={() => router.back()} />

      <Text textStyle={styles.title}>Update name</Text>
      <Text textStyle={styles.subtitle}>Change how your name appears in the app</Text>

      <TextInput placeholder="Full name" editable={!isSaving} onChangeText={setFullName} />

      {errorMessage ? <Text textStyle={styles.error}>{errorMessage}</Text> : null}

      <Button label="Save" onPress={() => void handleSave()} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  error: {
    color: '#b3261e',
    fontSize: 13,
  },
});
