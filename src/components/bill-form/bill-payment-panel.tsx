import type { BillFormValues } from '@/types/bill-form';

export type BillPaymentPanelProps = {
  values: BillFormValues;
  onPatch: (patch: Partial<BillFormValues>) => void;
};

export function BillPaymentPanel(_props: BillPaymentPanelProps) {
  return null;
}
