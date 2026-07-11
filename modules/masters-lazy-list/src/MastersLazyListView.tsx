import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import { requireNativeView } from 'expo';

import type {
  MastersLazyListItemActionEvent,
  MastersLazyListProps,
} from './MastersLazyList.types';

type NativeProps = Omit<MastersLazyListProps, 'onEdit' | 'onDelete' | 'onRefresh' | 'modifiers'> &
  PrimitiveBaseProps & {
    onEdit?: (event: { nativeEvent: MastersLazyListItemActionEvent }) => void;
    onDelete?: (event: { nativeEvent: MastersLazyListItemActionEvent }) => void;
    onRefresh?: (event: { nativeEvent: { requested: boolean } }) => void;
  };

const NativeMastersLazyList = requireNativeView<NativeProps>(
  'MastersLazyList',
  'MastersLazyListView'
);

export default function MastersLazyListView({
  onEdit,
  onDelete,
  onRefresh,
  modifiers,
  items,
  ...props
}: MastersLazyListProps & PrimitiveBaseProps) {
  return (
    <NativeMastersLazyList
      {...props}
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle ?? '',
        meta: item.meta ?? '',
      }))}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onEdit={
        onEdit
          ? ({ nativeEvent }) => {
              onEdit(nativeEvent);
            }
          : undefined
      }
      onDelete={
        onDelete
          ? ({ nativeEvent }) => {
              onDelete(nativeEvent);
            }
          : undefined
      }
      onRefresh={
        onRefresh
          ? () => {
              onRefresh();
            }
          : undefined
      }
    />
  );
}
