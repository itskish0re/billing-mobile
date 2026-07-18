import {
  Box,
  Button,
  Column,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  background,
  fillMaxSize,
  fillMaxWidth,
  padding,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

import { BillFormAccordionSection } from '@/components/bill-form/bill-form-accordion-section';
import { BillFormHeaderFields } from '@/components/bill-form/bill-form-header-fields';
import { BillFormSectionIcons } from '@/components/bill-form/bill-form-section-icons';
import {
  MastersFormPanel,
  type MastersFormMode,
} from '@/components/masters/masters-form-panel';
import type { MastersTab } from '@/components/masters/masters-types';
import { Accordion } from '@/components/ui/accordion';
import { useSnackbar } from '@/providers/snackbar-provider';

export type BillFormPanelProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Full-width bill create/edit surface (host lives in a full-screen Modal).
 * Cancel / Save sit in the top bar. Master create slides over as a side panel.
 */
export function BillFormPanel({ visible, onClose }: BillFormPanelProps) {
  const colors = useMaterialColors();
  const { showSnackbar } = useSnackbar();
  const [masterTab, setMasterTab] = useState<MastersTab | null>(null);
  const masterMode: MastersFormMode = 'create';

  if (!visible) {
    return null;
  }

  const masterFormOpen = masterTab != null;

  const handleSave = () => {
    void showSnackbar('Bill save will be wired next', { variant: 'success' });
  };

  return (
    <Box modifiers={[fillMaxSize()]}>
      <Column
        modifiers={[fillMaxSize(), background(colors.surface), padding(16, 8, 16, 12)]}
        verticalArrangement={{ spacedBy: 0 }}>
        <Row
          modifiers={[fillMaxWidth(), padding(0, 4, 0, 12)]}
          verticalAlignment="center"
          horizontalArrangement={{ spacedBy: 8 }}>
          <Button onClick={onClose} enabled={!masterFormOpen}>
            <Text>Cancel</Text>
          </Button>
          <Column modifiers={[weight(1)]} horizontalAlignment="center">
            <Text style={{ typography: 'titleLarge' }}>New bill</Text>
          </Column>
          <Button enabled={!masterFormOpen} onClick={handleSave}>
            <Text>Save</Text>
          </Button>
        </Row>

        <Column
          modifiers={[fillMaxWidth(), weight(1)]}
          verticalArrangement={{ spacedBy: 12 }}>
          <Accordion type="multiple" defaultValue={['header']}>
            <BillFormAccordionSection
              value="header"
              title="Header Information"
              icon={BillFormSectionIcons.header}>
              <BillFormHeaderFields
                onCreateMaster={(tab) => {
                  setMasterTab(tab);
                }}
              />
            </BillFormAccordionSection>

            <BillFormAccordionSection
              value="loads"
              title="Load Details"
              icon={BillFormSectionIcons.loads}
              badge="0 of 3 Max">
              <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyMedium' }}>
                Load lines will go here. Use “+ Add new …” under lookups when a master is missing.
              </Text>
            </BillFormAccordionSection>

            <BillFormAccordionSection
              value="charges"
              title="Charges Summary"
              icon={BillFormSectionIcons.header}>
              <Text color={colors.onSurfaceVariant} style={{ typography: 'bodyMedium' }}>
                Freight, commission, and totals will go here.
              </Text>
            </BillFormAccordionSection>
          </Accordion>
        </Column>
      </Column>

      <MastersFormPanel
        tab={masterTab ?? 'trucks'}
        visible={masterFormOpen}
        mode={masterMode}
        presentation="side"
        onClose={() => {
          setMasterTab(null);
        }}
        onSaved={() => {
          setMasterTab(null);
        }}
      />
    </Box>
  );
}
