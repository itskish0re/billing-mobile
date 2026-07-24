import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';

export type MasterLookupDropdownProps = {
  label: string;
  tab: MastersTab;
  selectedId: number | null;
  selectedLabel: string;
  required?: boolean;
  error?: string;
  onSelect: (row: MasterListRow) => void;
  onCreateRequest: (query: string) => void;
  onClear?: () => void;
};

export function MasterLookupDropdown(_props: MasterLookupDropdownProps) {
  return null;
}
