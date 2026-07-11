import { Row } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { type ReactNode } from 'react';

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
      <Row modifiers={[fillMaxWidth()]} horizontalArrangement={{ spacedBy: 12 }} verticalAlignment="top">
        {children}
      </Row>
    </FilterAccordion>
  );
}
