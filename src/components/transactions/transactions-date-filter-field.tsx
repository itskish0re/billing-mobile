import { Button, Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { formatTransactionDate } from '@/lib/transactions/format-transaction-date';

type TransactionsDateFilterFieldProps = {
  label: string;
  date: Date | null;
  error?: string;
  onDateSelected: (date: Date) => void;
  onClear: () => void;
  selectableDates?: {
    start?: Date;
    end?: Date;
  };
};

export function TransactionsDateFilterField({
  label,
  date,
  error,
  onClear,
}: TransactionsDateFilterFieldProps) {
  return (
    <View style={styles.field}>
      <Text textStyle={styles.label}>{label}</Text>
      <Button
        label={date ? formatTransactionDate(date) : 'Select date'}
        variant="outlined"
        onPress={onClear}
      />
      {error ? <Text textStyle={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    color: '#b3261e',
    fontSize: 12,
  },
});
