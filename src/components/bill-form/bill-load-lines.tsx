import type { BillCreateMasterRequest } from '@/components/bill-form/bill-form-header-fields';
import type { BillLoadFormLine } from '@/types/bill-form';

export type BillLoadLinesProps = {
  loads: BillLoadFormLine[];
  onChange: (loads: BillLoadFormLine[]) => void;
  onCreateMaster: (request: BillCreateMasterRequest) => void;
};

export function BillLoadLines(_props: BillLoadLinesProps) {
  return null;
}
