import {
  Column,
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  OutlinedTextField,
  Text,
  useMaterialColors,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, menuAnchor } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useMemo, useState } from 'react';

import { MASTER_ENTITY_CONFIG } from '@/components/masters/masters-config';
import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { useMastersList } from '@/hooks/use-masters-list';

const MAX_VISIBLE_RESULTS = 40;

export type MasterLookupDropdownProps = {
  label: string;
  tab: MastersTab;
  selectedId: number | null;
  selectedLabel: string;
  required?: boolean;
  error?: string;
  onSelect: (row: MasterListRow) => void;
  onCreateRequest: (query: string) => void;
};

/**
 * Filterable master lookup. Typing filters the menu; when the query does not
 * match an existing row, a "Create new …" action is shown.
 */
export function MasterLookupDropdown({
  label,
  tab,
  selectedId,
  selectedLabel,
  required,
  error,
  onSelect,
  onCreateRequest,
}: MasterLookupDropdownProps) {
  const colors = useMaterialColors();
  const config = MASTER_ENTITY_CONFIG[tab];
  const { data = [], isLoading } = useMastersList(tab);
  const [expanded, setExpanded] = useState(false);
  const query = useNativeState(selectedLabel);
  const [filterText, setFilterText] = useState(selectedLabel);

  useEffect(() => {
    void query.set(selectedLabel);
    setFilterText(selectedLabel);
  }, [selectedLabel, query]);

  const normalizedFilter = filterText.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedFilter) {
      return data.slice(0, MAX_VISIBLE_RESULTS);
    }

    return data
      .filter((row) => {
        const haystack = [row.title, row.subtitle, row.meta].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(normalizedFilter);
      })
      .slice(0, MAX_VISIBLE_RESULTS);
  }, [data, normalizedFilter]);

  const hasExactMatch = useMemo(() => {
    if (!normalizedFilter) {
      return false;
    }
    return data.some((row) => row.title.trim().toLowerCase() === normalizedFilter);
  }, [data, normalizedFilter]);

  const showCreate = Boolean(normalizedFilter) && !hasExactMatch;
  const fieldLabel = required ? `${label} *` : label;

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 4 }}>
      <ExposedDropdownMenuBox
        expanded={expanded}
        onExpandedChange={setExpanded}
        modifiers={[fillMaxWidth()]}>
        <OutlinedTextField
          value={query}
          singleLine
          enabled={!isLoading}
          isError={Boolean(error)}
          modifiers={[fillMaxWidth(), menuAnchor()]}
          onValueChange={(text) => {
            setFilterText(text);
            if (!expanded) {
              setExpanded(true);
            }
          }}
          onFocusChanged={(focused) => {
            if (focused) {
              setExpanded(true);
            }
          }}>
          <OutlinedTextField.Label>
            <Text>{fieldLabel}</Text>
          </OutlinedTextField.Label>
          {isLoading ? (
            <OutlinedTextField.SupportingText>
              <Text color={colors.onSurfaceVariant}>Loading…</Text>
            </OutlinedTextField.SupportingText>
          ) : null}
        </OutlinedTextField>

        <ExposedDropdownMenu
          expanded={expanded}
          onDismissRequest={() => {
            setExpanded(false);
            if (selectedId != null) {
              void query.set(selectedLabel);
              setFilterText(selectedLabel);
            }
          }}>
          {filtered.map((row) => (
            <DropdownMenuItem
              key={`${tab}-${row.id}`}
              onClick={() => {
                onSelect(row);
                void query.set(row.title);
                setFilterText(row.title);
                setExpanded(false);
              }}>
              <DropdownMenuItem.Text>
                <Text>
                  {row.title}
                  {row.subtitle ? ` — ${row.subtitle}` : ''}
                </Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}

          {filtered.length === 0 && !showCreate ? (
            <DropdownMenuItem onClick={() => setExpanded(false)} enabled={false}>
              <DropdownMenuItem.Text>
                <Text>No matches</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ) : null}

          {showCreate ? (
            <DropdownMenuItem
              onClick={() => {
                const createQuery = filterText.trim();
                setExpanded(false);
                onCreateRequest(createQuery);
              }}>
              <DropdownMenuItem.Text>
                <Text>
                  {`Create new ${config.labelSingular.toLowerCase()}: “${filterText.trim()}”`}
                </Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ) : null}
        </ExposedDropdownMenu>
      </ExposedDropdownMenuBox>

      {error ? (
        <Text color={colors.error} style={{ typography: 'bodySmall' }}>
          {error}
        </Text>
      ) : null}
    </Column>
  );
}
