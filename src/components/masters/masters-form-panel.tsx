import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';

export type MastersFormMode = 'create' | 'edit';

export type MastersFormPresentation = 'side' | 'full';

export type MastersFormPanelProps = {
  tab: MastersTab;
  visible: boolean;
  mode: MastersFormMode;
  initialRow?: MasterListRow | null;
  createDefaults?: Record<string, string> | null;
  presentation?: MastersFormPresentation;
  onClose: () => void;
  onSaved?: (row?: MasterListRow) => void;
};

export function MastersFormPanel(_props: MastersFormPanelProps) {
  return null;
}
