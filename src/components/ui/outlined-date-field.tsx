export type OutlinedDateFieldProps = {
  label: string;
  date: Date | null;
  error?: string;
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

export function OutlinedDateField(_props: OutlinedDateFieldProps) {
  return null;
}
