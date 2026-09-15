import type { BillListRow } from '@/types/bill-list';

export type BillsListProps = {
  filterQuery: string;
  filtersReady: boolean;
  onEdit: (row: BillListRow) => void;
  onPreview: (row: BillListRow) => void;
};

export function BillsList(_props: BillsListProps) {
  return null;
}
