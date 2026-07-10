import { Host } from '@expo/ui';
import {
  Button,
  Column,
  ElevatedCard,
  Icon,
  IconButton,
  LoadingIndicator,
  OutlinedTextField,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLoginForm } from '@/hooks/use-login-form.android';
import { BRAND_SEED_COLOR } from '@/constants/brand';
const VISIBILITY_ICON = require('@/assets/icons/visibility.xml');
const VISIBILITY_OFF_ICON = require('@/assets/icons/visibility_off.xml');

const SCREEN_PADDING = 12;
const CARD_PADDING = 20;

export function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Host style={styles.host} seedColor={BRAND_SEED_COLOR}>
        <LoginScreenContent />
      </Host>
    </SafeAreaView>
  );
}

function LoginScreenContent() {
  const colors = useMaterialColors();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    email,
    password,
    fieldErrors,
    formError,
    isSubmitting,
    handleSignIn,
    clearFieldError,
  } = useLoginForm();

  return (
    <Column
      modifiers={[fillMaxSize(), padding(SCREEN_PADDING, SCREEN_PADDING, SCREEN_PADDING, SCREEN_PADDING)]}
      verticalArrangement="center"
      horizontalAlignment="center">
      <ElevatedCard modifiers={[fillMaxWidth()]} elevation={2}>
        <Column
          modifiers={[padding(CARD_PADDING, CARD_PADDING, CARD_PADDING, CARD_PADDING), fillMaxWidth()]}
          verticalArrangement={{ spacedBy: 20 }}
          horizontalAlignment="center">
          <Column horizontalAlignment="center" verticalArrangement={{ spacedBy: 6 }}>
            <Text color={colors.primary} style={{ typography: 'displaySmall' }}>
              Billing
            </Text>
            <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyMedium' }}>
              Sign in with your admin-created account
            </Text>
          </Column>

          <Column
            modifiers={[fillMaxWidth()]}
            verticalArrangement={{ spacedBy: 14 }}
            horizontalAlignment="center">
            <OutlinedTextField
              value={email}
              singleLine
              isError={Boolean(fieldErrors.email)}
              enabled={!isSubmitting}
              modifiers={[fillMaxWidth()]}
              keyboardOptions={{
                keyboardType: 'email',
                capitalization: 'none',
                autoCorrectEnabled: false,
                imeAction: 'next',
              }}
              onFocusChanged={(focused) => {
                if (focused) {
                  clearFieldError('email');
                }
              }}>
              <OutlinedTextField.Label>
                <Text>Email</Text>
              </OutlinedTextField.Label>
              {fieldErrors.email ? (
                <OutlinedTextField.SupportingText>
                  <Text>{fieldErrors.email}</Text>
                </OutlinedTextField.SupportingText>
              ) : null}
            </OutlinedTextField>

            <OutlinedTextField
              value={password}
              singleLine
              isError={Boolean(fieldErrors.password)}
              enabled={!isSubmitting}
              modifiers={[fillMaxWidth()]}
              visualTransformation={isPasswordVisible ? 'none' : 'password'}
              keyboardOptions={{
                capitalization: 'none',
                autoCorrectEnabled: false,
                imeAction: 'done',
              }}
              onFocusChanged={(focused) => {
                if (focused) {
                  clearFieldError('password');
                }
              }}>
              <OutlinedTextField.Label>
                <Text>Password</Text>
              </OutlinedTextField.Label>
              <OutlinedTextField.TrailingIcon>
                <IconButton
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  enabled={!isSubmitting}>
                  <Icon
                    source={isPasswordVisible ? VISIBILITY_OFF_ICON : VISIBILITY_ICON}
                    size={22}
                    tint={colors.onSurfaceVariant}
                  />
                </IconButton>
              </OutlinedTextField.TrailingIcon>
              {fieldErrors.password ? (
                <OutlinedTextField.SupportingText>
                  <Text>{fieldErrors.password}</Text>
                </OutlinedTextField.SupportingText>
              ) : null}
            </OutlinedTextField>

            {formError ? (
              <Text color={colors.error} style={{ typography: 'bodySmall' }}>
                {formError}
              </Text>
            ) : null}

            {isSubmitting ? (
              <LoadingIndicator />
            ) : (
              <Button onClick={handleSignIn} modifiers={[fillMaxWidth()]}>
                <Text color={colors.onPrimary}>Sign in</Text>
              </Button>
            )}
          </Column>
        </Column>
      </ElevatedCard>
    </Column>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
});
