import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

export type TabLayout = {
  x: number;
  width: number;
};

type SlidingTabIndicatorProps = {
  pagePosition: SharedValue<number>;
  tabCount: number;
  color: string;
  height?: number;
  /** Measured tab frames. When set, indicator lerps between real tab widths/offsets. */
  tabLayouts?: SharedValue<TabLayout[]>;
};

function lerp(start: number, end: number, fraction: number) {
  'worklet';
  return start + (end - start) * fraction;
}

export function SlidingTabIndicator({
  pagePosition,
  tabCount,
  color,
  height = 3,
  tabLayouts,
}: SlidingTabIndicatorProps) {
  const equalTabWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => {
    const position = Math.min(Math.max(pagePosition.value, 0), Math.max(tabCount - 1, 0));
    const layouts = tabLayouts?.value;

    if (layouts && layouts.length === tabCount) {
      const leftIndex = Math.min(Math.floor(position), tabCount - 1);
      const rightIndex = Math.min(leftIndex + 1, tabCount - 1);
      const fraction = position - leftIndex;
      const left = layouts[leftIndex];
      const right = layouts[rightIndex];

      if (left && right) {
        return {
          width: lerp(left.width, right.width, fraction),
          transform: [{ translateX: lerp(left.x, right.x, fraction) }],
        };
      }
    }

    const width = equalTabWidth.value;
    return {
      width,
      transform: [{ translateX: position * width }],
    };
  });

  return (
    <View
      style={[styles.track, { height }]}
      onLayout={(event) => {
        if (tabLayouts) {
          return;
        }

        const width = event.nativeEvent.layout.width;
        equalTabWidth.value = tabCount > 0 ? width / tabCount : 0;
      }}>
      <Animated.View style={[styles.indicator, { backgroundColor: color, height }, indicatorStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  indicator: {
    borderRadius: 1.5,
  },
});
