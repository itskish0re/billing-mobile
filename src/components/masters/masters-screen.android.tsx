import {
  Column,
  DockedSearchBar,
  HorizontalPager,
  Icon,
  Text,
  useMaterialColors,
  type HorizontalPagerHandle,
} from '@expo/ui/jetpack-compose';
import { fillMaxSize, fillMaxWidth, padding, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useRef, useState } from 'react';

import { AppTabRow, type AppTabItem } from '@/components/ui/tab-row';
import { usePagerTabPosition } from '@/hooks/use-pager-tab-position';

const SEARCH_ICON = require('@/assets/icons/search.xml');

export type MastersTab =
  | 'name-boards'
  | 'trucks'
  | 'locations'
  | 'parties'
  | 'goods'
  | 'units'
  | 'financial-years';

const MASTERS_TABS: AppTabItem<MastersTab>[] = [
  { id: 'name-boards', label: 'Name boards' },
  { id: 'trucks', label: 'Trucks' },
  { id: 'locations', label: 'Locations' },
  { id: 'parties', label: 'Parties' },
  { id: 'goods', label: 'Goods' },
  { id: 'units', label: 'Units' },
  { id: 'financial-years', label: 'Financial years' },
];

function MastersListPlaceholder({ title }: { title: string }) {
  const colors = useMaterialColors();

  return (
    <Column
      modifiers={[fillMaxSize()]}
      horizontalAlignment="center"
      verticalArrangement="center">
      <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyLarge' }}>
        {title}
      </Text>
    </Column>
  );
}

export function MastersScreen() {
  const colors = useMaterialColors();
  const pagerRef = useRef<HorizontalPagerHandle>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { pagePosition, handlePageScroll, handleSettledPage, selectPage } = usePagerTabPosition(0);

  const activeTab = MASTERS_TABS[selectedIndex];
  const searchPlaceholder = `Search ${activeTab.label.toLowerCase()}`;

  const selectTab = (index: number) => {
    selectPage(index);
    setSelectedIndex(index);
    setSearchQuery('');
    void pagerRef.current?.animateScrollToPage(index);
  };

  return (
    <Column modifiers={[fillMaxWidth(), weight(1)]} verticalArrangement={{ spacedBy: 0 }}>
      <AppTabRow
        tabs={MASTERS_TABS}
        selectedIndex={selectedIndex}
        pagePosition={pagePosition}
        onTabSelected={selectTab}
      />

      <Column modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}>
        <DockedSearchBar onQueryChange={setSearchQuery} modifiers={[fillMaxWidth()]}>
          <DockedSearchBar.Placeholder>
            <Text color={colors.onSurfaceVariant}>{searchPlaceholder}</Text>
          </DockedSearchBar.Placeholder>
          <DockedSearchBar.LeadingIcon>
            <Icon source={SEARCH_ICON} size={20} tint={colors.onSurfaceVariant} />
          </DockedSearchBar.LeadingIcon>
        </DockedSearchBar>
      </Column>

      <HorizontalPager
        ref={pagerRef}
        initialPage={selectedIndex}
        modifiers={[fillMaxWidth(), weight(1)]}
        onPageScroll={handlePageScroll}
        onCurrentPageChange={setSelectedIndex}
        onSettledPageChange={(page) => {
          setSelectedIndex(page);
          handleSettledPage(page);
        }}>
        {MASTERS_TABS.map((tab) => (
          <MastersListPlaceholder
            key={tab.id}
            title={
              searchQuery
                ? `No ${tab.label.toLowerCase()} match "${searchQuery}"`
                : `${tab.label} will appear here`
            }
          />
        ))}
      </HorizontalPager>
    </Column>
  );
}
