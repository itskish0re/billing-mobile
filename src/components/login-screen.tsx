import { Button, Column, Host, Text, TextInput } from '@expo/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLoginForm } from '@/hooks/use-login-form';

import { BRAND_SEED_COLOR } from '@/constants/brand';

export function LoginScreen() {
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
    <SafeAreaView style={styles.safeArea}>
      <Host style={styles.host} seedColor={BRAND_SEED_COLOR}>
        <Column spacing={20} style={styles.column}>
          <Column spacing={6}>
            <Text textStyle={styles.brandTitle}>Billing</Text>
            <Text textStyle={styles.brandSubtitle}>Sign in with your admin-created account</Text>
          </Column>

          <View style={styles.card}>
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
  column: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  brandTitle: {
    color: '#9A6B43',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: '#60646C',
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#E0E1E6',
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
