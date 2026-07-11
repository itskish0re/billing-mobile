import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { MastersTab } from '@/components/masters/masters-types';
import {
  createMasterRow,
  fetchMasterRows,
  softDeleteMasterRow,
  updateMasterRow,
} from '@/lib/masters/masters-crud';
import { useAuth } from '@/providers/auth-provider';

export function mastersQueryKey(tab: MastersTab) {
  return ['masters', tab] as const;
}

export function useMastersList(tab: MastersTab) {
  const { session } = useAuth();

  return useQuery({
    queryKey: mastersQueryKey(tab),
    queryFn: () => fetchMasterRows(tab),
    enabled: Boolean(session),
  });
}

export function useMasterMutations(tab: MastersTab) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: mastersQueryKey(tab) });

  const createMutation = useMutation({
    mutationFn: (values: Record<string, string>) => createMasterRow(tab, values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Record<string, string> }) =>
      updateMasterRow(tab, id, values),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => softDeleteMasterRow(tab, id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
