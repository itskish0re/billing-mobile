import type {
  TextFieldCapitalization,
  TextFieldImeAction,
  TextFieldKeyboardType,
  TextFieldTextStyle,
} from '@expo/ui/jetpack-compose';

export type FormTextFieldProps = {
  label: string;
  required?: boolean;
  compact?: boolean;
  initialText?: string;
  keyboardType?: TextFieldKeyboardType;
  capitalization?: TextFieldCapitalization;
  imeAction?: TextFieldImeAction;
  maxLength?: number;
  textStyle?: TextFieldTextStyle;
  autoFocus?: boolean;
  enabled?: boolean;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
};

export function FormTextField(_props: FormTextFieldProps) {
  return null;
}
