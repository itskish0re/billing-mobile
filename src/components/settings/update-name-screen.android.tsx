import {
  Button,
  Column,
  Icon,
  IconButton,
  OutlinedTextField,
  Text,
  useMaterialColors,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { useSnackbar } from '@/providers/snackbar-provider';

const ARROW_BACK_ICON = require('@/assets/icons/arrow_back.xml');

export function UpdateNameScreen() {
  const router = useRouter();
  const colors = useMaterialColors();
  const { profile, updateProfileName } = useAuth();
  const { showSnackbar } = useSnackbar();
  const name = useNativeState(profile?.full_name ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void name.set(profile?.full_name ?? '');
  }, [name, profile?.full_name]);

  const handleSave = async () => {
    const trimmedName = name.value.trim();

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
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 20 }}>
      <Column verticalArrangement={{ spacedBy: 12 }}>
        <IconButton
          onClick={() => {
            router.back();
          }}>
          <Icon source={ARROW_BACK_ICON} size={24} tint={colors.onSurface} />
        </IconButton>

        <Text color={colors.onSurface} style={{ typography: 'headlineMedium' }}>
          Update name
        </Text>
        <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyMedium' }}>
          Change how your name appears in the app
        </Text>
      </Column>

      <OutlinedTextField
        value={name}
        singleLine
        enabled={!isSaving}
        isError={Boolean(errorMessage)}
        modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Full name</Text>
        </OutlinedTextField.Label>
        <OutlinedTextField.SupportingText>
          <Text>{errorMessage ?? 'This name is shown on your profile'}</Text>
        </OutlinedTextField.SupportingText>
      </OutlinedTextField>

      <Button enabled={!isSaving} onClick={() => void handleSave()}>
        <Text color={colors.onPrimary}>Save</Text>
      </Button>
    </Column>
  );
}
