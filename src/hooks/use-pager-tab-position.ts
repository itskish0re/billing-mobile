import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Pager → tab indicator sync on the UI thread.
 * Scroll position never goes through React state (that caused lag/jitter).
 */
export function usePagerTabPosition(initialPage = 0): {
  pagePosition: SharedValue<number>;
  handlePageScroll: (page: number, offsetFraction: number) => void;
  handleSettledPage: (page: number) => void;
  selectPage: (page: number) => void;
} {
  const pagePosition = useSharedValue(initialPage);

  const handlePageScroll = (page: number, offsetFraction: number) => {
    'worklet';
    cancelAnimation(pagePosition);
    pagePosition.value = page + offsetFraction;
  };

  const handleSettledPage = (page: number) => {
    'worklet';
    cancelAnimation(pagePosition);
    pagePosition.value = page;
  };

  const selectPage = (page: number) => {
    pagePosition.value = withTiming(page, {
      duration: 250,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };

  return {
    pagePosition,
    handlePageScroll,
    handleSettledPage,
    selectPage,
  };
}
