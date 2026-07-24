import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';

export type FilterableDropdownItem = {
  id: number;
  title: string;
  subtitle?: string;
};

export type FilterableDropdownItemPressedEvent = {
  id: number;
  title: string;
  subtitle: string;
};

export type FilterableDropdownCreatePressedEvent = {
  query: string;
};

export type FilterableDropdownProps = {
  label: string;
  /** Committed selected display value. */
  value: string;
  items: FilterableDropdownItem[];
  enabled?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  supportingText?: string;
  maxResults?: number;
  allowCreate?: boolean;
  /**
   * Do not name this onSelect — Android BaseViewConfig already defines bubbling
   * topSelect; Expo Events are direct → invariant violation.
   */
  onItemPressed?: (event: FilterableDropdownItemPressedEvent) => void;
  onCreatePressed?: (event: FilterableDropdownCreatePressedEvent) => void;
  onCleared?: () => void;
} & PrimitiveBaseProps;
