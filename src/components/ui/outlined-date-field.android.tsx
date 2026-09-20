import {
  Box,
  Column,
  DatePickerDialog,
  Icon,
  Row,
  Shape,
  Surface,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  background,
  clickable,
  clip,
  defaultMinSize,
  fillMaxWidth,
  offset,
  padding,
  Shapes,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

import {
  FORM_FIELD_CORNERS,
  FORM_FIELD_MIN_HEIGHT,
} from '@/components/ui/form-fields/form-field-metrics';
import { formatTransactionDate } from '@/lib/transactions/format-transaction-date';

const CALENDAR_ICON = require('@/assets/icons/calendar_month.xml');
const CLOSE_ICON = require('@/assets/icons/close.xml');

export type OutlinedDateFieldProps = {
  label: string;
  date: Date | null;
  error?: string;
  /** When set, shows a clear trailing action while a date is selected. */
  onClear?: () => void;
  onDateSelected: (date: Date) => void;
  confirmButtonLabel?: string;
  dismissButtonLabel?: string;
  selectableDates?: {
    start?: Date;
    end?: Date;
  };
  compact?: boolean;
  /** Parent fill behind the floating label. Must match the surface the field sits on. */
  labelContainerColor?: string;
};

/**
 * Outlined date field without useNativeState. Matches the shared field metrics
 * (56dp min height, 12dp corners). Trailing actions are plain clickable icons
 * rather than 48dp `IconButton`s so the control does not grow taller than a
 * text field. Theme / Host remounts release SharedObjects and crash
 * `OutlinedTextField`, so the label is drawn on the top border instead.
 */
export function OutlinedDateField({
  label,
  date,
  error,
  onClear,
  onDateSelected,
  confirmButtonLabel = 'Select',
  dismissButtonLabel = 'Cancel',
  selectableDates,
  compact = false,
  labelContainerColor,
}: OutlinedDateFieldProps) {
  const colors = useMaterialColors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const outline = error ? colors.error : colors.outline;
  const labelColor = error ? colors.error : colors.onSurfaceVariant;
  const notchColor = labelContainerColor ?? colors.surface;

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <Column
      modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}
      verticalArrangement={{ spacedBy: 4 }}>
      <Box modifiers={[fillMaxWidth()]}>
        <Surface
          color={colors.surface}
          shape={Shape.RoundedCorner({ cornerRadii: FORM_FIELD_CORNERS })}
          border={{ width: 1, color: outline }}
          onClick={openDialog}
          modifiers={[fillMaxWidth(), defaultMinSize({ minHeight: FORM_FIELD_MIN_HEIGHT })]}>
          <Column
            modifiers={[
              fillMaxWidth(),
              defaultMinSize({ minHeight: FORM_FIELD_MIN_HEIGHT }),
              padding(16, 8, 16, 8),
            ]}
            verticalArrangement="center">
            <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
              <Text
                modifiers={[weight(1)]}
                maxLines={1}
                color={date ? colors.onSurface : colors.onSurfaceVariant}
                style={{ typography: 'bodyLarge' }}>
                {date ? formatTransactionDate(date) : 'Select date'}
              </Text>
              {date && onClear ? (
                <Box modifiers={[clip(Shapes.Circle), clickable(onClear), padding(4, 4, 4, 4)]}>
                  <Icon source={CLOSE_ICON} size={20} tint={colors.onSurfaceVariant} />
                </Box>
              ) : (
                <Box modifiers={[clip(Shapes.Circle), clickable(openDialog), padding(4, 4, 4, 4)]}>
                  <Icon source={CALENDAR_ICON} size={20} tint={colors.onSurfaceVariant} />
                </Box>
              )}
            </Row>
          </Column>
        </Surface>

        <Text
          color={labelColor}
          style={{ typography: 'bodySmall' }}
          modifiers={[offset(12, -8), background(notchColor), padding(4, 0, 4, 0)]}>
          {label}
        </Text>
      </Box>

      {error ? (
        <Text color={colors.error} style={{ typography: 'bodySmall' }}>
          {error}
        </Text>
      ) : null}

      {isDialogOpen ? (
        <DatePickerDialog
          initialDate={(date ?? new Date()).toISOString()}
          variant="picker"
          showVariantToggle={false}
          confirmButtonLabel={confirmButtonLabel}
          dismissButtonLabel={dismissButtonLabel}
          selectableDates={selectableDates}
          onDateSelected={(selectedDate) => {
            onDateSelected(selectedDate);
            setIsDialogOpen(false);
          }}
          onDismissRequest={() => setIsDialogOpen(false)}
        />
      ) : null}
    </Column>
  );
}
