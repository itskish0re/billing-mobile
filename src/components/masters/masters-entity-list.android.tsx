import { fillMaxSize, fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { MASTER_ENTITY_CONFIG } from '@/components/masters/masters-config';
import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { useMasterMutations, useMastersList } from '@/hooks/use-masters-list';
import { useSnackbar } from '@/providers/snackbar-provider';
import {
  MastersLazyListView,
  type MastersLazyListItemActionEvent,
} from '../../../modules/masters-lazy-list';

type MastersEntityListProps = {
  tab: MastersTab;
  searchQuery: string;
  onEdit: (row: MasterListRow) => void;
  /** Disable scroll and item actions while the form overlay is open. */
  interactionEnabled?: boolean;
};

/**
 * Uses a custom Expo UI native LazyColumn (Compose items{}) so large masters
 * lists stay virtualized without mounting one React child per row.
 */
export function MastersEntityList({
  tab,
  searchQuery,
  onEdit,
  interactionEnabled = true,
}: MastersEntityListProps) {
  const config = MASTER_ENTITY_CONFIG[tab];
  const { data = [], isLoading, isError, error, refetch, isRefetching } = useMastersList(tab);
  const { deleteMutation } = useMasterMutations(tab);
  const { showSnackbar } = useSnackbar();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data;
    }

    return data.filter((row) => {
      const haystack = [row.title, row.subtitle, row.meta].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [data, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const findRow = (id: number) =>
    filtered.find((row) => row.id === id) ?? data.find((row) => row.id === id);

  const handleDelete = (id: number) => {
    const row = findRow(id);
    if (!row) {
      return;
    }

    Alert.alert(
      `Delete ${config.labelSingular}?`,
      `"${row.title}" will be removed from the list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(row.id, {
              onSuccess: () => {
                void showSnackbar(`${config.labelSingular} deleted`, { variant: 'success' });
              },
              onError: (err) => {
                void showSnackbar(err instanceof Error ? err.message : 'Delete failed', {
                  variant: 'error',
                });
              },
            });
          },
        },
      ]
    );
  };

  const emptyMessage = searchQuery.trim()
    ? `No ${config.labelPlural.toLowerCase()} match "${searchQuery.trim()}"`
    : `No ${config.labelPlural.toLowerCase()} yet. Tap + to add one.`;

  return (
    <MastersLazyListView
      items={filtered.map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        meta: row.meta,
      }))}
      isLoading={isLoading}
      isRefreshing={isRefreshing || isRefetching}
      interactionEnabled={interactionEnabled}
      emptyMessage={emptyMessage}
      errorMessage={
        isError
          ? error instanceof Error
            ? error.message
            : `Could not load ${config.labelPlural}`
          : ''
      }
      modifiers={[fillMaxWidth(), fillMaxSize(), weight(1)]}
      onEdit={(event: MastersLazyListItemActionEvent) => {
        const row = findRow(event.id);
        if (row) {
          onEdit(row);
        }
      }}
      onDelete={(event: MastersLazyListItemActionEvent) => {
        handleDelete(event.id);
      }}
      onRefresh={() => {
        void handleRefresh();
      }}
    />
  );
}
