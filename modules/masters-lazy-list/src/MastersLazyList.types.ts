import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';

export type MastersLazyListItem = {
  id: number;
  title: string;
  subtitle?: string;
  meta?: string;
};

export type MastersLazyListItemActionEvent = {
  id: number;
};

export type MastersLazyListProps = {
  items: MastersLazyListItem[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  /** When false, list ignores scroll / refresh / item actions. Default true. */
  interactionEnabled?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  onEdit?: (event: MastersLazyListItemActionEvent) => void;
  onDelete?: (event: MastersLazyListItemActionEvent) => void;
  onRefresh?: () => void;
} & PrimitiveBaseProps;
