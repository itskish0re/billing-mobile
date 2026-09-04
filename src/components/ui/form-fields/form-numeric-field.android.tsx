import { Column, OutlinedTextField, Shape, Text, useNativeState } from '@expo/ui/jetpack-compose';
import type { TextFieldImeAction, TextFieldTextStyle } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';

import { FORM_FIELD_CORNERS } from '@/components/ui/form-fields/form-field-metrics';
import {
  DEFAULT_MAX_INTEGER_DIGITS,
  parseNumericInput,
} from '@/components/ui/form-fields/numeric-input';

export type FormNumericFieldProps = {
  label: string;
  required?: boolean;
  compact?: boolean;
  /** Shown once on mount / identity change; the field owns its buffer afterwards. */
  initialValue?: number | '';
  imeAction?: TextFieldImeAction;
  maxIntegerDigits?: number;
  textStyle?: TextFieldTextStyle;
  enabled?: boolean;
  onChangeNumber: (value: number | '') => void;
  onSubmit?: () => void;
};

function seedNumeric(value: number | '' | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

/** Uncontrolled decimal field matching {@link FormTextField}'s shape. */
export function FormNumericField({
  label,
  required = false,
  compact = false,
  initialValue,
  imeAction = 'next',
  maxIntegerDigits = DEFAULT_MAX_INTEGER_DIGITS,
  textStyle,
  enabled = true,
  onChangeNumber,
  onSubmit,
}: FormNumericFieldProps) {
  const state = useNativeState(seedNumeric(initialValue));

  return (
    <Column modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}>
      <OutlinedTextField
        value={state}
        singleLine
        enabled={enabled}
        textStyle={textStyle}
        shape={Shape.RoundedCorner({ cornerRadii: FORM_FIELD_CORNERS })}
        keyboardOptions={{ keyboardType: 'decimal', imeAction }}
        keyboardActions={{ onDone: () => onSubmit?.() }}
        modifiers={[fillMaxWidth()]}
        onValueChange={(raw) => {
          const parsed = parseNumericInput(raw, maxIntegerDigits);
          if (parsed !== null) {
            onChangeNumber(parsed);
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
