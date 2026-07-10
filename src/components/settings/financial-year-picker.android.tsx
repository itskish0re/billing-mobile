import {
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  OutlinedTextField,
  Text,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, menuAnchor } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useState } from 'react';

import { useFinancialYears } from '@/hooks/use-financial-years';
import { useSnackbar } from '@/providers/snackbar-provider';
import { useAppStore } from '@/stores/app-store';
import type { FinancialYear } from '@/types/financial-year';

export function FinancialYearPicker() {
  const { data: financialYears, isLoading } = useFinancialYears();
  const activeFinancialYearId = useAppStore((state) => state.activeFinancialYearId);
  const activeFinancialYearLabel = useAppStore((state) => state.activeFinancialYearLabel);
  const setActiveFinancialYear = useAppStore((state) => state.setActiveFinancialYear);
  const { showSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState(false);
  const displayValue = useNativeState(activeFinancialYearLabel ?? '');

  useEffect(() => {
    void displayValue.set(activeFinancialYearLabel ?? '');
  }, [activeFinancialYearLabel, displayValue]);

  const handleSelect = async (year: FinancialYear) => {
    setActiveFinancialYear(year.financial_year_id, year.name);
    void displayValue.set(year.name);
    setExpanded(false);
    await showSnackbar(`Financial year set to ${year.name}`);
  };

  return (
    <ExposedDropdownMenuBox
      expanded={expanded}
      onExpandedChange={setExpanded}
      modifiers={[fillMaxWidth()]}>
      <OutlinedTextField
        value={displayValue}
        readOnly
        singleLine
        enabled={!isLoading && Boolean(financialYears?.length)}
        modifiers={[fillMaxWidth(), menuAnchor()]}>
        <OutlinedTextField.Label>
          <Text>Financial year</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <ExposedDropdownMenu expanded={expanded} onDismissRequest={() => setExpanded(false)}>
        {financialYears?.map((year) => (
          <DropdownMenuItem
            key={year.financial_year_id}
            onClick={() => {
              void handleSelect(year);
            }}>
            <DropdownMenuItem.Text>
              <Text>
                {year.name}
                {year.financial_year_id === activeFinancialYearId ? ' (selected)' : ''}
              </Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </ExposedDropdownMenu>
    </ExposedDropdownMenuBox>
  );
}
