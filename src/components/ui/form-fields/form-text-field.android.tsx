import { Column, OutlinedTextField, Shape, Text, useNativeState } from '@expo/ui/jetpack-compose';
import type {
  TextFieldImeAction,
  TextFieldKeyboardType,
  TextFieldCapitalization,
  TextFieldTextStyle,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';

import { FORM_FIELD_CORNERS } from '@/components/ui/form-fields/form-field-metrics';

export type FormTextFieldProps = {
  label: string;
  required?: boolean;
  compact?: boolean;
  /** Shown once on mount / identity change; the field owns its buffer afterwards. */
  initialText?: string;
  keyboardType?: TextFieldKeyboardType;
  capitalization?: TextFieldCapitalization;
  imeAction?: TextFieldImeAction;
  maxLength?: number;
  textStyle?: TextFieldTextStyle;
  autoFocus?: boolean;
  enabled?: boolean;
  onChangeText: (value: string) => void;
  /** Called when the IME action fires (the keyboard closes natively on 'done'). */
  onSubmit?: () => void;
};

/**
 * Outlined field seeded via `useNativeState`. Imperative `ref.setText` is
 * avoided — Expo currently rejects it with a ComposeFunctionHolder cast error.
 */
export function FormTextField({
  label,
  required = false,
  compact = false,
  initialText,
  keyboardType = 'text',
  capitalization = 'none',
  imeAction = 'next',
  maxLength,
  textStyle,
  autoFocus = false,
  enabled = true,
  onChangeText,
  onSubmit,
}: FormTextFieldProps) {
  const state = useNativeState(initialText ?? '');

  return (
    <Column modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}>
      <OutlinedTextField
        value={state}
        singleLine
        enabled={enabled}
        autoFocus={autoFocus}
        maxLength={maxLength}
        textStyle={textStyle}
        shape={Shape.RoundedCorner({ cornerRadii: FORM_FIELD_CORNERS })}
        keyboardOptions={{ keyboardType, capitalization, imeAction }}
        keyboardActions={{ onDone: () => onSubmit?.() }}
        modifiers={[fillMaxWidth()]}
        onValueChange={onChangeText}>
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
