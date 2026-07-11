import { Button } from '@expo/ui';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { AppTabItem } from '@/components/ui/tab-row/types';

type AppTabRowProps<T extends string> = {
  tabs: AppTabItem<T>[];
  selectedIndex: number;
  pagePosition?: SharedValue<number>;
  onTabSelected: (index: number, tab: AppTabItem<T>) => void;
};

export function AppTabRow<T extends string>({
  tabs,
  selectedIndex,
  onTabSelected,
}: AppTabRowProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {tabs.map((tab, index) => (
        <View key={tab.id} style={styles.tab}>
          <Button
            label={tab.label}
            variant={index === selectedIndex ? 'filled' : 'outlined'}
            onPress={() => onTabSelected(index, tab)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flexShrink: 0,
  },
});
