import { useQuery } from '@tanstack/react-query';

import { fetchNextBillNumber } from '@/lib/bills/fetch-next-bill-number';
import { useAuth } from '@/providers/auth-provider';
import { useAppStore } from '@/stores/app-store';

export function useNextBillNumber() {
  const { session } = useAuth();
  const financialYearId = useAppStore((state) => state.activeFinancialYearId);

  return useQuery({
    queryKey: ['next-bill-number', financialYearId],
    queryFn: () => fetchNextBillNumber(financialYearId!),
    enabled: Boolean(session && financialYearId != null),
  });
}
