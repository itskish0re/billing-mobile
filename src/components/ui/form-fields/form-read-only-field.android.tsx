import { Box, Column, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import {
  background,
  border,
  clip,
  fillMaxWidth,
  height,
  offset,
  padding,
  Shapes,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';

import {
  FORM_FIELD_CORNER_RADIUS,
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
};

/**
 * Display-only outlined field. Uses a fixed 56dp frame (same as
 * `OutlinedTextField`) so compact rows stay aligned. Values are Compose
 * `Text` — Expo's `TextFieldView.setText` crashes on Android.
 */
export function FormReadOnlyField({
  label,
  value,
  supportingText,
  highlighted,
  compact,
  monospace,
}: FormReadOnlyFieldProps) {
  const colors = useMaterialColors();
  const outline = colors.outline;
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
      <Box modifiers={[fillMaxWidth(), height(FORM_FIELD_MIN_HEIGHT)]}>
        <Column
          modifiers={[
            fillMaxWidth(),
            height(FORM_FIELD_MIN_HEIGHT),
            clip(Shapes.RoundedCorner(FORM_FIELD_CORNER_RADIUS)),
            border(1, outline),
            padding(16, 8, 12, 8),
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
