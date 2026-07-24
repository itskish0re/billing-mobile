import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';

export type BillCreateMasterRequest = {
  tab: MastersTab;
  defaults: Record<string, string>;
};

export type BillCreatedMaster = {
  tab: MastersTab;
  row: MasterListRow;
};

export type BillFormHeaderFieldsProps = {
  onCreateMaster?: (request: BillCreateMasterRequest) => void;
  createdMaster?: BillCreatedMaster | null;
  onCreatedMasterApplied?: () => void;
};

export function BillFormHeaderFields(_props: BillFormHeaderFieldsProps) {
  return null;
}
