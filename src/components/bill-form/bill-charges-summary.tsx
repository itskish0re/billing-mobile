import type { BillFormValues } from '@/types/bill-form';
import type { BillOtherItem } from '@/types/bill-form';

export type BillChargesSummaryProps = {
  values: BillFormValues;
  onNumericChange: (
    key: 'crossing' | 'officeMamul' | 'tapalMamul' | 'diesel' | 'handLoan',
    value: number | ''
  ) => void;
  onTruckLoanChange: (checked: boolean) => void;
  onOthersChange: (items: BillOtherItem[]) => void;
};

export function BillChargesSummary(_props: BillChargesSummaryProps) {
  return null;
}
