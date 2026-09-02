import type { TextFieldImeAction, TextFieldTextStyle } from '@expo/ui/jetpack-compose';

export type FormNumericFieldProps = {
  label: string;
  required?: boolean;
  compact?: boolean;
  initialValue?: number | '';
  imeAction?: TextFieldImeAction;
  maxIntegerDigits?: number;
  textStyle?: TextFieldTextStyle;
  enabled?: boolean;
  onChangeNumber: (value: number | '') => void;
  onSubmit?: () => void;
};

export function FormNumericField(_props: FormNumericFieldProps) {
  return null;
}
