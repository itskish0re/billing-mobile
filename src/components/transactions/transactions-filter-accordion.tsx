import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { FilterAccordion } from '@/components/ui/filter-accordion';

type TransactionsFilterAccordionProps = {
  onSearchQueryChange: (query: string) => void;
  children: ReactNode;
};

export function TransactionsFilterAccordion({
  onSearchQueryChange,
  children,
}: TransactionsFilterAccordionProps) {
  return (
    <FilterAccordion
      searchPlaceholder="Search bills and loads"
      onSearchQueryChange={onSearchQueryChange}>
      <View style={styles.dateRow}>{children}</View>
    </FilterAccordion>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
