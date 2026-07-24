import {
  Box,
  Button,
  Column,
  Icon,
  IconButton,
  OutlinedTextField,
  Row,
  Spacer,
  Text,
  useMaterialColors,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import {
  background,
  clickable,
  fillMaxHeight,
  fillMaxSize,
  fillMaxWidth,
  padding,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useMemo, useRef, useState } from 'react';

import { MasterLookupDropdown } from '@/components/bill-form/master-lookup-dropdown';
import { MASTER_ENTITY_CONFIG } from '@/components/masters/masters-config';
import type {
  MasterFormField,
  MasterListRow,
  MastersTab,
} from '@/components/masters/masters-types';
import { useMasterMutations } from '@/hooks/use-masters-list';
import { useSnackbar } from '@/providers/snackbar-provider';

const CLOSE_ICON = require('@/assets/icons/close.xml');

export type MastersFormMode = 'create' | 'edit';

/** `side` = masters slide-over (~88%). `full` reserved; bill form uses its own panel. */
export type MastersFormPresentation = 'side' | 'full';

export type MastersFormPanelProps = {
  tab: MastersTab;
  visible: boolean;
  mode: MastersFormMode;
  initialRow?: MasterListRow | null;
  /** Prefill create-mode fields (e.g. name from bill lookup query). */
  createDefaults?: Record<string, string> | null;
  /** Default `side`. Use when stacking over the bill form. */
  presentation?: MastersFormPresentation;
  onClose: () => void;
  /** Called after a successful create/update (before snackbar). */
  onSaved?: (row?: MasterListRow) => void;
};

type FieldState = {
  get: () => string;
  set: (value: string) => void;
};

type NestedLookupCreate = {
  tab: MastersTab;
  fieldKey: string;
  defaults: Record<string, string>;
};

function suggestCodeFromName(name: string) {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24);
  return slug || 'NEW';
}

function MasterFormFieldInput({
  field,
  initialValue,
  error,
  enabled,
  onRegister,
}: {
  field: MasterFormField;
  initialValue: string;
  error?: string;
  enabled: boolean;
  onRegister: (key: string, state: FieldState) => void;
}) {
  const colors = useMaterialColors();
  const value = useNativeState(initialValue);
  /** JS-thread mirror — useNativeState.get() is unreliable for Save validation. */
  const mirrorRef = useRef(initialValue);

  onRegister(field.key, {
    get: () => mirrorRef.current,
    set: (next) => {
      mirrorRef.current = next;
      void value.set(next);
    },
  });

  useEffect(() => {
    mirrorRef.current = initialValue;
    void value.set(initialValue);
  }, [initialValue, value]);

  return (
    <OutlinedTextField
      value={value}
      singleLine
      enabled={enabled}
      isError={Boolean(error)}
      modifiers={[fillMaxWidth()]}
      onValueChange={(text) => {
        mirrorRef.current = text;
      }}>
      <OutlinedTextField.Label>
        <Text>
          {field.label}
          {field.required ? ' *' : ''}
        </Text>
      </OutlinedTextField.Label>
      {error ? (
        <OutlinedTextField.SupportingText>
          <Text color={colors.error}>{error}</Text>
        </OutlinedTextField.SupportingText>
      ) : field.supportingText ? (
        <OutlinedTextField.SupportingText>
          <Text color={colors.onSurfaceVariant}>{field.supportingText}</Text>
        </OutlinedTextField.SupportingText>
      ) : null}
    </OutlinedTextField>
  );
}

function MasterFormLookupField({
  field,
  initialId,
  initialLabel,
  error,
  enabled,
  onRegister,
  onCreateRequest,
}: {
  field: MasterFormField;
  initialId: string;
  initialLabel: string;
  error?: string;
  enabled: boolean;
  onRegister: (key: string, state: FieldState) => void;
  onCreateRequest: (query: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    initialId ? Number(initialId) : null
  );
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);
  const idRef = useRef(initialId);

  onRegister(field.key, {
    get: () => idRef.current,
    set: (next) => {
      idRef.current = next;
      setSelectedId(next ? Number(next) : null);
    },
  });

  useEffect(() => {
    idRef.current = initialId;
    setSelectedId(initialId ? Number(initialId) : null);
    setSelectedLabel(initialLabel);
  }, [initialId, initialLabel]);

  if (!field.lookupTab) {
    return null;
  }

  return (
    <MasterLookupDropdown
      label={field.label}
      tab={field.lookupTab}
      required={field.required}
      selectedId={selectedId}
      selectedLabel={selectedLabel}
      error={error}
      onSelect={(row) => {
        if (!enabled) {
          return;
        }
        idRef.current = String(row.id);
        setSelectedId(row.id);
        setSelectedLabel(row.title);
      }}
      onClear={() => {
        if (!enabled) {
          return;
        }
        idRef.current = '';
        setSelectedId(null);
        setSelectedLabel('');
      }}
      onCreateRequest={onCreateRequest}
    />
  );
}

/**
 * Plain mount/unmount (no AnimatedVisibility).
 */
export function MastersFormPanel({
  tab,
  visible,
  mode,
  initialRow,
  createDefaults = null,
  presentation = 'side',
  onClose,
  onSaved,
}: MastersFormPanelProps) {
  const colors = useMaterialColors();
  const config = MASTER_ENTITY_CONFIG[tab];
  const { createMutation, updateMutation } = useMasterMutations(tab);
  const { showSnackbar } = useSnackbar();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldStates = useRef<Record<string, FieldState>>({});
  const [nestedLookupCreate, setNestedLookupCreate] = useState<NestedLookupCreate | null>(null);
  const [lookupOverrides, setLookupOverrides] = useState<
    Record<string, { id: string; label: string }>
  >({});

  const createDefaultsKey = createDefaults
    ? Object.values(createDefaults).filter(Boolean).join('|')
    : '';
  const formIdentity = `${tab}-${mode}-${initialRow?.id ?? 'new'}-${createDefaultsKey}`;
  const isFullWidth = presentation === 'full';

  useEffect(() => {
    if (visible) {
      setFieldErrors({});
      setLookupOverrides({});
      setNestedLookupCreate(null);
    }
  }, [visible, formIdentity]);

  const title = useMemo(() => {
    return mode === 'create' ? `New ${config.labelSingular}` : `Edit ${config.labelSingular}`;
  }, [config.labelSingular, mode]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const nestedOpen = nestedLookupCreate != null;

  const registerField = (key: string, state: FieldState) => {
    fieldStates.current[key] = state;
  };

  const readValues = () => {
    const values: Record<string, string> = {};
    for (const field of config.formFields) {
      values[field.key] = fieldStates.current[field.key]?.get() ?? '';
    }
    return values;
  };

  const validate = (values: Record<string, string>) => {
    const nextErrors: Record<string, string> = {};
    for (const field of config.formFields) {
      if (field.required && !values[field.key]?.trim()) {
        nextErrors[field.key] = `${field.label} is required`;
      }
    }
    if (tab === 'trucks' && values.name_board_id && Number.isNaN(Number(values.name_board_id))) {
      nextErrors.name_board_id = 'Select a valid name board';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    const values = readValues();
    if (!validate(values)) {
      return;
    }

    if (mode === 'create') {
      createMutation.mutate(values, {
        onSuccess: (row) => {
          onSaved?.(row);
          onClose();
          void showSnackbar(`${config.labelSingular} created`, { variant: 'success' });
        },
        onError: (err) => {
          void showSnackbar(err instanceof Error ? err.message : 'Create failed', {
            variant: 'error',
          });
        },
      });
      return;
    }

    if (!initialRow) {
      return;
    }

    updateMutation.mutate(
      { id: initialRow.id, values },
      {
        onSuccess: () => {
          onSaved?.();
          onClose();
          void showSnackbar(`${config.labelSingular} updated`, { variant: 'success' });
        },
        onError: (err) => {
          void showSnackbar(err instanceof Error ? err.message : 'Update failed', {
            variant: 'error',
          });
        },
      }
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <Box modifiers={[fillMaxSize()]}>
      <Row modifiers={[fillMaxSize()]}>
        {isFullWidth ? null : (
          <Column
            modifiers={[
              weight(0.12),
              fillMaxHeight(),
              background('#00000066'),
              clickable(onClose),
            ]}
          />
        )}

        <Column
          modifiers={[
            weight(isFullWidth ? 1 : 0.88),
            fillMaxHeight(),
            background(colors.surface),
            padding(16, 12, 16, 16),
          ]}
          verticalArrangement={{ spacedBy: 0 }}>
          <Row
            modifiers={[fillMaxWidth(), padding(0, 4, 0, 12)]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 8 }}>
            <Text style={{ typography: 'titleLarge' }}>{title}</Text>
            <Spacer modifiers={[weight(1)]} />
            <IconButton onClick={onClose} enabled={!isSaving && !nestedOpen}>
              <Icon source={CLOSE_ICON} size={24} tint={colors.onSurfaceVariant} />
            </IconButton>
          </Row>

          <Column
            key={formIdentity}
            modifiers={[fillMaxWidth(), weight(1)]}
            verticalArrangement={{ spacedBy: 12 }}>
            {config.formFields.map((field) => {
              const baseValue =
                mode === 'edit' && initialRow
                  ? (initialRow.values[field.key] ?? '')
                  : (createDefaults?.[field.key] ?? '');

              if (field.lookupTab) {
                const labelKey = field.lookupLabelKey ?? '';
                const override = lookupOverrides[field.key];
                const initialId = override?.id ?? baseValue;
                const initialLabel =
                  override?.label ??
                  (mode === 'edit' && initialRow && labelKey
                    ? (initialRow.values[labelKey] ?? '')
                    : (createDefaults?.[labelKey] ?? ''));

                return (
                  <MasterFormLookupField
                    key={`${formIdentity}-${field.key}-${initialId}`}
                    field={field}
                    initialId={initialId}
                    initialLabel={initialLabel}
                    error={fieldErrors[field.key]}
                    enabled={!isSaving && !nestedOpen}
                    onRegister={registerField}
                    onCreateRequest={(query) => {
                      setNestedLookupCreate({
                        tab: field.lookupTab!,
                        fieldKey: field.key,
                        defaults: {
                          name: query,
                          code: suggestCodeFromName(query),
                        },
                      });
                    }}
                  />
                );
              }

              return (
                <MasterFormFieldInput
                  key={`${formIdentity}-${field.key}`}
                  field={field}
                  initialValue={baseValue}
                  error={fieldErrors[field.key]}
                  enabled={!isSaving && !nestedOpen}
                  onRegister={registerField}
                />
              );
            })}
          </Column>

          <Row
            modifiers={[fillMaxWidth(), padding(0, 16, 0, 0)]}
            horizontalArrangement={{ spacedBy: 12 }}>
            <Button modifiers={[weight(1)]} onClick={onClose} enabled={!isSaving && !nestedOpen}>
              <Text>Cancel</Text>
            </Button>
            <Button modifiers={[weight(1)]} onClick={handleSave} enabled={!isSaving && !nestedOpen}>
              <Text>{isSaving ? 'Saving…' : 'Save'}</Text>
            </Button>
          </Row>
        </Column>
      </Row>

      {nestedLookupCreate ? (
        <MastersFormPanel
          tab={nestedLookupCreate.tab}
          visible
          mode="create"
          presentation="side"
          createDefaults={nestedLookupCreate.defaults}
          onClose={() => setNestedLookupCreate(null)}
          onSaved={(row) => {
            if (row) {
              const fieldKey = nestedLookupCreate.fieldKey;
              fieldStates.current[fieldKey]?.set(String(row.id));
              setLookupOverrides((prev) => ({
                ...prev,
                [fieldKey]: { id: String(row.id), label: row.title },
              }));
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[fieldKey];
                return next;
              });
            }
            setNestedLookupCreate(null);
          }}
        />
      ) : null}
    </Box>
  );
}
