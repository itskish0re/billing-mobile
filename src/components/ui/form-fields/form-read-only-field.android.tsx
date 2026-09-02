import {
  Column,
  OutlinedTextField,
  Shape,
  Text,
  useMaterialColors,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import type { TextFieldTextStyle } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect } from 'react';

import { FORM_FIELD_CORNERS } from '@/components/ui/form-fields/form-field-metrics';

export type FormReadOnlyFieldProps = {
  label: string;
  value: string;
  supportingText?: string;
  highlighted?: boolean;
  compact?: boolean;
  /** Renders the value in a monospaced, letter-spaced style (truck/phone numbers). */
  monospace?: boolean;
};

/**
 * Auto-generated / derived value shown in a real `OutlinedTextField` with
 * `readOnly` so it lines up perfectly with the editable fields but can never be
 * focused into editing (no keyboard, no crash). The parent stays the source of
 * truth: the derived string is pushed into the native buffer via the setter.
 * Empty stays empty (no placeholder dash).
 */
export function FormReadOnlyField({
  label,
  value,
  supportingText,
  highlighted = false,
  compact = false,
  monospace = false,
}: FormReadOnlyFieldProps) {
  const colors = useMaterialColors();
  const state = useNativeState(value);

  useEffect(() => {
    void state.set(value);
  }, [value, state]);

  const textStyle: TextFieldTextStyle = {
    ...(monospace ? { fontFamily: 'monospace', letterSpacing: 1 } : {}),
    ...(highlighted ? { color: colors.primary } : {}),
  };

  return (
    <Column modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}>
      <OutlinedTextField
        value={state}
        readOnly
        singleLine
        textStyle={textStyle}
        shape={Shape.RoundedCorner({ cornerRadii: FORM_FIELD_CORNERS })}
        modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>{label}</Text>
        </OutlinedTextField.Label>
        {supportingText ? (
          <OutlinedTextField.SupportingText>
            <Text color={colors.onSurfaceVariant}>{supportingText}</Text>
          </OutlinedTextField.SupportingText>
        ) : null}
      </OutlinedTextField>
    </Column>
  );
}
