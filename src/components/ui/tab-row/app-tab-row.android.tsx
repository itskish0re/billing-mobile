import {
  Column,
  HorizontalDivider,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';

import type { AppTabItem } from '@/components/ui/tab-row/types';
import type { PagerTabPosition } from '@/hooks/use-pager-tab-position';
import { ScrollableTabRowView } from '../../../../modules/scrollable-tab-row';

type AppTabRowProps<T extends string> = {
  tabs: AppTabItem<T>[];
  selectedIndex: number;
  pagePosition: PagerTabPosition;
  onTabSelected: (index: number, tab: AppTabItem<T>) => void;
};

export function AppTabRow<T extends string>({
  tabs,
  selectedIndex,
  pagePosition,
  onTabSelected,
}: AppTabRowProps<T>) {
  const colors = useMaterialColors();

  return (
    <Column modifiers={[fillMaxWidth()]}>
      <ScrollableTabRowView
        tabs={tabs}
        selectedIndex={selectedIndex}
        pagePosition={pagePosition}
        selectedColor={colors.primary}
        unselectedColor={colors.onSurfaceVariant}
        indicatorColor={colors.primary}
        modifiers={[fillMaxWidth()]}
        onTabSelected={({ index }) => {
          const tab = tabs[index];
          if (tab) {
            onTabSelected(index, tab);
          }
        }}
      />
      <HorizontalDivider thickness={1} color={colors.outlineVariant} />
    </Column>
  );
}
