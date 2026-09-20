export type FormReadOnlyFieldProps = {
  label: string;
  value: string;
  supportingText?: string;
  highlighted?: boolean;
  compact?: boolean;
  monospace?: boolean;
  /** Parent fill behind the floating label. Must match the surface the field sits on. */
  labelContainerColor?: string;
};

export function FormReadOnlyField(_props: FormReadOnlyFieldProps) {
  return null;
}
