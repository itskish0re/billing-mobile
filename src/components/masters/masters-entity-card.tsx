import type { MasterListRow } from '@/components/masters/masters-types';

type MastersEntityCardProps = {
  row: MasterListRow;
  onEdit: (row: MasterListRow) => void;
  onDelete: (row: MasterListRow) => void;
};

export function MastersEntityCard(_props: MastersEntityCardProps) {
  return null;
}
