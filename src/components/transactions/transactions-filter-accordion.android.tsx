import { Row } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { type ReactNode } from 'react';

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
      <Row modifiers={[fillMaxWidth()]} horizontalArrangement={{ spacedBy: 12 }} verticalAlignment="top">
        {children}
      </Row>
      {extra}
    </FilterAccordion>
  );
}
