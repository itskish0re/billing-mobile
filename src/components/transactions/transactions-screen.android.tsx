import {
  Column,
  HorizontalPager,
  Text,
  useMaterialColors,
  type HorizontalPagerHandle,
} from '@expo/ui/jetpack-compose';
import { fillMaxSize, fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useRef } from 'react';

import { TransactionsDateFilterField } from '@/components/transactions/transactions-date-filter-field';
import { TransactionsFilterAccordion } from '@/components/transactions/transactions-filter-accordion';
import { AppTabRow, type AppTabItem } from '@/components/ui/tab-row';
import { usePagerTabPosition } from '@/hooks/use-pager-tab-position';
import { useTransactionsFilters, type TransactionsTab } from '@/hooks/use-transactions-filters';

const TRANSACTION_TABS: AppTabItem<TransactionsTab>[] = [
  { id: 'bills', label: 'Bills' },
  { id: 'loads', label: 'Loads' },
];

function TransactionListPlaceholder({ title }: { title: string }) {
  const colors = useMaterialColors();

  return (
    <Column
      modifiers={[fillMaxSize()]}
      horizontalAlignment="center"
      verticalArrangement="center">
      <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyLarge' }}>
        {title}
      </Text>
    </Column>
  );
}

export function TransactionsScreen() {
  const pagerRef = useRef<HorizontalPagerHandle>(null);
  const {
    startDate,
    endDate,
    searchQuery,
    activeTab,
    setStartDate,
    setEndDate,
    clearStartDate,
    clearEndDate,
    fieldErrors,
    setSearchQuery,
    setActiveTab,
  } = useTransactionsFilters();

  const selectedIndex = activeTab === 'bills' ? 0 : 1;
  const { pagePosition, handlePageScroll, handleSettledPage, selectPage } =
    usePagerTabPosition(selectedIndex);

  const selectTab = (index: number, tab: AppTabItem<TransactionsTab>) => {
    selectPage(index);
    setActiveTab(tab.id);
    void pagerRef.current?.animateScrollToPage(index);
  };

  return (
    <Column modifiers={[fillMaxWidth(), weight(1)]} verticalArrangement={{ spacedBy: 0 }}>
      <AppTabRow
        tabs={TRANSACTION_TABS}
        selectedIndex={selectedIndex}
        pagePosition={pagePosition}
        onTabSelected={selectTab}
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

      <HorizontalPager
        ref={pagerRef}
        initialPage={selectedIndex}
        modifiers={[fillMaxWidth(), weight(1)]}
        onPageScroll={handlePageScroll}
        onCurrentPageChange={(page) => {
          setActiveTab(page === 0 ? 'bills' : 'loads');
        }}
        onSettledPageChange={(page) => {
          setActiveTab(page === 0 ? 'bills' : 'loads');
          handleSettledPage(page);
        }}>
        <TransactionListPlaceholder
          title={searchQuery ? `No bills match "${searchQuery}"` : 'Bills will appear here'}
        />
        <TransactionListPlaceholder
          title={searchQuery ? `No loads match "${searchQuery}"` : 'Loads will appear here'}
        />
      </HorizontalPager>
    </Column>
  );
}
