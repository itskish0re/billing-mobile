import type { BillListRow } from '@/types/bill-list';

export type BillsListProps = {
  searchQuery: string;
  startDate: Date | null;
  endDate: Date | null;
  isDateRangeValid: boolean;
  onEdit: (row: BillListRow) => void;
  onPreview: (row: BillListRow) => void;
};

export function BillsList(_props: BillsListProps) {
  return null;
}
