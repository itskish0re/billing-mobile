import { Text } from '@expo/ui';

import {
  BillFormAccordionSection,
  BillFormHeaderFields,
  BillFormSectionIcons,
} from '@/components/bill-form';
import { Accordion } from '@/components/ui/accordion';

/** Non-Android fallback — bill form placeholder. */
export function HomeScreen() {
  return (
    <Accordion type="multiple" defaultValue={['header']}>
      <BillFormAccordionSection
        value="header"
        title="Header Information"
        icon={BillFormSectionIcons.header}>
        <BillFormHeaderFields />
      </BillFormAccordionSection>

      <BillFormAccordionSection
        value="loads"
        title="Load Details"
        icon={BillFormSectionIcons.loads}
        badge="2 of 3 Max">
        <Text>Nested load line accordions will go here (up to 3 loads).</Text>
      </BillFormAccordionSection>

      <BillFormAccordionSection
        value="charges"
        title="Charges Summary"
        icon={BillFormSectionIcons.header}>
        <Text>Freight total, commission, crossing, mamul, diesel, and bill total.</Text>
      </BillFormAccordionSection>
    </Accordion>
  );
}
