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
const CLOSE_ICON = require('@/assets/icons/close.xml');

type TransactionsDateFilterFieldProps = {
  label: string;
  date: Date | null;
  error?: string;
  onDateSelected: (date: Date) => void;
  onClear: () => void;
  selectableDates?: {
    start?: Date;
    end?: Date;
  };
};

/**
 * Read-only date control without useNativeState.
 * OutlinedTextField + ObservableState inside AnimatedVisibility was releasing
 * SharedObjects and crashing with "Cannot set prop 'value'".
 */
export function TransactionsDateFilterField({
  label,
  date,
  error,
  onDateSelected,
  onClear,
  selectableDates,
}: TransactionsDateFilterFieldProps) {
  const colors = useMaterialColors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const handleClear = () => {
    onClear();
    setIsDialogOpen(false);
  };

  return (
    <Column modifiers={[weight(1), fillMaxWidth()]} verticalArrangement={{ spacedBy: 4 }}>
      <Column
        modifiers={[
          fillMaxWidth(),
          border(1, error ? colors.error : colors.outline),
          background(colors.surface),
          clickable(openDialog),
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
          {date ? (
            <IconButton
              onClick={() => {
                handleClear();
              }}>
              <Icon source={CLOSE_ICON} size={20} tint={colors.onSurfaceVariant} />
            </IconButton>
          ) : null}
          <IconButton onClick={openDialog}>
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
          dismissButtonLabel="Clear"
          selectableDates={selectableDates}
          onDateSelected={(selectedDate) => {
            onDateSelected(selectedDate);
            setIsDialogOpen(false);
          }}
          onDismissRequest={handleClear}
        />
      ) : null}
    </Column>
  );
}
