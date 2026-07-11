import {
  Box,
  Column,
  HorizontalDivider,
  RNHostView,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  clickable,
  fillMaxWidth,
  height,
  horizontalScroll,
  offset,
  onGloballyPositioned,
  padding,
  width,
} from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import {
  SlidingTabIndicator,
  type TabLayout,
} from '@/components/ui/tab-row/sliding-tab-indicator';
import {
  TAB_HORIZONTAL_PADDING,
  TAB_INDICATOR_HEIGHT,
  TAB_VERTICAL_PADDING_BOTTOM,
  TAB_VERTICAL_PADDING_TOP,
} from '@/components/ui/tab-row/tab-row-tokens';
import type { AppTabItem } from '@/components/ui/tab-row/types';

type AppTabRowProps<T extends string> = {
  tabs: AppTabItem<T>[];
  selectedIndex: number;
  pagePosition: SharedValue<number>;
  onTabSelected: (index: number, tab: AppTabItem<T>) => void;
};

export function AppTabRow<T extends string>({
  tabs,
  selectedIndex,
  pagePosition,
  onTabSelected,
}: AppTabRowProps<T>) {
  const colors = useMaterialColors();
  const contentOriginX = useRef(0);
  const measuredLayouts = useRef<TabLayout[]>(tabs.map(() => ({ x: 0, width: 0 })));
  const tabLayouts = useSharedValue<TabLayout[]>(tabs.map(() => ({ x: 0, width: 0 })));
  const [indicatorTrackWidth, setIndicatorTrackWidth] = useState(0);

  useEffect(() => {
    measuredLayouts.current = tabs.map(() => ({ x: 0, width: 0 }));
    tabLayouts.value = tabs.map(() => ({ x: 0, width: 0 }));
    setIndicatorTrackWidth(0);
  }, [tabLayouts, tabs]);

  const publishLayouts = () => {
    if (!measuredLayouts.current.every((layout) => layout.width > 0)) {
      return;
    }

    const nextLayouts = measuredLayouts.current.map((layout) => ({ ...layout }));
    tabLayouts.value = nextLayouts;

    const last = nextLayouts[nextLayouts.length - 1];
    setIndicatorTrackWidth(last.x + last.width);
  };

  return (
    <Column modifiers={[fillMaxWidth()]}>
      <Row modifiers={[fillMaxWidth(), horizontalScroll()]} verticalAlignment="bottom">
        <Column
          modifiers={[
            onGloballyPositioned((layout) => {
              contentOriginX.current = layout.x;
            }),
          ]}>
          <Row verticalAlignment="center">
            {tabs.map((tab, index) => {
              const isSelected = index === selectedIndex;

              return (
                <Column
                  key={tab.id}
                  modifiers={[
                    padding(
                      TAB_HORIZONTAL_PADDING,
                      TAB_VERTICAL_PADDING_TOP,
                      TAB_HORIZONTAL_PADDING,
                      TAB_VERTICAL_PADDING_BOTTOM + TAB_INDICATOR_HEIGHT
                    ),
                    clickable(() => onTabSelected(index, tab)),
                    onGloballyPositioned((layout) => {
                      measuredLayouts.current[index] = {
                        x: Math.max(layout.x - contentOriginX.current, 0),
                        width: layout.width,
                      };
                      publishLayouts();
                    }),
                  ]}
                  horizontalAlignment="center"
                  verticalArrangement="center">
                  <Text
                    color={isSelected ? colors.primary : colors.onSurfaceVariant}
                    style={{ typography: 'titleMedium' }}>
                    {tab.label}
                  </Text>
                </Column>
              );
            })}
          </Row>

          {indicatorTrackWidth > 0 ? (
            <RNHostView
              matchContents
              modifiers={[
                height(TAB_INDICATOR_HEIGHT),
                width(indicatorTrackWidth),
                offset(0, -TAB_INDICATOR_HEIGHT),
              ]}
              style={{ width: indicatorTrackWidth, height: TAB_INDICATOR_HEIGHT }}>
              <View
                pointerEvents="none"
                style={{ width: indicatorTrackWidth, height: TAB_INDICATOR_HEIGHT }}>
                <SlidingTabIndicator
                  pagePosition={pagePosition}
                  tabCount={tabs.length}
                  color={colors.primary}
                  height={TAB_INDICATOR_HEIGHT}
                  tabLayouts={tabLayouts}
                />
              </View>
            </RNHostView>
          ) : (
            <Box modifiers={[height(TAB_INDICATOR_HEIGHT), offset(0, -TAB_INDICATOR_HEIGHT)]} />
          )}
        </Column>
      </Row>

      <HorizontalDivider thickness={1} color={colors.outlineVariant} />
    </Column>
  );
}
