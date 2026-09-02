import { Column, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useMemo } from 'react';

import { useFinancialYears } from '@/hooks/use-financial-years';
import { useSnackbar } from '@/providers/snackbar-provider';
import { useAppStore } from '@/stores/app-store';
import type { FinancialYear } from '@/types/financial-year';
import {
  FilterableDropdownView,
  type FilterableDropdownItemPressedEvent,
} from '../../../modules/filterable-dropdown';

/**
 * Financial-year selector. Uses the native filterable dropdown — Expo UI's
 * ExposedDropdownMenuBox + menuAnchor() crashes because menuAnchor is applied
 * on a nested Box that is not in the same Compose scope.
 */
export function FinancialYearPicker() {
  const colors = useMaterialColors();
  const { data: financialYears, isLoading, isError } = useFinancialYears();
  const activeFinancialYearLabel = useAppStore((state) => state.activeFinancialYearLabel);
  const setActiveFinancialYear = useAppStore((state) => state.setActiveFinancialYear);
  const { showSnackbar } = useSnackbar();

  const items = useMemo(
    () =>
      (financialYears ?? []).map((year) => ({
        id: year.financial_year_id,
        title: year.name,
        subtitle: year.code,
      })),
    [financialYears]
  );

  const handleSelect = async (year: FinancialYear) => {
    setActiveFinancialYear(year.financial_year_id, year.name);
    await showSnackbar(`Financial year set to ${year.name}`, { variant: 'success' });
  };

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 4 }}>
      <FilterableDropdownView
        label="Financial year"
        value={activeFinancialYearLabel ?? ''}
        items={items}
        isLoading={isLoading}
        isError={isError}
        allowCreate={false}
        enabled={!isLoading && items.length > 0}
        modifiers={[fillMaxWidth()]}
        onItemPressed={(event: FilterableDropdownItemPressedEvent) => {
          const year = financialYears?.find((item) => item.financial_year_id === event.id);
          if (year) {
            void handleSelect(year);
          }
        }}
      />
      {isError ? (
        <Text color={colors.error} style={{ typography: 'bodySmall' }}>
          Could not load financial years
        </Text>
      ) : null}
    </Column>
  );
}
