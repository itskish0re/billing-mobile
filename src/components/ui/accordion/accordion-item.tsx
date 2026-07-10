import { Collapsible } from '@expo/ui';
import { type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { useAccordionItemState } from '@/components/ui/accordion/accordion-context';

export type AccordionItemProps = {
  value: string;
  title: string;
  defaultOpen?: boolean;
  compact?: boolean;
  iconSource?: ImageSourcePropType;
  action?: ReactNode;
  children?: ReactNode;
};

export function AccordionItem({
  value,
  title,
  defaultOpen = false,
  children,
}: AccordionItemProps) {
  const { isOpen, setOpen } = useAccordionItemState(value, defaultOpen);

  return (
    <Collapsible isOpen={isOpen} onOpenChange={setOpen} label={title}>
      {children}
    </Collapsible>
  );
}
