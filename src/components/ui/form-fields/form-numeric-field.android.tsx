import { Column, OutlinedTextField, Shape, Text } from '@expo/ui/jetpack-compose';
import type {
  TextFieldImeAction,
  TextFieldRef,
  TextFieldTextStyle,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useRef } from 'react';

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

/** Uncontrolled decimal field matching {@link FormTextField}'s shape and focus wiring. */
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
  const fieldRef = useRef<TextFieldRef>(null);

  useEffect(() => {
    if (typeof initialValue === 'number' && Number.isFinite(initialValue)) {
      void fieldRef.current?.setText(String(initialValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Column modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}>
      <OutlinedTextField
        ref={fieldRef}
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
