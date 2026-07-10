import { type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { AccordionItem } from '@/components/ui/accordion';

export type BillFormAccordionSectionProps = {
  value: string;
  title: string;
  icon: ImageSourcePropType;
  badge?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function BillFormAccordionSection({
  value,
  title,
  icon,
  badge,
  action,
  children,
}: BillFormAccordionSectionProps) {
  const titleWithBadge = badge ? `${title} (${badge})` : title;

  return (
    <AccordionItem value={value} title={titleWithBadge} iconSource={icon} action={action}>
      {children}
    </AccordionItem>
  );
}
