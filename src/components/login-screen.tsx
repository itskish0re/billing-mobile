import { Button, Column, Host, Text, TextInput } from '@expo/ui';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_NAME, BRAND_SEED_COLOR, TabChrome } from '@/constants/brand';
import { ThemedStatusBar } from '@/components/themed-status-bar';
import { useLoginForm } from '@/hooks/use-login-form';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { useSnackbar } from '@/providers/snackbar-provider';

const LOGO_MARK = require('@/assets/images/logo-mark.png');

export function LoginScreen() {
  const scheme = useResolvedColorScheme();
  const chrome = TabChrome[scheme];
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: chrome.contentBackground }]}>
      <ThemedStatusBar backgroundColor={chrome.contentBackground} />
      <Image
        source={LOGO_MARK}
        style={styles.watermark}
        contentFit="contain"
        tintColor={chrome.onHeader}
      />
      <Host key={scheme} style={styles.host} seedColor={BRAND_SEED_COLOR} colorScheme={scheme}>
        <Column spacing={28} style={styles.column}>
          <Column spacing={8}>
            <Image
              source={LOGO_MARK}
              style={styles.hero}
              contentFit="contain"
              tintColor={chrome.onHeader}
            />
            <Text textStyle={{ ...styles.brandTitle, color: chrome.onHeader }}>
              {APP_NAME.toUpperCase()}
            </Text>
            <Text textStyle={{ ...styles.secureAccess, color: chrome.onHeader }}>SECURE ACCESS</Text>
            <Text textStyle={{ ...styles.brandSubtitle, color: chrome.onHeaderMuted }}>
              Sign in with your admin-created account
            </Text>
          </Column>

          <View
            style={[
              styles.card,
              {
                backgroundColor: chrome.headerBackground,
                borderColor: chrome.divider,
              },
            ]}>
            <Column spacing={14}>
              <Column spacing={4}>
                <TextInput
                  value={email}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                  editable={!isSubmitting}
                  style={styles.input}
                  onFocus={() => clearFieldError('email')}
                />
                {fieldErrors.email ? <Text textStyle={styles.fieldError}>{fieldErrors.email}</Text> : null}
              </Column>

              <Column spacing={4}>
                <View style={styles.passwordRow}>
                  <View style={styles.passwordInputWrap}>
                    <TextInput
                      value={password}
                      placeholder="Password"
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      returnKeyType="done"
                      editable={!isSubmitting}
                      style={styles.input}
                      onSubmitEditing={handleSignIn}
                      onFocus={() => clearFieldError('password')}
                    />
                  </View>
                  <Button
                    label={isPasswordVisible ? 'Hide' : 'Show'}
                    onPress={() => setIsPasswordVisible((visible) => !visible)}
                    disabled={isSubmitting}
                  />
                </View>
                {fieldErrors.password ? (
                  <Text textStyle={styles.fieldError}>{fieldErrors.password}</Text>
                ) : null}
              </Column>

              {formError ? <Text textStyle={styles.formError}>{formError}</Text> : null}

              <Button
                label={isSubmitting ? 'Signing in...' : 'Sign in'}
                onPress={handleSignIn}
                disabled={isSubmitting}
              />

              <Pressable onPress={showAdminHelp} disabled={isSubmitting}>
                <Text textStyle={{ ...styles.help, color: chrome.onHeaderMuted }}>Forgot password?</Text>
              </Pressable>
              <Pressable onPress={showAdminHelp} disabled={isSubmitting}>
                <Text textStyle={{ ...styles.help, color: chrome.onHeaderMuted }}>
                  Need help? Contact admin
                </Text>
              </Pressable>
            </Column>
          </View>
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
  watermark: {
    position: 'absolute',
    top: 24,
    right: -24,
    width: 280,
    height: 280,
    opacity: 0.08,
  },
  column: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hero: {
    width: 148,
    height: 148,
    alignSelf: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
  },
  secureAccess: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  input: {
    height: 52,
    width: '100%',
  },
  passwordRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  passwordInputWrap: {
    flex: 1,
  },
  help: {
    fontSize: 13,
    textAlign: 'center',
  },
  fieldError: {
    color: '#b91c1c',
    fontSize: 13,
  },
  formError: {
    color: '#b91c1c',
    fontSize: 14,
    textAlign: 'center',
  },
});
