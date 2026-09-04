import {
  Box,
  Column,
  FloatingActionButton,
  HorizontalPager,
  Icon,
  Text,
  useMaterialColors,
  type HorizontalPagerHandle,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  offset,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useRef } from 'react';

import { BillsList } from '@/components/transactions/bills-list';
import { TransactionsDateFilterField } from '@/components/transactions/transactions-date-filter-field';
import { TransactionsFilterAccordion } from '@/components/transactions/transactions-filter-accordion';
import { AppTabRow, type AppTabItem } from '@/components/ui/tab-row';
import { useTransactionsFilters, type TransactionsTab } from '@/hooks/use-transactions-filters';
import { mapBillListRowToForm } from '@/lib/bills/map-bill-to-form';
import { mapBillListRowToPreview } from '@/lib/bills/bill-preview';
import { useBillForm } from '@/providers/bill-form-provider';
import { useBillPreview } from '@/providers/bill-preview-provider';
import type { BillListRow } from '@/types/bill-list';

const ADD_ICON = require('@/assets/icons/add.xml');

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
  const { openCreate, openEdit, isOpen: billFormOpen } = useBillForm();
  const { open: openPreview } = useBillPreview();
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
    isDateRangeValid,
    setSearchQuery,
    setActiveTab,
  } = useTransactionsFilters();

  const selectedIndex = activeTab === 'bills' ? 0 : 1;

  const handleEditBill = (row: BillListRow) => {
    openEdit(mapBillListRowToForm(row));
  };

  const handlePreviewBill = (row: BillListRow) => {
    openPreview(mapBillListRowToPreview(row));
  };

  const selectTab = (index: number, tab: AppTabItem<TransactionsTab>) => {
    setActiveTab(tab.id);
    void pagerRef.current?.animateScrollToPage(index);
  };

  const showBillFab = activeTab === 'bills' && !billFormOpen;

  return (
    <Box modifiers={[fillMaxWidth(), weight(1)]}>
      <Column modifiers={[fillMaxWidth(), weight(1)]} verticalArrangement={{ spacedBy: 0 }}>
        <AppTabRow
          tabs={TRANSACTION_TABS}
          selectedIndex={selectedIndex}
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
          userScrollEnabled={false}
          modifiers={[fillMaxWidth(), weight(1)]}
          onCurrentPageChange={(page) => {
            setActiveTab(page === 0 ? 'bills' : 'loads');
          }}
          onSettledPageChange={(page) => {
            setActiveTab(page === 0 ? 'bills' : 'loads');
          }}>
          <BillsList
            searchQuery={searchQuery}
            startDate={startDate}
            endDate={endDate}
            isDateRangeValid={isDateRangeValid}
            onEdit={handleEditBill}
            onPreview={handlePreviewBill}
          />
          <TransactionListPlaceholder
            title={searchQuery ? `No loads match "${searchQuery}"` : 'Loads will appear here'}
          />
        </HorizontalPager>
      </Column>

      {showBillFab ? (
        <FloatingActionButton
          modifiers={[align('bottomEnd'), offset(-16, -16)]}
          onClick={openCreate}>
          <FloatingActionButton.Icon>
            <Icon source={ADD_ICON} size={24} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      ) : null}
    </Box>
  );
}
