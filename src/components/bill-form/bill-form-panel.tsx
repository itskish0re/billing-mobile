export type BillFormPanelProps = {
  visible: boolean;
  onClose: () => void;
  /** Status-bar inset from the root SafeAreaProvider (Modal insets are often 0). */
  topInset?: number;
  /** Navigation-bar inset from the root SafeAreaProvider. */
  bottomInset?: number;
};

export function BillFormPanel(_props: BillFormPanelProps) {
  return null;
}
