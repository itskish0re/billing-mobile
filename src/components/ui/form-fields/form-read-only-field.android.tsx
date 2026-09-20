import { Box, Column, Shape, Surface, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import {
  background,
  defaultMinSize,
  fillMaxWidth,
  offset,
  padding,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';

import {
  FORM_FIELD_CORNERS,
  FORM_FIELD_MIN_HEIGHT,
} from '@/components/ui/form-fields/form-field-metrics';

export type FormReadOnlyFieldProps = {
  label: string;
  value: string;
  supportingText?: string;
  highlighted?: boolean;
  compact?: boolean;
  /** Renders the value in a monospaced, letter-spaced style (truck/phone numbers). */
  monospace?: boolean;
  /** Parent fill behind the floating label. Must match the surface the field sits on. */
  labelContainerColor?: string;
};

/**
 * Display-only outlined field. Uses the same 56dp min height and 12dp
 * `Surface` corners as `OutlinedTextField` so compact rows stay aligned.
 */
export function FormReadOnlyField({
  label,
  value,
  supportingText,
  highlighted,
  compact,
  monospace,
  labelContainerColor,
}: FormReadOnlyFieldProps) {
  const colors = useMaterialColors();
  const notchColor = labelContainerColor ?? colors.surface;
  const valueColor = highlighted
    ? colors.primary
    : value
      ? colors.onSurface
      : colors.onSurfaceVariant;
  const longValue = value.length > 14;

  return (
    <Column
      modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}
      verticalArrangement={{ spacedBy: 4 }}>
      <Box modifiers={[fillMaxWidth(), defaultMinSize({ minHeight: FORM_FIELD_MIN_HEIGHT })]}>
        <Surface
          color={colors.surface}
          contentColor={valueColor}
          shape={Shape.RoundedCorner({ cornerRadii: FORM_FIELD_CORNERS })}
          border={{ width: 1, color: colors.outline }}
          modifiers={[fillMaxWidth(), defaultMinSize({ minHeight: FORM_FIELD_MIN_HEIGHT })]}>
          <Column
            modifiers={[
              fillMaxWidth(),
              defaultMinSize({ minHeight: FORM_FIELD_MIN_HEIGHT }),
              padding(16, 8, 16, 8),
            ]}
            verticalArrangement="center">
            <Text
              maxLines={1}
              overflow="ellipsis"
              color={valueColor}
              modifiers={[fillMaxWidth()]}
              style={{
                typography: longValue || compact ? 'bodyMedium' : 'bodyLarge',
                ...(monospace ? { fontFamily: 'monospace', letterSpacing: 1 } : {}),
              }}>
              {value || ' '}
            </Text>
          </Column>
        </Surface>

        <Text
          color={colors.onSurfaceVariant}
          style={{ typography: 'bodySmall' }}
          modifiers={[offset(12, -8), background(notchColor), padding(4, 0, 4, 0)]}>
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
