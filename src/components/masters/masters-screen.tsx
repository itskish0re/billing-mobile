import { Text, TextInput } from '@expo/ui';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppTabRow, type AppTabItem } from '@/components/ui/tab-row';

export type MastersTab =
  | 'name-boards'
  | 'trucks'
  | 'locations'
  | 'parties'
  | 'goods'
  | 'units'
  | 'financial-years';

const MASTERS_TABS: AppTabItem<MastersTab>[] = [
  { id: 'name-boards', label: 'Name boards' },
  { id: 'trucks', label: 'Trucks' },
  { id: 'locations', label: 'Locations' },
  { id: 'parties', label: 'Parties' },
  { id: 'goods', label: 'Goods' },
  { id: 'units', label: 'Units' },
  { id: 'financial-years', label: 'Financial years' },
];

export function MastersScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const activeTab = MASTERS_TABS[selectedIndex];

  return (
    <View style={styles.container}>
      <AppTabRow
        tabs={MASTERS_TABS}
        selectedIndex={selectedIndex}
        onTabSelected={(index) => setSelectedIndex(index)}
      />
      <View style={styles.search}>
        <TextInput
          placeholder={`Search ${activeTab.label.toLowerCase()}`}
          onChangeText={setSearchQuery}
        />
      </View>
      <Text textStyle={styles.placeholder}>
        {searchQuery
          ? `No ${activeTab.label.toLowerCase()} match "${searchQuery}"`
          : `${activeTab.label} will appear here`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  search: {
    paddingHorizontal: 16,
  },
  placeholder: {
    flex: 1,
    opacity: 0.7,
    textAlign: 'center',
  },
});
