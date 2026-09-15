import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { FilterAccordion } from '@/components/ui/filter-accordion';

type TransactionsFilterAccordionProps = {
  children: ReactNode;
  extra?: ReactNode;
};

export function TransactionsFilterAccordion({
  children,
  extra,
}: TransactionsFilterAccordionProps) {
  return (
    <FilterAccordion>
      <View style={styles.dateRow}>{children}</View>
      {extra}
    </FilterAccordion>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
