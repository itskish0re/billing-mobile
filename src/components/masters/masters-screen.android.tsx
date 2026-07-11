import {
  Box,
  Column,
  DockedSearchBar,
  FloatingActionButton,
  Icon,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  offset,
  padding,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useState } from 'react';

import { MASTERS_TABS } from '@/components/masters/masters-config';
import { MastersEntityList } from '@/components/masters/masters-entity-list';
import {
  MastersFormPanel,
  type MastersFormMode,
} from '@/components/masters/masters-form-panel';
import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { AppTabRow } from '@/components/ui/tab-row';
import { usePagerTabPosition } from '@/hooks/use-pager-tab-position';

const SEARCH_ICON = require('@/assets/icons/search.xml');
const ADD_ICON = require('@/assets/icons/add.xml');

export type { MastersTab };

export function MastersScreen() {
  const colors = useMaterialColors();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<MastersFormMode>('create');
  const [editingRow, setEditingRow] = useState<MasterListRow | null>(null);
  const { pagePosition, selectPage } = usePagerTabPosition(0);

  const activeTab = MASTERS_TABS[selectedIndex];
  const searchPlaceholder = `Search ${activeTab.label.toLowerCase()}`;

  useEffect(() => {
    selectPage(selectedIndex);
  }, [selectedIndex]);

  const selectTab = (index: number) => {
    selectPage(index);
    setSelectedIndex(index);
    setSearchQuery('');
    setFormVisible(false);
    setEditingRow(null);
  };

  const openCreate = () => {
    setFormMode('create');
    setEditingRow(null);
    setFormVisible(true);
  };

  const openEdit = (row: MasterListRow) => {
    setFormMode('edit');
    setEditingRow(row);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditingRow(null);
  };

  return (
    <Box modifiers={[fillMaxWidth(), weight(1)]}>
      <Column modifiers={[fillMaxSize()]} verticalArrangement={{ spacedBy: 0 }}>
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

        <MastersEntityList
          key={activeTab.id}
          tab={activeTab.id}
          searchQuery={searchQuery}
          onEdit={openEdit}
          interactionEnabled={!formVisible}
        />
      </Column>

      {!formVisible ? (
        <FloatingActionButton
          modifiers={[align('bottomEnd'), offset(-16, -16)]}
          onClick={openCreate}>
          <FloatingActionButton.Icon>
            <Icon source={ADD_ICON} size={24} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      ) : null}

      <MastersFormPanel
        tab={activeTab.id}
        visible={formVisible}
        mode={formMode}
        initialRow={editingRow}
        onClose={closeForm}
      />
    </Box>
  );
}
