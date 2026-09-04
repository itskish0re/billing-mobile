import type { BillFormValues } from '@/types/bill-form';

export type BillFormPanelProps = {
  visible: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialValues?: BillFormValues | null;
  /** Status-bar inset from the root SafeAreaProvider (Modal insets are often 0). */
  topInset?: number;
  /** Navigation-bar inset from the root SafeAreaProvider. */
  bottomInset?: number;
};

export function BillFormPanel(_props: BillFormPanelProps) {
  return null;
}
