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
import { useState } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { useSnackbar } from '@/providers/snackbar-provider';

const ARROW_BACK_ICON = require('@/assets/icons/arrow_back.xml');

export function UpdateNameScreen() {
  const router = useRouter();
  const colors = useMaterialColors();
  const { profile, updateProfileName } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const seededName = profile?.full_name ?? '';

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

      <UpdateNameField
        key={seededName}
        initialName={seededName}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onSave={async (trimmedName) => {
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
        }}
        onEmpty={() => setErrorMessage('Name cannot be empty.')}
      />
    </Column>
  );
}

function UpdateNameField({
  initialName,
  errorMessage,
  isSaving,
  onSave,
  onEmpty,
}: {
  initialName: string;
  errorMessage: string | null;
  isSaving: boolean;
  onSave: (name: string) => Promise<void>;
  onEmpty: () => void;
}) {
  const colors = useMaterialColors();
  const name = useNativeState(initialName);

  return (
    <>
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

      <Button
        enabled={!isSaving}
        onClick={() => {
          const trimmedName = name.value.trim();
          if (!trimmedName) {
            onEmpty();
            return;
          }
          void onSave(trimmedName);
        }}>
        <Text color={colors.onPrimary}>Save</Text>
      </Button>
    </>
  );
}
