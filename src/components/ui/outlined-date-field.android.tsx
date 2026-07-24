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
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useState } from 'react';

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
 * Material outlined date field — OutlinedTextField so the label sits in the
 * top border cutout when a value is present (same as other form fields).
 *
 * Must stay mounted while its Host is alive (do not put under AnimatedVisibility
 * that removes children).
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
  const display = useNativeState(date ? formatTransactionDate(date) : '');

  useEffect(() => {
    void display.set(date ? formatTransactionDate(date) : '');
  }, [date, display]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <Column
      modifiers={compact ? [weight(1), fillMaxWidth()] : [fillMaxWidth()]}
      verticalArrangement={{ spacedBy: 0 }}>
      <OutlinedTextField
        value={display}
        singleLine
        readOnly
        isError={Boolean(error)}
        modifiers={[fillMaxWidth()]}
        onFocusChanged={(focused) => {
          if (focused) {
            openDialog();
          }
        }}>
        <OutlinedTextField.Label>
          <Text>{label}</Text>
        </OutlinedTextField.Label>
        {!date ? (
          <OutlinedTextField.Placeholder>
            <Text>Select date</Text>
          </OutlinedTextField.Placeholder>
        ) : null}
        <OutlinedTextField.TrailingIcon>
          <Row verticalAlignment="center">
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
        </OutlinedTextField.TrailingIcon>
        {error ? (
          <OutlinedTextField.SupportingText>
            <Text color={colors.error}>{error}</Text>
          </OutlinedTextField.SupportingText>
        ) : null}
      </OutlinedTextField>

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
