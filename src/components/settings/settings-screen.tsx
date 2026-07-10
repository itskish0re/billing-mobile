import { Button, Text } from '@expo/ui';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FinancialYearPicker } from '@/components/settings/financial-year-picker';
import { useAuth } from '@/providers/auth-provider';

export function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const displayName = profile?.full_name?.trim() || 'Not set';

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text textStyle={styles.sectionLabel}>Account</Text>
        <Button
          label={`Update name · ${displayName}`}
          variant="outlined"
          onPress={() => router.push('/settings/update-name')}
        />
      </View>

      <View style={styles.section}>
        <Text textStyle={styles.sectionLabel}>Financial year</Text>
        <FinancialYearPicker />
      </View>

      <Button label="Sign out" variant="outlined" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
