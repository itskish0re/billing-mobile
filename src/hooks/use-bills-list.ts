import { useQuery } from '@tanstack/react-query';

import { fetchBillList } from '@/lib/bills/bills-crud';
import { useAuth } from '@/providers/auth-provider';
import { useAppStore } from '@/stores/app-store';

export type UseBillsListParams = {
  filterQuery?: string;
  enabled?: boolean;
};

export function billsListQueryKey(financialYearId: number | null, filterQuery: string) {
  return ['bills', financialYearId, filterQuery] as const;
}

export function useBillsList({ filterQuery = '', enabled = true }: UseBillsListParams) {
  const { session } = useAuth();
  const financialYearId = useAppStore((state) => state.activeFinancialYearId);

  return useQuery({
    queryKey: billsListQueryKey(financialYearId, filterQuery),
    queryFn: () =>
      fetchBillList({
        financialYearId: financialYearId as number,
        filterQuery,
      }),
    enabled: Boolean(session) && financialYearId != null && enabled,
  });
}
