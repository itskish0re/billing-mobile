import { Host } from '@expo/ui';
import {
  Box,
  Button,
  Column,
  ElevatedCard,
  Icon,
  IconButton,
  LoadingIndicator,
  OutlinedTextField,
  RNHostView,
  Shape,
  Text,
  TextButton,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  alpha,
  background,
  fillMaxSize,
  fillMaxWidth,
  imePadding,
  matchParentSize,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_NAME, BRAND_SEED_COLOR, TabChrome } from '@/constants/brand';
import { ThemedStatusBar } from '@/components/themed-status-bar';
import { useLoginForm } from '@/hooks/use-login-form.android';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { useSnackbar } from '@/providers/snackbar-provider';

const VISIBILITY_ICON = require('@/assets/icons/visibility.xml');
const VISIBILITY_OFF_ICON = require('@/assets/icons/visibility_off.xml');
const MAIL_ICON = require('@/assets/icons/mail.xml');
const LOCK_ICON = require('@/assets/icons/lock.xml');
const LOGO_MARK = require('@/assets/images/logo-mark.png');

const SCREEN_PADDING = 24;
const CARD_PADDING = 20;
const HERO_SIZE = 148;
const WATERMARK_SIZE = 280;

export function LoginScreen() {
  const scheme = useResolvedColorScheme();
  const chrome = TabChrome[scheme];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: chrome.contentBackground }]}>
      <ThemedStatusBar backgroundColor={chrome.contentBackground} />
      <Host key={scheme} style={styles.host} seedColor={BRAND_SEED_COLOR} colorScheme={scheme}>
        <LoginScreenContent />
      </Host>
    </SafeAreaView>
  );
}

function LoginScreenContent() {
  const colors = useMaterialColors();
  const { showSnackbar } = useSnackbar();
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

  const showAdminHelp = () => {
    void showSnackbar('Contact your admin for access or a password reset.', { variant: 'success' });
  };

  const fieldColors = {
    focusedTextColor: colors.onSurface,
    unfocusedTextColor: colors.onSurface,
    focusedLabelColor: colors.primary,
    unfocusedLabelColor: colors.onSurface,
    focusedLeadingIconColor: colors.onSurface,
    unfocusedLeadingIconColor: colors.onSurface,
    focusedTrailingIconColor: colors.onSurface,
    unfocusedTrailingIconColor: colors.onSurface,
    focusedPlaceholderColor: colors.onSurfaceVariant,
    unfocusedPlaceholderColor: colors.onSurfaceVariant,
  };

  return (
    <Box modifiers={[fillMaxSize(), background(colors.surface)]}>
      <Box
        contentAlignment="topEnd"
        modifiers={[matchParentSize(), alpha(0.05)]}>
        <RNHostView matchContents style={styles.watermarkHost}>
          <Image
            source={LOGO_MARK}
            style={styles.watermark}
            contentFit="contain"
            tintColor={colors.primary}
          />
        </RNHostView>
      </Box>

      <Column
        modifiers={[
          fillMaxSize(),
          imePadding(),
          padding(SCREEN_PADDING, SCREEN_PADDING, SCREEN_PADDING, SCREEN_PADDING),
        ]}
        verticalArrangement="center"
        horizontalAlignment="center">
        <Column
          modifiers={[fillMaxWidth()]}
          horizontalAlignment="center"
          verticalArrangement={{ spacedBy: 28 }}>
          <Column horizontalAlignment="center" verticalArrangement={{ spacedBy: 10 }}>
            <RNHostView matchContents style={styles.heroHost}>
              <Image
                source={LOGO_MARK}
                style={styles.hero}
                contentFit="contain"
                tintColor={colors.primary}
              />
            </RNHostView>
            <Text
              color={colors.onSurface}
              style={{ typography: 'headlineLarge', letterSpacing: 3, fontWeight: '700' }}>
              {APP_NAME.toUpperCase()}
            </Text>
            <Text
              color={colors.primary}
              style={{ typography: 'labelLarge', letterSpacing: 3, fontWeight: '700' }}>
              SECURE ACCESS
            </Text>
            <Text color={colors.onSurface} style={{ typography: 'bodyMedium' }}>
              Sign in with your admin-created account
            </Text>
          </Column>

          <ElevatedCard
            modifiers={[fillMaxWidth()]}
            elevation={3}
            colors={{ containerColor: colors.surfaceContainerHigh }}>
            <Column
              modifiers={[
                fillMaxWidth(),
                padding(CARD_PADDING, CARD_PADDING, CARD_PADDING, CARD_PADDING),
              ]}
              verticalArrangement={{ spacedBy: 16 }}
              horizontalAlignment="center">
              <OutlinedTextField
                value={email}
                singleLine
                isError={Boolean(fieldErrors.email)}
                enabled={!isSubmitting}
                modifiers={[fillMaxWidth()]}
                colors={fieldColors}
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
                <OutlinedTextField.LeadingIcon>
                  <Icon source={MAIL_ICON} size={20} tint={colors.onSurface} />
                </OutlinedTextField.LeadingIcon>
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
                colors={fieldColors}
                visualTransformation={isPasswordVisible ? 'none' : 'password'}
                keyboardOptions={{
                  capitalization: 'none',
                  autoCorrectEnabled: false,
                  imeAction: 'done',
                }}
                keyboardActions={{ onDone: handleSignIn }}
                onFocusChanged={(focused) => {
                  if (focused) {
                    clearFieldError('password');
                  }
                }}>
                <OutlinedTextField.Label>
                  <Text>Password</Text>
                </OutlinedTextField.Label>
                <OutlinedTextField.LeadingIcon>
                  <Icon source={LOCK_ICON} size={20} tint={colors.onSurface} />
                </OutlinedTextField.LeadingIcon>
                <OutlinedTextField.TrailingIcon>
                  <IconButton
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    enabled={!isSubmitting}>
                    <Icon
                      source={isPasswordVisible ? VISIBILITY_OFF_ICON : VISIBILITY_ICON}
                      size={22}
                      tint={colors.onSurface}
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
                <Button
                  onClick={handleSignIn}
                  shape={Shape.Pill({})}
                  modifiers={[fillMaxWidth()]}>
                  <Text color={colors.onPrimary}>Sign in</Text>
                </Button>
              )}

              <Column horizontalAlignment="center" verticalArrangement={{ spacedBy: 0 }}>
                <TextButton enabled={!isSubmitting} onClick={showAdminHelp}>
                  <Text color={colors.primary}>Forgot password?</Text>
                </TextButton>
                <TextButton enabled={!isSubmitting} onClick={showAdminHelp}>
                  <Text color={colors.primary}>Need help? Contact admin</Text>
                </TextButton>
              </Column>
            </Column>
          </ElevatedCard>
        </Column>
      </Column>
    </Box>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
  watermarkHost: {
    width: WATERMARK_SIZE,
    height: WATERMARK_SIZE,
  },
  watermark: {
    width: WATERMARK_SIZE,
    height: WATERMARK_SIZE,
  },
  heroHost: {
    width: HERO_SIZE,
    height: HERO_SIZE,
  },
  hero: {
    width: HERO_SIZE,
    height: HERO_SIZE,
  },
});
