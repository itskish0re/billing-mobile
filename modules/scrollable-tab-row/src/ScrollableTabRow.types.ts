import type { PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import type { ColorValue } from 'react-native';

/** Opaque native ObservableState from useNativeState — keep structural to avoid deep @expo/ui imports. */
export type ScrollableTabPagePosition = {
  value: number;
};

export type ScrollableTabItem = {
  id: string;
  label: string;
};

export type ScrollableTabRowHandle = {
  animateScrollToIndex: (index: number) => Promise<void>;
};

export type ScrollableTabSelectedEvent = {
  index: number;
  id: string;
};

export type ScrollableTabRowProps = {
  tabs: ScrollableTabItem[];
  selectedIndex: number;
  /** Continuous pager position from useNativeState — keeps the indicator in sync while swiping. */
  pagePosition?: ScrollableTabPagePosition;
  selectedColor?: ColorValue;
  unselectedColor?: ColorValue;
  indicatorColor?: ColorValue;
  onTabSelected?: (event: ScrollableTabSelectedEvent) => void;
} & PrimitiveBaseProps;
