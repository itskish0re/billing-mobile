import {
  Box,
  Column,
  OutlinedTextField,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { background, border, fillMaxWidth, offset, padding, weight } from '@expo/ui/jetpack-compose/modifiers';

import { parseBillFormNumericInput } from '@/lib/bills/bill-form';

export type BillFormReadOnlyFieldProps = {
  label: string;
  value: string;
  supportingText?: string;
  highlighted?: boolean;
  compact?: boolean;
};

/** Outlined read-only value — no useNativeState (Host remounts release SharedObjects). */
export function BillFormReadOnlyField({
  label,
  value,
  supportingText,
  highlighted = false,
  compact = false,
}: BillFormReadOnlyFieldProps) {
  const colors = useMaterialColors();
  const display = value.trim() ? value : '—';

  return (
    <Column
      modifiers={compact ? [weight(1), fillMaxWidth(), padding(0, 8, 0, 0)] : [fillMaxWidth(), padding(0, 8, 0, 0)]}
      verticalArrangement={{ spacedBy: 4 }}>
      <Box modifiers={[fillMaxWidth()]}>
        <Column
          modifiers={[fillMaxWidth(), border(1, colors.outline), padding(16, 14, 12, 12)]}>
          <Text
            color={highlighted ? colors.primary : value.trim() ? colors.onSurface : colors.onSurfaceVariant}
            style={{ typography: 'bodyLarge' }}>
            {display}
          </Text>
        </Column>
        <Text
          color={colors.onSurfaceVariant}
          style={{ typography: 'bodySmall' }}
          modifiers={[offset(12, -8), background(colors.surface), padding(4, 0, 4, 0)]}>
          {label}
        </Text>
      </Box>
      {supportingText ? (
        <Text color={colors.onSurfaceVariant} style={{ typography: 'bodySmall' }}>
          {supportingText}
        </Text>
      ) : null}
    </Column>
  );
}

export type BillFormNumericFieldProps = {
  label: string;
  required?: boolean;
  compact?: boolean;
  onChange: (value: number | '') => void;
};

/**
 * Uncontrolled outlined number field. Parent receives parsed values via onChange.
 * Omit `value` so Compose owns the buffer — avoids SharedObject crashes on theme remount.
 */
export function BillFormNumericField({
  label,
  required = false,
  compact = false,
  onChange,
}: BillFormNumericFieldProps) {
  return (
    <Column modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}>
      <OutlinedTextField
        singleLine
        keyboardOptions={{
          keyboardType: 'decimal',
          imeAction: 'next',
        }}
        modifiers={[fillMaxWidth()]}
        onValueChange={(raw) => {
          const parsed = parseBillFormNumericInput(raw);
          if (parsed !== null) {
            onChange(parsed);
          }
        }}>
        <OutlinedTextField.Label>
          <Text>
            {label}
            {required ? ' *' : ''}
          </Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>
    </Column>
  );
}

export type BillFormTextFieldProps = {
  label: string;
  compact?: boolean;
  onChange: (value: string) => void;
};

export function BillFormTextField({ label, compact = false, onChange }: BillFormTextFieldProps) {
  return (
    <Column modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}>
      <OutlinedTextField
        singleLine
        modifiers={[fillMaxWidth()]}
        onValueChange={onChange}>
        <OutlinedTextField.Label>
          <Text>{label}</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>
    </Column>
  );
}
