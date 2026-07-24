export type BillDateFieldProps = {
  label: string;
  date: Date | null;
  error?: string;
  onDateSelected: (date: Date) => void;
  onClear?: () => void;
};

export function BillDateField(_props: BillDateFieldProps) {
  return null;
}
