import {
  Column,
  DockedSearchBar,
  HorizontalPager,
  Icon,
  Row,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
  useMaterialColors,
  type HorizontalPagerHandle,
} from '@expo/ui/jetpack-compose';
import { fillMaxSize, fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useRef } from 'react';

import { TransactionsDateFilterField } from '@/components/transactions/transactions-date-filter-field';
import { useTransactionsFilters } from '@/hooks/use-transactions-filters';

const SEARCH_ICON = require('@/assets/icons/search.xml');

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
  const colors = useMaterialColors();
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

  const activeTabIndex = activeTab === 'bills' ? 0 : 1;

  const selectTab = (tab: 'bills' | 'loads') => {
    const nextIndex = tab === 'bills' ? 0 : 1;
    setActiveTab(tab);
    void pagerRef.current?.scrollToPage(nextIndex);
  };

  return (
    <Column modifiers={[fillMaxWidth(), weight(1)]} verticalArrangement={{ spacedBy: 12 }}>
      <Row modifiers={[fillMaxWidth()]} horizontalArrangement={{ spacedBy: 12 }} verticalAlignment="top">
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
      </Row>

      <DockedSearchBar onQueryChange={setSearchQuery} modifiers={[fillMaxWidth()]}>
        <DockedSearchBar.Placeholder>
          <Text color={colors.onSurfaceVariant}>Search bills and loads</Text>
        </DockedSearchBar.Placeholder>
        <DockedSearchBar.LeadingIcon>
          <Icon source={SEARCH_ICON} size={20} tint={colors.onSurfaceVariant} />
        </DockedSearchBar.LeadingIcon>
      </DockedSearchBar>

      <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
        <SegmentedButton selected={activeTab === 'bills'} onClick={() => selectTab('bills')}>
          <SegmentedButton.Label>
            <Text>Bills</Text>
          </SegmentedButton.Label>
        </SegmentedButton>
        <SegmentedButton selected={activeTab === 'loads'} onClick={() => selectTab('loads')}>
          <SegmentedButton.Label>
            <Text>Loads</Text>
          </SegmentedButton.Label>
        </SegmentedButton>
      </SingleChoiceSegmentedButtonRow>

      <HorizontalPager
        ref={pagerRef}
        initialPage={activeTabIndex}
        modifiers={[fillMaxWidth(), weight(1)]}
        onSettledPageChange={(page) => {
          setActiveTab(page === 0 ? 'bills' : 'loads');
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
