import { Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { TransactionsDateFilterField } from '@/components/transactions/transactions-date-filter-field';
import { TransactionsFilterAccordion } from '@/components/transactions/transactions-filter-accordion';
import { AppTabRow, type AppTabItem } from '@/components/ui/tab-row';
import { useTransactionsFilters, type TransactionsTab } from '@/hooks/use-transactions-filters';

const TRANSACTION_TABS: AppTabItem<TransactionsTab>[] = [
  { id: 'bills', label: 'Bills' },
  { id: 'loads', label: 'Loads' },
];

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

  const selectedIndex = activeTab === 'bills' ? 0 : 1;

  return (
    <View style={styles.container}>
      <AppTabRow
        tabs={TRANSACTION_TABS}
        selectedIndex={selectedIndex}
        onTabSelected={(_index, tab) => setActiveTab(tab.id)}
      />

      <TransactionsFilterAccordion onSearchQueryChange={setSearchQuery}>
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
      </TransactionsFilterAccordion>

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
  placeholder: {
    flex: 1,
    opacity: 0.7,
    textAlign: 'center',
  },
});
