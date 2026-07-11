import { useNativeState } from '@expo/ui/jetpack-compose';

/** Mirrors `@expo/ui` ObservableState without relying on a deep import path. */
export type PagerTabPosition = {
  value: number;
  get(): number;
  set(value: number): void;
};

/**
 * Pager → tab indicator sync via Compose ObservableState (no React re-renders per frame).
 */
export function usePagerTabPosition(initialPage = 0): {
  pagePosition: PagerTabPosition;
  handlePageScroll: (page: number, offsetFraction: number) => void;
  handleSettledPage: (page: number) => void;
  selectPage: (page: number) => void;
} {
  const pagePosition = useNativeState(initialPage) as PagerTabPosition;

  const handlePageScroll = (page: number, offsetFraction: number) => {
    'worklet';
    pagePosition.value = page + offsetFraction;
  };

  const handleSettledPage = (page: number) => {
    'worklet';
    pagePosition.value = page;
  };

  const selectPage = (page: number) => {
    pagePosition.value = page;
  };

  return {
    pagePosition,
    handlePageScroll,
    handleSettledPage,
    selectPage,
  };
}
