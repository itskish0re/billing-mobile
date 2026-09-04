import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveBill } from '@/lib/bills/bills-crud';
import { useAuth } from '@/providers/auth-provider';
import { useAppStore } from '@/stores/app-store';
import type { BillFormValues, BillLoadFormLine } from '@/types/bill-form';

export type SaveBillInput = {
  values: BillFormValues;
  loads: BillLoadFormLine[];
};

export function useBillMutations() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const financialYearId = useAppStore((state) => state.activeFinancialYearId);

  const invalidateLists = () => {
    void queryClient.invalidateQueries({ queryKey: ['bills'] });
    void queryClient.invalidateQueries({ queryKey: ['next-bill-number'] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ values, loads }: SaveBillInput) => {
      if (financialYearId == null) {
        throw new Error('Select a financial year before saving a bill.');
      }

      return saveBill({
        values,
        loads,
        financialYearId,
        userId: session?.user.id ?? null,
      });
    },
    onSuccess: invalidateLists,
  });

  return { saveMutation };
}
