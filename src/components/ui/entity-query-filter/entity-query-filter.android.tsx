import {
  Box,
  Button,
  Column,
  Icon,
  OutlinedButton,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  clip,
  clickable,
  fillMaxWidth,
  padding,
  Shapes,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useMemo } from 'react';

import { FormTextField } from '@/components/ui/form-fields';
import type { QueryFilterClause, QueryFilterField } from '@/types/entity-query-filter';
import { createQueryFilterClause } from '@/types/entity-query-filter';
import {
  FilterableDropdownView,
  type FilterableDropdownItemPressedEvent,
} from '../../../../modules/filterable-dropdown';

const DELETE_ICON = require('@/assets/icons/delete.xml');

export type EntityQueryFilterProps = {
  fields: QueryFilterField[];
  value: QueryFilterClause[];
  onChange: (next: QueryFilterClause[]) => void;
  onSave: () => void;
  isSaving?: boolean;
};

function availableFields(
  fields: QueryFilterField[],
  clauses: QueryFilterClause[],
  clauseId: string
): QueryFilterField[] {
  const used = new Set(
    clauses
      .filter((clause) => clause.id !== clauseId && clause.fieldKey)
      .map((clause) => clause.fieldKey as string)
  );
  return fields.filter((field) => !used.has(field.key));
}

function DeleteAction({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  const colors = useMaterialColors();

  return (
    <Box
      modifiers={[
        clip(Shapes.Circle),
        ...(enabled ? [clickable(onClick)] : []),
        padding(4, 4, 4, 4),
      ]}>
      <Icon source={DELETE_ICON} size={20} tint={enabled ? colors.error : colors.onSurfaceVariant} />
    </Box>
  );
}

/**
 * Controlled field query builder: unselected rows are a dropdown of remaining
 * fields; selecting one turns that row into a labelled input.
 */
export function EntityQueryFilter({
  fields,
  value,
  onChange,
  onSave,
  isSaving = false,
}: EntityQueryFilterProps) {
  const usedCount = value.filter((clause) => Boolean(clause.fieldKey)).length;
  const hasPending = value.some((clause) => !clause.fieldKey);
  const canAdd = !isSaving && !hasPending && usedCount < fields.length;

  const updateClause = (id: string, patch: Partial<QueryFilterClause>) => {
    onChange(value.map((clause) => (clause.id === id ? { ...clause, ...patch } : clause)));
  };

  const removeClause = (id: string) => {
    onChange(value.filter((clause) => clause.id !== id));
  };

  const addClause = () => {
    if (!canAdd) {
      return;
    }
    onChange([...value, createQueryFilterClause()]);
  };

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 12 }}>
      {value.map((clause) => (
        <FilterClauseRow
          key={clause.id}
          clause={clause}
          fields={fields}
          options={availableFields(fields, value, clause.id)}
          enabled={!isSaving}
          onSelectField={(fieldKey) => updateClause(clause.id, { fieldKey, value: '' })}
          onChangeValue={(nextValue) => updateClause(clause.id, { value: nextValue })}
          onDelete={() => removeClause(clause.id)}
        />
      ))}

      <Row
        modifiers={[fillMaxWidth()]}
        horizontalArrangement="end"
        verticalAlignment="center">
        <Column modifiers={[weight(1)]} />
        <Row horizontalArrangement={{ spacedBy: 8 }} verticalAlignment="center">
          <OutlinedButton enabled={canAdd} onClick={addClause}>
            <Text>Add Filter</Text>
          </OutlinedButton>
          <Button
            enabled={!isSaving}
            onClick={() => {
              onSave();
            }}>
            <Text>{isSaving ? 'Saving…' : 'Save'}</Text>
          </Button>
        </Row>
      </Row>
    </Column>
  );
}

function FilterClauseRow({
  clause,
  fields,
  options,
  enabled,
  onSelectField,
  onChangeValue,
  onDelete,
}: {
  clause: QueryFilterClause;
  fields: QueryFilterField[];
  options: QueryFilterField[];
  enabled: boolean;
  onSelectField: (fieldKey: string) => void;
  onChangeValue: (value: string) => void;
  onDelete: () => void;
}) {
  const selected = fields.find((field) => field.key === clause.fieldKey);
  const items = useMemo(
    () => options.map((field) => ({ id: field.id, title: field.label })),
    [options]
  );

  return (
    <Row
      modifiers={[fillMaxWidth()]}
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}>
      {selected ? (
        <FormTextField
          key={`${clause.id}-${selected.key}`}
          label={selected.label}
          compact
          initialText={clause.value}
          enabled={enabled}
          onChangeText={onChangeValue}
        />
      ) : (
        <Column modifiers={[weight(1), fillMaxWidth()]}>
          <FilterableDropdownView
            label="Field"
            value=""
            items={items}
            allowCreate={false}
            enabled={enabled && items.length > 0}
            modifiers={[fillMaxWidth()]}
            onItemPressed={(event: FilterableDropdownItemPressedEvent) => {
              const field = options.find((item) => item.id === event.id);
              if (field) {
                onSelectField(field.key);
              }
            }}
          />
        </Column>
      )}
      <DeleteAction enabled={enabled} onClick={onDelete} />
    </Row>
  );
}
