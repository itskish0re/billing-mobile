import { Column, OutlinedTextField, Shape, Text } from '@expo/ui/jetpack-compose';
import type {
  TextFieldImeAction,
  TextFieldKeyboardType,
  TextFieldCapitalization,
  TextFieldRef,
  TextFieldTextStyle,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useRef } from 'react';

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
 * Uncontrolled outlined text field with a uniform rounded shape. It omits
 * `value` (the parent stays the source of truth via `onChangeText`) so
 * Host/theme remounts never release a bound `useNativeState` SharedObject.
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
  const fieldRef = useRef<TextFieldRef>(null);

  useEffect(() => {
    if (initialText != null && initialText !== '') {
      void fieldRef.current?.setText(initialText);
    }
    // Seed once for this mounted identity; remount (via key) reseeds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Column modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}>
      <OutlinedTextField
        ref={fieldRef}
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
