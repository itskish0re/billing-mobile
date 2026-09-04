import type { MastersTab } from '@/components/masters/masters-types';
import type { BillFormValues } from '@/types/bill-form';

export type BillCreateMasterTarget =
  | { kind: 'from' }
  | { kind: 'truck' }
  | {
      kind: 'load';
      index: number;
      field: 'consignor' | 'consignee' | 'destination' | 'goods' | 'unit';
    };

export type BillCreateMasterRequest = {
  tab: MastersTab;
  defaults: Record<string, string>;
  target: BillCreateMasterTarget;
};

export type BillFormHeaderFieldsProps = {
  values: BillFormValues;
  onPatch: (patch: Partial<BillFormValues>) => void;
  onCreateMaster: (request: BillCreateMasterRequest) => void;
  autoAssignBillNumber?: boolean;
};

export function BillFormHeaderFields(_props: BillFormHeaderFieldsProps) {
  return null;
}
