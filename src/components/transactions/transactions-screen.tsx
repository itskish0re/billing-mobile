import { Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { TransactionsDateFilterField } from '@/components/transactions/transactions-date-filter-field';
import { TransactionsFilterAccordion } from '@/components/transactions/transactions-filter-accordion';
import { EntityQueryFilter } from '@/components/ui/entity-query-filter';
import { AppTabRow, type AppTabItem } from '@/components/ui/tab-row';
import { useTransactionsFilters, type TransactionsTab } from '@/hooks/use-transactions-filters';
import { useUserEntityFilter } from '@/hooks/use-user-entity-filter';
import { useSnackbar } from '@/providers/snackbar-provider';

const TRANSACTION_TABS: AppTabItem<TransactionsTab>[] = [
  { id: 'bills', label: 'Bills' },
  { id: 'loads', label: 'Loads' },
];

export function TransactionsScreen() {
  const { showSnackbar } = useSnackbar();
  const { activeTab, setActiveTab } = useTransactionsFilters();
  const {
    fields,
    clauses,
    setClauses,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    clearStartDate,
    clearEndDate,
    fieldErrors,
    isReady: filtersReady,
    isSaving: isFilterSaving,
    save: saveFilters,
  } = useUserEntityFilter('bill');

  const selectedIndex = activeTab === 'bills' ? 0 : 1;

  return (
    <View style={styles.container}>
      <AppTabRow
        tabs={TRANSACTION_TABS}
        selectedIndex={selectedIndex}
        onTabSelected={(_index, tab) => setActiveTab(tab.id)}
      />

      <TransactionsFilterAccordion
        extra={
          activeTab === 'bills' ? (
            <EntityQueryFilter
              fields={fields}
              value={clauses}
              onChange={setClauses}
              isSaving={isFilterSaving}
              onSave={() => {
                void saveFilters()
                  .then(() => showSnackbar('Filters saved', { variant: 'success' }))
                  .catch((err) => {
                    void showSnackbar(
                      err instanceof Error ? err.message : 'Could not save filters.',
                      { variant: 'error' }
                    );
                  });
              }}
            />
          ) : null
        }>
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
        {activeTab === 'bills' ? 'Bills will appear here' : 'Loads will appear here'}
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
