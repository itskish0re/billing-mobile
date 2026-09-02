import { Text } from '@expo/ui';

import { BillFormAccordionSection, BillFormSectionIcons } from '@/components/bill-form';
import { Accordion } from '@/components/ui/accordion';

/** Non-Android fallback — bill form placeholder. */
export function HomeScreen() {
  return (
    <Accordion type="multiple" defaultValue={['header']}>
      <BillFormAccordionSection
        value="header"
        title="Header Information"
        icon={BillFormSectionIcons.header}>
        <Text>Bill header fields (Android only).</Text>
      </BillFormAccordionSection>

      <BillFormAccordionSection
        value="loads"
        title="Load Details"
        icon={BillFormSectionIcons.loads}
        badge="0 of 3 Max">
        <Text>Load lines (Android only).</Text>
      </BillFormAccordionSection>

      <BillFormAccordionSection
        value="charges"
        title="Charges Summary"
        icon={BillFormSectionIcons.charges}>
        <Text>Freight, commission, and totals (Android only).</Text>
      </BillFormAccordionSection>
    </Accordion>
  );
}
