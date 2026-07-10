import {
  Column,
  DatePickerDialog,
  Icon,
  IconButton,
  OutlinedTextField,
  Row,
  Text,
  useMaterialColors,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { clickable, fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useState } from 'react';

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
  const displayValue = useNativeState(date ? formatTransactionDate(date) : '');

  useEffect(() => {
    void displayValue.set(date ? formatTransactionDate(date) : '');
  }, [date, displayValue]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const handleClear = () => {
    onClear();
    setIsDialogOpen(false);
  };

  return (
    <Column modifiers={[weight(1), fillMaxWidth()]}>
      <OutlinedTextField
        value={displayValue}
        readOnly
        singleLine
        isError={Boolean(error)}
        modifiers={[fillMaxWidth(), clickable(openDialog)]}>
        <OutlinedTextField.Label>
          <Text>{label}</Text>
        </OutlinedTextField.Label>
        {error ? (
          <OutlinedTextField.SupportingText>
            <Text>{error}</Text>
          </OutlinedTextField.SupportingText>
        ) : null}
        <OutlinedTextField.TrailingIcon>
          <Row horizontalArrangement={{ spacedBy: 0 }} verticalAlignment="center">
            {date ? (
              <IconButton onClick={handleClear}>
                <Icon source={CLOSE_ICON} size={20} tint={colors.onSurfaceVariant} />
              </IconButton>
            ) : null}
            <IconButton onClick={openDialog}>
              <Icon source={CALENDAR_ICON} size={20} tint={colors.onSurfaceVariant} />
            </IconButton>
          </Row>
        </OutlinedTextField.TrailingIcon>
      </OutlinedTextField>

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
