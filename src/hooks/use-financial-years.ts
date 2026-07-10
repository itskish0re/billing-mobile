import { useQuery } from '@tanstack/react-query';

import { fetchFinancialYears } from '@/lib/masters/fetch-financial-years';
import { useAuth } from '@/providers/auth-provider';

export function useFinancialYears() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['financial-years'],
    queryFn: fetchFinancialYears,
    enabled: Boolean(session),
  });
}
