import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import { requireNativeView } from 'expo';

import type {
  FilterableDropdownCreatePressedEvent,
  FilterableDropdownItemPressedEvent,
  FilterableDropdownProps,
} from './FilterableDropdown.types';

type NativeProps = {
  label: string;
  value: string;
  items: Array<{ id: number; title: string; subtitle: string }>;
  enabled?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  supportingText?: string;
  maxResults?: number;
  allowCreate?: boolean;
  modifiers?: FilterableDropdownProps['modifiers'];
  onItemPressed?: (event: { nativeEvent: FilterableDropdownItemPressedEvent }) => void;
  onCreatePressed?: (event: { nativeEvent: FilterableDropdownCreatePressedEvent }) => void;
  onCleared?: (event: { nativeEvent: Record<string, never> }) => void;
  onGlobalEvent?: (event: {
    nativeEvent: { payload: [eventName: string, params: Record<string, unknown>] };
  }) => void;
};

const NativeFilterableDropdown = requireNativeView<NativeProps>(
  'FilterableDropdown',
  'FilterableDropdownView'
);

export default function FilterableDropdownView({
  label,
  value,
  items,
  enabled = true,
  isError = false,
  isLoading = false,
  supportingText = '',
  maxResults = 40,
  allowCreate = true,
  onItemPressed,
  onCreatePressed,
  onCleared,
  modifiers,
}: FilterableDropdownProps) {
  return (
    <NativeFilterableDropdown
      label={label}
      value={value}
      enabled={enabled}
      isError={isError}
      isLoading={isLoading}
      supportingText={supportingText}
      maxResults={maxResults}
      allowCreate={allowCreate}
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle ?? '',
      }))}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onItemPressed={
        onItemPressed
          ? ({ nativeEvent }) => {
              onItemPressed(nativeEvent);
            }
          : undefined
      }
      onCreatePressed={
        onCreatePressed
          ? ({ nativeEvent }) => {
              onCreatePressed(nativeEvent);
            }
          : undefined
      }
      onCleared={
        onCleared
          ? () => {
              onCleared();
            }
          : undefined
      }
    />
  );
}
