import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Collapsible } from '@expo/ui';

export type FilterAccordionProps = {
  children?: ReactNode;
};

export function FilterAccordion({ children }: FilterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Collapsible isOpen={isOpen} onOpenChange={setIsOpen} label="Filter">
        <View style={styles.content}>{children}</View>
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
