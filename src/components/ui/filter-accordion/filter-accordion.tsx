import { Collapsible, TextInput } from '@expo/ui';
import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export type FilterAccordionProps = {
  searchPlaceholder: string;
  onSearchQueryChange: (query: string) => void;
  children?: ReactNode;
};

export function FilterAccordion({
  searchPlaceholder,
  onSearchQueryChange,
  children,
}: FilterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Collapsible isOpen={isOpen} onOpenChange={setIsOpen} label="Filter">
        <View style={styles.content}>
          {children}
          <TextInput placeholder={searchPlaceholder} onChangeText={onSearchQueryChange} />
        </View>
      </Collapsible>
      <View style={styles.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c4c7cf',
    width: '100%',
  },
});
