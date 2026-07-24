import { OutlinedDateField } from '@/components/ui/outlined-date-field';

export type BillDateFieldProps = {
  label: string;
  date: Date | null;
  error?: string;
  onDateSelected: (date: Date) => void;
  onClear?: () => void;
};

/** Date control for the bill form — Material outlined label on the border. */
export function BillDateField({
  label,
  date,
  error,
  onDateSelected,
  onClear,
}: BillDateFieldProps) {
  return (
    <OutlinedDateField
      label={label}
      date={date}
      error={error}
      onDateSelected={onDateSelected}
      onClear={onClear}
      confirmButtonLabel="Select"
      dismissButtonLabel="Cancel"
    />
  );
}
