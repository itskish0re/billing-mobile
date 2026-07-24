import {
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
  padding,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

import { formatTransactionDate } from '@/lib/transactions/format-transaction-date';

const CALENDAR_ICON = require('@/assets/icons/calendar_month.xml');

export type BillDateFieldProps = {
  label: string;
  date: Date | null;
  error?: string;
  onDateSelected: (date: Date) => void;
};

/** Date control for the bill form (no useNativeState — safe in accordion trees). */
export function BillDateField({ label, date, error, onDateSelected }: BillDateFieldProps) {
  const colors = useMaterialColors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 4 }}>
      <Column
        modifiers={[
          fillMaxWidth(),
          border(1, error ? colors.error : colors.outline),
          background(colors.surface),
          clickable(() => setIsDialogOpen(true)),
          padding(16, 10, 12, 10),
        ]}>
        <Text color={colors.onSurfaceVariant} style={{ typography: 'bodySmall' }}>
          {label}
        </Text>
        <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
          <Text
            modifiers={[weight(1)]}
            color={date ? colors.onSurface : colors.onSurfaceVariant}
            style={{ typography: 'bodyLarge' }}>
            {date ? formatTransactionDate(date) : 'Select date'}
          </Text>
          <IconButton onClick={() => setIsDialogOpen(true)}>
            <Icon source={CALENDAR_ICON} size={20} tint={colors.onSurfaceVariant} />
          </IconButton>
        </Row>
      </Column>

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
          confirmButtonLabel="Select"
          dismissButtonLabel="Cancel"
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
