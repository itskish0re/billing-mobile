import {
  Column,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { fillMaxSize, fillMaxWidth, padding, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  MastersLazyListView,
  type MastersLazyListItem,
} from '../../../modules/masters-lazy-list';

function buildSampleItems(count: number): MastersLazyListItem[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return {
      id,
      title: `Sample item ${id}`,
      subtitle: id % 3 === 0 ? `Subtitle for #${id}` : undefined,
      meta: id % 2 === 0 ? `Meta ${id}` : undefined,
    };
  });
}

/**
 * Smoke test for the native MastersLazyListView module.
 * Verify: scroll (100 rows), pull-to-refresh, Edit / Delete actions.
 */
export function HomeScreen() {
  const colors = useMaterialColors();
  const [items, setItems] = useState(() => buildSampleItems(100));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const emptyMessage = useMemo(
    () => (items.length === 0 ? 'No sample items. Pull to refresh to restore.' : ''),
    [items.length]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setItems(buildSampleItems(100));
      setIsRefreshing(false);
    }, 600);
  }, []);

  return (
    <Column modifiers={[fillMaxSize()]} verticalArrangement={{ spacedBy: 0 }}>
      <Column modifiers={[fillMaxWidth(), padding(16, 12, 16, 8)]}>
        <Text style={{ typography: 'titleMedium' }}>MastersLazyListView sample</Text>
        <Text color={colors.onSurfaceVariant} style={{ typography: 'bodySmall' }}>
          Scroll, pull to refresh, Edit / Delete. Native module smoke test.
        </Text>
      </Column>

      <MastersLazyListView
        items={items}
        isRefreshing={isRefreshing}
        emptyMessage={emptyMessage}
        modifiers={[fillMaxWidth(), fillMaxSize(), weight(1)]}
        onEdit={({ id }) => {
          const item = items.find((row) => row.id === id);
          Alert.alert('Edit', item ? `Edit “${item.title}”` : `Edit id ${id}`);
        }}
        onDelete={({ id }) => {
          Alert.alert('Delete', `Remove item #${id}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setItems((current) => current.filter((row) => row.id !== id));
              },
            },
          ]);
        }}
        onRefresh={handleRefresh}
      />
    </Column>
  );
}
