import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BILL_FILTER_FIELDS } from '@/lib/filters/bill-filter-fields';
import {
  clausesOrDefault,
  parseFilterQuery,
  serializeFilterQuery,
} from '@/lib/filters/filter-query';
import { fetchUserFilter, saveUserFilter } from '@/lib/filters/user-filters';
import { validateTransactionsDateFilter } from '@/lib/validation/transactions-date-filter-schema';
import { useAuth } from '@/providers/auth-provider';
import type {
  QueryFilterClause,
  QueryFilterField,
  UserFilterEntity,
} from '@/types/entity-query-filter';

const ENTITY_FIELDS: Record<UserFilterEntity, QueryFilterField[]> = {
  bill: BILL_FILTER_FIELDS,
};

function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function userFilterQueryKey(userId: string | undefined, entity: UserFilterEntity) {
  return ['user-filters', userId ?? null, entity] as const;
}

export function useUserEntityFilter(entity: UserFilterEntity) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;
  const fields = ENTITY_FIELDS[entity];
  const hydratedForUser = useRef<string | null>(null);

  const [clauses, setClauses] = useState<QueryFilterClause[]>(() => clausesOrDefault([]));
  const [startDate, setStartDateState] = useState<Date | null>(() => getMonthStart());
  const [endDate, setEndDateState] = useState<Date | null>(() => new Date());
  const [appliedQuery, setAppliedQuery] = useState('');

  const filterQuery = useQuery({
    queryKey: userFilterQueryKey(userId, entity),
    queryFn: () => fetchUserFilter(userId as string, entity),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!userId) {
      hydratedForUser.current = null;
      setClauses(clausesOrDefault([]));
      setStartDateState(getMonthStart());
      setEndDateState(new Date());
      setAppliedQuery('');
      return;
    }

    if (!filterQuery.isFetched || hydratedForUser.current === userId) {
      return;
    }

    const saved = filterQuery.data?.filterQuery ?? '';
    if (saved) {
      const parsed = parseFilterQuery(saved, fields);
      setClauses(clausesOrDefault(parsed.clauses));
      setStartDateState(parsed.startDate);
      setEndDateState(parsed.endDate);
      setAppliedQuery(saved);
    } else {
      const nextStart = getMonthStart();
      const nextEnd = new Date();
      setClauses(clausesOrDefault([]));
      setStartDateState(nextStart);
      setEndDateState(nextEnd);
      setAppliedQuery(
        serializeFilterQuery([], { startDate: nextStart, endDate: nextEnd })
      );
    }
    hydratedForUser.current = userId;
  }, [fields, filterQuery.data?.filterQuery, filterQuery.isFetched, userId]);

  const dateValidation = useMemo(
    () => validateTransactionsDateFilter(startDate, endDate),
    [startDate, endDate]
  );
  const fieldErrors = dateValidation.success ? {} : dateValidation.fieldErrors;
  const isDateRangeValid = dateValidation.success;

  const saveMutation = useMutation({
    mutationFn: (filterQueryValue: string) => {
      if (!userId) {
        throw new Error('Sign in to save filters.');
      }
      return saveUserFilter({
        userId,
        entity,
        filterQuery: filterQueryValue,
      });
    },
    onSuccess: (row) => {
      setAppliedQuery(row.filterQuery);
      queryClient.setQueryData(userFilterQueryKey(userId, entity), row);
      void queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });

  const setStartDate = useCallback((date: Date) => {
    setStartDateState(date);
  }, []);

  const setEndDate = useCallback((date: Date) => {
    setEndDateState(date);
  }, []);

  const clearStartDate = useCallback(() => {
    setStartDateState(null);
  }, []);

  const clearEndDate = useCallback(() => {
    setEndDateState(null);
  }, []);

  const save = useCallback(async () => {
    if (!isDateRangeValid) {
      throw new Error('Fix the date range before saving.');
    }

    const nextQuery = serializeFilterQuery(clauses, { startDate, endDate });
    await saveMutation.mutateAsync(nextQuery);
    return nextQuery;
  }, [clauses, endDate, isDateRangeValid, saveMutation, startDate]);

  return {
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
    isDateRangeValid,
    appliedQuery,
    isReady: !userId || (filterQuery.isFetched && hydratedForUser.current === userId),
    isSaving: saveMutation.isPending,
    save,
  };
}
