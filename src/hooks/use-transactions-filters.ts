import { useCallback, useMemo, useState } from 'react';

import { validateTransactionsDateFilter } from '@/lib/validation/transactions-date-filter-schema';

export type TransactionsTab = 'bills' | 'loads';

function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function useTransactionsFilters() {
  const [startDate, setStartDateState] = useState<Date | null>(() => getMonthStart());
  const [endDate, setEndDateState] = useState<Date | null>(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TransactionsTab>('bills');

  const setStartDate = useCallback((date: Date) => {
    setStartDateState(date);
  }, []);

  const setEndDate = useCallback((date: Date) => {
    setEndDateState(date);
  }, []);

  const dateValidation = useMemo(
    () => validateTransactionsDateFilter(startDate, endDate),
    [startDate, endDate]
  );

  const fieldErrors = dateValidation.success ? {} : dateValidation.fieldErrors;
  const isDateRangeValid = dateValidation.success;

  const clearStartDate = useCallback(() => {
    setStartDateState(null);
  }, []);

  const clearEndDate = useCallback(() => {
    setEndDateState(null);
  }, []);

  return {
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
  };
}
