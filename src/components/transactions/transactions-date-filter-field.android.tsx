import { OutlinedDateField } from '@/components/ui/outlined-date-field';

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
 * Read-only outlined date control for transaction filters.
 * Parent FilterAccordion keeps this mounted when collapsed.
 */
export function TransactionsDateFilterField({
  label,
  date,
  error,
  onDateSelected,
  onClear,
  selectableDates,
}: TransactionsDateFilterFieldProps) {
  return (
    <OutlinedDateField
      compact
      label={label}
      date={date}
      error={error}
      onDateSelected={onDateSelected}
      onClear={onClear}
      selectableDates={selectableDates}
      confirmButtonLabel="Select"
      dismissButtonLabel="Cancel"
    />
  );
}
