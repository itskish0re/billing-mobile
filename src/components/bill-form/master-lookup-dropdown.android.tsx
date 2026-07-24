import { Column, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useMemo } from 'react';

import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { useMastersList } from '@/hooks/use-masters-list';
import {
  FilterableDropdownView,
  type FilterableDropdownCreatePressedEvent,
  type FilterableDropdownItemPressedEvent,
} from '../../../modules/filterable-dropdown';

export type MasterLookupDropdownProps = {
  label: string;
  tab: MastersTab;
  selectedId: number | null;
  selectedLabel: string;
  required?: boolean;
  error?: string;
  onSelect: (row: MasterListRow) => void;
  onCreateRequest: (query: string) => void;
  onClear?: () => void;
};

/**
 * Filterable master lookup backed by a native Material3 ExposedDropdownMenuBox
 * (type-to-search + popup). Filtering runs in Compose so focus stays while typing.
 */
export function MasterLookupDropdown({
  label,
  tab,
  selectedLabel,
  required,
  error,
  onSelect,
  onCreateRequest,
  onClear,
}: MasterLookupDropdownProps) {
  const colors = useMaterialColors();
  const { data = [], isLoading } = useMastersList(tab);

  const items = useMemo(
    () =>
      data.map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
      })),
    [data]
  );

  const fieldLabel = required ? `${label} *` : label;

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 4 }}>
      <FilterableDropdownView
        label={fieldLabel}
        value={selectedLabel}
        items={items}
        isLoading={isLoading}
        isError={Boolean(error)}
        allowCreate
        modifiers={[fillMaxWidth()]}
        onItemPressed={(event: FilterableDropdownItemPressedEvent) => {
          const row = data.find((item) => item.id === event.id);
          if (row) {
            onSelect(row);
            return;
          }
          onSelect({
            id: event.id,
            title: event.title,
            subtitle: event.subtitle || undefined,
            values: {},
          });
        }}
        onCreatePressed={(event: FilterableDropdownCreatePressedEvent) => {
          onCreateRequest(event.query);
        }}
        onCleared={onClear}
      />

      {error ? (
        <Text color={colors.error} style={{ typography: 'bodySmall' }}>
          {error}
        </Text>
      ) : null}
    </Column>
  );
}
