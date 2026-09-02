import {
  Column,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';

import { FormTextField } from '@/components/ui/form-fields';
import type { BillFormValues } from '@/types/bill-form';

export type BillPaymentPanelProps = {
  values: BillFormValues;
  onPatch: (patch: Partial<BillFormValues>) => void;
};

const PAY_BY_OPTIONS = [
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'owner', label: 'Owner' },
] as const;

/**
 * Payment mode selector (UPI / Cash / Owner). UPI reveals the paid name and
 * mobile inputs; switching away clears them, mirroring the web form. The parent
 * `values` remains the single source of truth.
 */
export function BillPaymentPanel({ values, onPatch }: BillPaymentPanelProps) {
  const colors = useMaterialColors();
  const isUpi = values.payBy === 'upi';
  const monoTextStyle = { fontFamily: 'monospace', letterSpacing: 1 } as const;

  const selectPayBy = (payBy: string) => {
    if (payBy === 'upi') {
      onPatch({ payBy });
      return;
    }
    onPatch({ payBy, paidName: '', paidMobile: '' });
  };

  return (
    <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
      <Text color={colors.onSurfaceVariant} style={{ typography: 'labelLarge' }}>
        Payment Mode
      </Text>

      <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
        {PAY_BY_OPTIONS.map((option) => (
          <SegmentedButton
            key={option.value}
            selected={values.payBy === option.value}
            onClick={() => selectPayBy(option.value)}>
            <SegmentedButton.Label>
              <Text>{option.label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>

      {isUpi ? (
        <>
          <FormTextField
            label="Paid name"
            required
            capitalization="words"
            imeAction="next"
            initialText={values.paidName}
            onChangeText={(paidName) => onPatch({ paidName })}
          />
          <FormTextField
            label="Paid mobile"
            required
            keyboardType="phone"
            maxLength={10}
            imeAction="done"
            textStyle={monoTextStyle}
            initialText={values.paidMobile}
            onChangeText={(paidMobile) => onPatch({ paidMobile })}
          />
        </>
      ) : (
        <Text color={colors.onSurfaceVariant} style={{ typography: 'bodySmall' }}>
          {values.payBy
            ? 'Name and mobile are only required for UPI.'
            : 'Select how payment was made.'}
        </Text>
      )}
    </Column>
  );
}
