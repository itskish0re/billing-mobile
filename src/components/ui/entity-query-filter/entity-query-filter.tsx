import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@expo/ui';

import type { QueryFilterClause, QueryFilterField } from '@/types/entity-query-filter';
import { createQueryFilterClause } from '@/types/entity-query-filter';

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

export function EntityQueryFilter({
  fields,
  value,
  onChange,
  onSave,
  isSaving = false,
}: EntityQueryFilterProps) {
  const usedCount = value.filter((clause) => clause.fieldKey).length;
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
    <View style={styles.container}>
      {value.map((clause) => {
        const selected = fields.find((field) => field.key === clause.fieldKey);
        const options = availableFields(fields, value, clause.id);

        return (
          <View key={clause.id} style={styles.row}>
            <View style={styles.field}>
              {selected ? (
                <TextInput
                  style={styles.input}
                  value={clause.value}
                  editable={!isSaving}
                  placeholder={selected.label}
                  onChangeText={(text) => updateClause(clause.id, { value: text })}
                />
              ) : (
                <View style={styles.options}>
                  {options.map((field) => (
                    <Pressable
                      key={field.key}
                      disabled={isSaving}
                      onPress={() => updateClause(clause.id, { fieldKey: field.key, value: '' })}>
                      <Text style={styles.option}>{field.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            <Pressable disabled={isSaving} onPress={() => removeClause(clause.id)} hitSlop={8}>
              <Text>Delete</Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.actions}>
        <Button label="Add Filter" variant="outlined" disabled={!canAdd} onPress={addClause} />
        <Button
          label={isSaving ? 'Saving…' : 'Save'}
          disabled={isSaving}
          onPress={() => {
            onSave();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  field: {
    flex: 1,
  },
  options: {
    gap: 4,
  },
  option: {
    paddingVertical: 8,
  },
  input: {
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#c4c7cf',
    paddingVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
