import { Button, Text, TextInput } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { TransactionsDateFilterField } from '@/components/transactions/transactions-date-filter-field';
import { useTransactionsFilters } from '@/hooks/use-transactions-filters';

export function TransactionsScreen() {
  const {
    startDate,
    endDate,
    activeTab,
    searchQuery,
    clearEndDate,
    clearStartDate,
    fieldErrors,
    setEndDate,
    setStartDate,
    setSearchQuery,
    setActiveTab,
  } = useTransactionsFilters();

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <TransactionsDateFilterField
          label="Start date"
          date={startDate}
          error={fieldErrors.startDate}
          onDateSelected={setStartDate}
          onClear={clearStartDate}
        />
        <TransactionsDateFilterField
          label="End date"
          date={endDate}
          error={fieldErrors.endDate}
          onDateSelected={setEndDate}
          onClear={clearEndDate}
        />
      </View>

      <TextInput placeholder="Search bills and loads" onChangeText={setSearchQuery} />

      <View style={styles.tabRow}>
        <Button
          label="Bills"
          variant={activeTab === 'bills' ? 'filled' : 'outlined'}
          onPress={() => setActiveTab('bills')}
        />
        <Button
          label="Loads"
          variant={activeTab === 'loads' ? 'filled' : 'outlined'}
          onPress={() => setActiveTab('loads')}
        />
      </View>

      <Text textStyle={styles.placeholder}>
        {activeTab === 'bills'
          ? searchQuery
            ? `No bills match "${searchQuery}"`
            : 'Bills will appear here'
          : searchQuery
            ? `No loads match "${searchQuery}"`
            : 'Loads will appear here'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  placeholder: {
    flex: 1,
    opacity: 0.7,
    textAlign: 'center',
  },
});
