export type BillFormReadOnlyFieldProps = {
  label: string;
  value: string;
  supportingText?: string;
  highlighted?: boolean;
  compact?: boolean;
};

export function BillFormReadOnlyField(_props: BillFormReadOnlyFieldProps) {
  return null;
}

export type BillFormNumericFieldProps = {
  label: string;
  required?: boolean;
  compact?: boolean;
  onChange: (value: number | '') => void;
};

export function BillFormNumericField(_props: BillFormNumericFieldProps) {
  return null;
}

export type BillFormTextFieldProps = {
  label: string;
  compact?: boolean;
  onChange: (value: string) => void;
};

export function BillFormTextField(_props: BillFormTextFieldProps) {
  return null;
}
