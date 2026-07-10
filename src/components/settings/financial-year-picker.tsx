import { Button, Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { useFinancialYears } from '@/hooks/use-financial-years';
import { useSnackbar } from '@/providers/snackbar-provider';
import { useAppStore } from '@/stores/app-store';

export function FinancialYearPicker() {
  const { data: financialYears, isLoading } = useFinancialYears();
  const activeFinancialYearId = useAppStore((state) => state.activeFinancialYearId);
  const setActiveFinancialYear = useAppStore((state) => state.setActiveFinancialYear);
  const { showSnackbar } = useSnackbar();

  if (isLoading) {
    return <Text>Loading financial years…</Text>;
  }

  return (
    <View style={styles.container}>
      <Text textStyle={styles.label}>Financial year</Text>
      {financialYears?.map((year) => (
        <Button
          key={year.financial_year_id}
          label={`${year.name}${year.financial_year_id === activeFinancialYearId ? ' (selected)' : ''}`}
          variant={year.financial_year_id === activeFinancialYearId ? 'filled' : 'outlined'}
          onPress={() => {
            setActiveFinancialYear(year.financial_year_id, year.name);
            void showSnackbar(`Financial year set to ${year.name}`);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});
