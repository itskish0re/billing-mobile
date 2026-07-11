import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';

type MastersEntityListProps = {
  tab: MastersTab;
  searchQuery: string;
  onEdit: (row: MasterListRow) => void;
  interactionEnabled?: boolean;
};

export function MastersEntityList(_props: MastersEntityListProps) {
  return null;
}
