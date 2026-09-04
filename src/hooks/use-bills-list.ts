import { useQuery } from '@tanstack/react-query';

import { toIsoDate } from '@/lib/bills/bill-form';
import { fetchBillList } from '@/lib/bills/bills-crud';
import { useAuth } from '@/providers/auth-provider';
import { useAppStore } from '@/stores/app-store';

export type UseBillsListParams = {
  startDate: Date | null;
  endDate: Date | null;
  /** Skip fetching while the date range is invalid (end before start). */
  enabled?: boolean;
};

export function billsListQueryKey(
  financialYearId: number | null,
  startIso: string | null,
  endIso: string | null
) {
  return ['bills', financialYearId, startIso, endIso] as const;
}

export function useBillsList({ startDate, endDate, enabled = true }: UseBillsListParams) {
  const { session } = useAuth();
  const financialYearId = useAppStore((state) => state.activeFinancialYearId);

  const startIso = startDate ? toIsoDate(startDate) : null;
  const endIso = endDate ? toIsoDate(endDate) : null;

  return useQuery({
    queryKey: billsListQueryKey(financialYearId, startIso, endIso),
    queryFn: () =>
      fetchBillList({
        financialYearId: financialYearId as number,
        startDate: startIso,
        endDate: endIso,
      }),
    enabled: Boolean(session) && financialYearId != null && enabled,
  });
}
