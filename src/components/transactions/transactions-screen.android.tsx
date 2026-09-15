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
import { EntityQueryFilter } from '@/components/ui/entity-query-filter';
import { AppTabRow, type AppTabItem } from '@/components/ui/tab-row';
import { useTransactionsFilters, type TransactionsTab } from '@/hooks/use-transactions-filters';
import { useUserEntityFilter } from '@/hooks/use-user-entity-filter';
import { mapBillListRowToForm } from '@/lib/bills/map-bill-to-form';
import { mapBillListRowToPreview } from '@/lib/bills/bill-preview';
import { useBillForm } from '@/providers/bill-form-provider';
import { useBillPreview } from '@/providers/bill-preview-provider';
import { useSnackbar } from '@/providers/snackbar-provider';
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
  const { showSnackbar } = useSnackbar();
  const {
    activeTab,
    setActiveTab,
  } = useTransactionsFilters();
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
    appliedQuery,
    isReady: filtersReady,
    isSaving: isFilterSaving,
    save: saveFilters,
  } = useUserEntityFilter('bill');

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

        <TransactionsFilterAccordion
          extra={
            activeTab === 'bills' && filtersReady ? (
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
            filterQuery={appliedQuery}
            filtersReady={filtersReady}
            onEdit={handleEditBill}
            onPreview={handlePreviewBill}
          />
          <TransactionListPlaceholder title="Loads will appear here" />
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
