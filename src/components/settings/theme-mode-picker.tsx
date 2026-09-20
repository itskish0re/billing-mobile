import { Button } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { applyThemePreference } from '@/lib/theme-preference';
import { useAppStore, type ThemeMode } from '@/stores/app-store';

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function ThemeModePicker() {
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          label={option.label}
          variant={themeMode === option.value ? 'filled' : 'outlined'}
          onPress={() => {
            applyThemePreference(option.value);
            setThemeMode(option.value);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
