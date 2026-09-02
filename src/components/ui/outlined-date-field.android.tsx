import {
  Box,
  Column,
  DatePickerDialog,
  Icon,
  IconButton,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  background,
  border,
  clickable,
  fillMaxWidth,
  offset,
  padding,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

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
};

/**
 * Outlined date field without useNativeState.
 * Theme / Host remounts release SharedObjects and crash OutlinedTextField.
 * Label is drawn on the top border so it matches Material outlined fields.
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
}: OutlinedDateFieldProps) {
  const colors = useMaterialColors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const outline = error ? colors.error : colors.outline;
  const labelColor = error ? colors.error : colors.onSurfaceVariant;

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <Column
      modifiers={compact ? [weight(1), fillMaxWidth(), padding(0, 8, 0, 0)] : [fillMaxWidth(), padding(0, 8, 0, 0)]}
      verticalArrangement={{ spacedBy: 4 }}>
      <Box modifiers={[fillMaxWidth()]}>
        <Column
          modifiers={[
            fillMaxWidth(),
            border(1, outline),
            clickable(openDialog),
            padding(16, 14, 12, 12),
          ]}>
          <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
            <Text
              modifiers={[weight(1)]}
              color={date ? colors.onSurface : colors.onSurfaceVariant}
              style={{ typography: 'bodyLarge' }}>
              {date ? formatTransactionDate(date) : 'Select date'}
            </Text>
            {date && onClear ? (
              <IconButton
                onClick={() => {
                  onClear();
                  setIsDialogOpen(false);
                }}>
                <Icon source={CLOSE_ICON} size={20} tint={colors.onSurfaceVariant} />
              </IconButton>
            ) : null}
            <IconButton onClick={openDialog}>
              <Icon source={CALENDAR_ICON} size={20} tint={colors.onSurfaceVariant} />
            </IconButton>
          </Row>
        </Column>

        <Text
          color={labelColor}
          style={{ typography: 'bodySmall' }}
          modifiers={[offset(12, -8), background(colors.surface), padding(4, 0, 4, 0)]}>
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
