import { Column, Row, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { background, clip, fillMaxWidth, padding, Shapes, weight } from '@expo/ui/jetpack-compose/modifiers';

import {
  formatBillFormAmount,
  formatBillFormCurrency,
  sumLoadAdvances,
  toFormNumber,
} from '@/lib/bills/bill-form';
import type { BillFormValues } from '@/types/bill-form';

export type BillAdvanceSummaryProps = {
  values: BillFormValues;
};

export function BillAdvanceSummary({ values }: BillAdvanceSummaryProps) {
  const colors = useMaterialColors();
  const totalAdvance = sumLoadAdvances(values.loads);
  const grandTotal = toFormNumber(values.total) ?? 0;
  const netBalance = totalAdvance - grandTotal;

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 12 }}>
      <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
        <Text
          modifiers={[weight(1)]}
          color={colors.onSurfaceVariant}
          style={{ typography: 'bodySmall' }}>
          Total Advance
        </Text>
        <Text style={{ typography: 'bodyMedium' }}>{formatBillFormAmount(totalAdvance)}</Text>
      </Row>

      <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
        <Text
          modifiers={[weight(1)]}
          color={colors.onSurfaceVariant}
          style={{ typography: 'bodySmall' }}>
          Grand Total
        </Text>
        <Text style={{ typography: 'titleSmall' }}>{formatBillFormCurrency(grandTotal)}</Text>
      </Row>

      <Row
        verticalAlignment="center"
        modifiers={[
          fillMaxWidth(),
          clip(Shapes.RoundedCorner(8)),
          background(colors.surfaceContainerHigh),
          padding(12, 12, 12, 12),
        ]}>
        <Text modifiers={[weight(1)]} style={{ typography: 'titleSmall' }}>
          Net Balance
        </Text>
        <Text color={colors.primary} style={{ typography: 'titleSmall' }}>
          {formatBillFormCurrency(netBalance)}
        </Text>
      </Row>
    </Column>
  );
}
