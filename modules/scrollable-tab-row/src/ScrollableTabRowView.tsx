import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import { requireNativeView } from 'expo';
import { forwardRef } from 'react';
import type { Ref } from 'react';

import type {
  ScrollableTabRowHandle,
  ScrollableTabRowProps,
  ScrollableTabSelectedEvent,
} from './ScrollableTabRow.types';

type NativeProps = Omit<ScrollableTabRowProps, 'onTabSelected' | 'modifiers'> &
  PrimitiveBaseProps & {
    ref?: Ref<ScrollableTabRowHandle>;
    onTabSelected?: (event: { nativeEvent: ScrollableTabSelectedEvent }) => void;
  };

const NativeScrollableTabRow = requireNativeView<NativeProps>(
  'ScrollableTabRow',
  'ScrollableTabRowView'
);

const ScrollableTabRowView = forwardRef<
  ScrollableTabRowHandle,
  ScrollableTabRowProps & PrimitiveBaseProps
>(function ScrollableTabRowView({ onTabSelected, modifiers, ...props }, ref) {
  return (
    <NativeScrollableTabRow
      {...props}
      ref={ref}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onTabSelected={
        onTabSelected
          ? ({ nativeEvent }) => {
              onTabSelected(nativeEvent);
            }
          : undefined
      }
    />
  );
});

export default ScrollableTabRowView;
