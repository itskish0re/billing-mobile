import {
  Box,
  Button,
  Column,
  HorizontalDivider,
  Row,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  background,
  clickable,
  fillMaxSize,
  fillMaxWidth,
  imePadding,
  padding,
  verticalScroll,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';

import { BillAdvanceSummary } from '@/components/bill-form/bill-advance-summary';
import { BillChargesSummary } from '@/components/bill-form/bill-charges-summary';
import { BillFormAccordionSection } from '@/components/bill-form/bill-form-accordion-section';
import type {
  BillCreateMasterRequest,
  BillCreateMasterTarget,
} from '@/components/bill-form/bill-form-header-fields';
import { BillFormHeaderFields } from '@/components/bill-form/bill-form-header-fields';
import { BillFormSectionIcons } from '@/components/bill-form/bill-form-section-icons';
import { BillLoadLines } from '@/components/bill-form/bill-load-lines';
import { BillPaymentPanel } from '@/components/bill-form/bill-payment-panel';
import {
  MastersFormPanel,
  type MastersFormMode,
} from '@/components/masters/masters-form-panel';
import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { Accordion } from '@/components/ui/accordion';
import { useBillMutations } from '@/hooks/use-bill-mutations';
import {
  BILL_FORM_MAX_LOAD_ROWS,
  createInitialBillFormValues,
  recalculateBillForm,
  sumLoadAdvances,
} from '@/lib/bills/bill-form';
import { mapBillFormToPreview } from '@/lib/bills/bill-preview';
import { validateBillForm } from '@/lib/validation/bill-form-schema';
import { useBillPreview } from '@/providers/bill-preview-provider';
import { useSnackbar } from '@/providers/snackbar-provider';
import type { BillFormValues, BillLoadFormLine } from '@/types/bill-form';

export type BillFormPanelProps = {
  visible: boolean;
  onClose: () => void;
  /** 'edit' prefills from `initialValues` and skips bill-number auto-assign. */
  mode?: 'create' | 'edit';
  /** Existing bill values to edit; omit for a fresh bill. */
  initialValues?: BillFormValues | null;
  /** Status-bar inset from the root SafeAreaProvider (Modal insets are often 0). */
  topInset?: number;
  /** Navigation-bar inset from the root SafeAreaProvider. */
  bottomInset?: number;
};

type MasterCreateState = {
  tab: MastersTab;
  defaults: Record<string, string>;
  target: BillCreateMasterTarget;
};

function applyCreatedMasterToValues(
  values: BillFormValues,
  target: BillCreateMasterTarget,
  row: MasterListRow
): BillFormValues {
  if (target.kind === 'from') {
    return { ...values, fromId: row.id, fromLocationName: row.title };
  }

  if (target.kind === 'truck') {
    return {
      ...values,
      truckId: row.id,
      truckNumber: row.title,
      nameBoardName: row.values.name_board_name ?? row.subtitle ?? '',
      ownerName: row.values.owner_name ?? '',
      ownerMobile: row.values.owner_phone ?? '',
    };
  }

  const { index, field } = target;

  const loads = values.loads.map((line, i) => {
    if (i !== index) {
      return line;
    }

    switch (field) {
      case 'consignor':
        return { ...line, consignorId: row.id, consignorName: row.title };
      case 'consignee':
        return {
          ...line,
          consigneeId: row.id,
          consigneeName: row.title,
          asPerBill: false,
        };
      case 'destination':
        return { ...line, toId: row.id, toLocationName: row.title };
      case 'goods':
        return { ...line, goodsId: row.id, goodsName: row.title };
      case 'unit':
        return {
          ...line,
          unitId: row.id,
          unitName: row.title,
          unitIsFixed: row.values.is_fixed === 'true',
        };
      default:
        return line;
    }
  });

  return { ...values, loads };
}

/**
 * Full-width bill create/edit surface (host lives in a full-screen Modal).
 * Fixed header (title + Preview), scrollable body, sticky Cancel/Save action bar.
 */
export function BillFormPanel({
  visible,
  onClose,
  mode = 'create',
  initialValues = null,
  topInset = 0,
  bottomInset = 0,
}: BillFormPanelProps) {
  const colors = useMaterialColors();
  const { showSnackbar } = useSnackbar();
  const { open: openPreview } = useBillPreview();
  const { saveMutation } = useBillMutations();
  const [values, setValues] = useState(() => initialValues ?? createInitialBillFormValues());
  const isEdit = mode === 'edit';
  const isSaving = saveMutation.isPending;
  const [masterCreate, setMasterCreate] = useState<MasterCreateState | null>(null);
  const masterMode: MastersFormMode = 'create';
  const headerColor = colors.secondaryContainer;
  const headerContentColor = colors.onSecondaryContainer;

  const patchValues = useCallback((patch: Partial<BillFormValues>) => {
    setValues((previous) => recalculateBillForm({ ...previous, ...patch }));
  }, []);

  if (!visible) {
    return null;
  }

  const masterFormOpen = masterCreate != null;
  const showAdvanceSummary = sumLoadAdvances(values.loads) > 0;
  const loadCount = values.loads.length;

  const handleSave = () => {
    Keyboard.dismiss();
    const computed = recalculateBillForm(values);
    const validation = validateBillForm(computed);
    if (!validation.success) {
      void showSnackbar(validation.message, { variant: 'error' });
      return;
    }

    saveMutation.mutate(
      { values: computed, loads: validation.loads },
      {
        onSuccess: () => {
          onClose();
          void showSnackbar(isEdit ? 'Bill updated' : 'Bill created', { variant: 'success' });
        },
        onError: (err) => {
          void showSnackbar(err instanceof Error ? err.message : 'Could not save the bill.', {
            variant: 'error',
          });
        },
      }
    );
  };

  const handlePreview = () => {
    Keyboard.dismiss();
    openPreview(mapBillFormToPreview(values));
  };

  const openMasterCreate = (request: BillCreateMasterRequest) => {
    setMasterCreate({
      tab: request.tab,
      defaults: request.defaults,
      target: request.target,
    });
  };

  return (
    <Box modifiers={[fillMaxSize()]}>
      <Column modifiers={[fillMaxSize(), background(headerColor)]} verticalArrangement={{ spacedBy: 0 }}>
        <Column modifiers={[fillMaxWidth(), background(headerColor)]}>
          <Row
            modifiers={[
              fillMaxWidth(),
              padding(16, topInset + 12, 16, 12),
            ]}
            verticalAlignment="center">
            <Column modifiers={[weight(1)]} />
            <Text color={headerContentColor} style={{ typography: 'titleLarge' }}>
              {isEdit ? 'Edit bill' : 'New bill'}
            </Text>
            <Column modifiers={[weight(1)]} horizontalAlignment="end">
              <Button enabled={!masterFormOpen && !isSaving} onClick={handlePreview}>
                <Text>Preview</Text>
              </Button>
            </Column>
          </Row>
          <HorizontalDivider thickness={1} color={colors.outlineVariant} />
        </Column>

        <Column
          modifiers={[
            fillMaxWidth(),
            weight(1),
            background(colors.surface),
            clickable(() => Keyboard.dismiss(), { indication: false }),
            imePadding(),
            padding(16, 12, 16, 12),
            verticalScroll(),
          ]}
          verticalArrangement={{ spacedBy: 12 }}>
          <Accordion
            type="multiple"
            defaultValue={['header', 'loads', 'charges', 'payment', 'advance']}>
            <BillFormAccordionSection
              value="header"
              title="Header Information"
              icon={BillFormSectionIcons.header}>
              <BillFormHeaderFields
                values={values}
                onPatch={patchValues}
                onCreateMaster={openMasterCreate}
                autoAssignBillNumber={!isEdit}
              />
            </BillFormAccordionSection>

            <BillFormAccordionSection
              value="loads"
              title="Load Details"
              icon={BillFormSectionIcons.loads}
              badge={`${loadCount} of ${BILL_FORM_MAX_LOAD_ROWS} Max`}>
              <BillLoadLines
                loads={values.loads}
                onChange={(loads: BillLoadFormLine[]) => patchValues({ loads })}
                onCreateMaster={openMasterCreate}
              />
            </BillFormAccordionSection>

            <BillFormAccordionSection
              value="charges"
              title="Charges Summary"
              icon={BillFormSectionIcons.charges}>
              <BillChargesSummary
                values={values}
                onNumericChange={(key, value) => patchValues({ [key]: value })}
                onTruckLoanChange={(truckLoan) => patchValues({ truckLoan })}
                onOthersChange={(others) => patchValues({ others })}
              />
            </BillFormAccordionSection>

            <BillFormAccordionSection
              value="payment"
              title="Payment Details"
              icon={BillFormSectionIcons.payment}>
              <BillPaymentPanel values={values} onPatch={patchValues} />
            </BillFormAccordionSection>

            {showAdvanceSummary ? (
              <BillFormAccordionSection
                value="advance"
                title="Advance Summary"
                icon={BillFormSectionIcons.advance}>
                <BillAdvanceSummary values={values} />
              </BillFormAccordionSection>
            ) : null}
          </Accordion>
        </Column>

        <Column
          modifiers={[
            fillMaxWidth(),
            background(headerColor),
            padding(0, 0, 0, bottomInset),
          ]}>
          <Row
            modifiers={[fillMaxWidth(), padding(16, 12, 16, 12)]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 8 }}>
            <Button onClick={onClose} enabled={!masterFormOpen && !isSaving}>
              <Text>Cancel</Text>
            </Button>
            <Column modifiers={[weight(1)]} />
            <Button enabled={!masterFormOpen && !isSaving} onClick={handleSave}>
              <Text>{isSaving ? 'Saving…' : 'Save'}</Text>
            </Button>
          </Row>
        </Column>
      </Column>

      <MastersFormPanel
        tab={masterCreate?.tab ?? 'trucks'}
        visible={masterFormOpen}
        mode={masterMode}
        presentation="side"
        createDefaults={masterCreate?.defaults ?? null}
        onClose={() => {
          setMasterCreate(null);
        }}
        onSaved={(row) => {
          if (row && masterCreate) {
            const target = masterCreate.target;
            setValues((previous) =>
              recalculateBillForm(applyCreatedMasterToValues(previous, target, row))
            );
          }
          setMasterCreate(null);
        }}
      />
    </Box>
  );
}
