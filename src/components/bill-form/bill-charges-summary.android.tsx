import {
  Column,
  Icon,
  IconButton,
  OutlinedButton,
  Row,
  Spacer,
  Switch,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, padding, weight } from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

import { OtherChargeDialog } from '@/components/bill-form/other-charge-dialog';
import { FormNumericField } from '@/components/ui/form-fields';
import {
  formatBillFormCurrency,
  isTruckLoanAllowed,
  toFormNumber,
} from '@/lib/bills/bill-form';
import { createBillOtherItem, type BillFormValues, type BillOtherItem } from '@/types/bill-form';

const DELETE_ICON = require('@/assets/icons/delete.xml');

export type BillChargesSummaryProps = {
  values: BillFormValues;
  onNumericChange: (
    key: 'crossing' | 'officeMamul' | 'tapalMamul' | 'diesel' | 'handLoan',
    value: number | ''
  ) => void;
  onTruckLoanChange: (checked: boolean) => void;
  onOthersChange: (items: BillOtherItem[]) => void;
};

function ChargeReadOnlyRow({ label, amount }: { label: string; amount: number | '' }) {
  const colors = useMaterialColors();
  const n = toFormNumber(amount);

  return (
    <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
      <Text modifiers={[weight(1)]} color={colors.onSurface} style={{ typography: 'bodyMedium' }}>
        {label}
      </Text>
      <Text color={colors.onSurface} style={{ typography: 'bodyMedium' }}>
        {n == null ? '' : formatBillFormCurrency(n)}
      </Text>
    </Row>
  );
}

export function BillChargesSummary({
  values,
  onNumericChange,
  onTruckLoanChange,
  onOthersChange,
}: BillChargesSummaryProps) {
  const colors = useMaterialColors();
  const truckLoanEnabled = isTruckLoanAllowed(values.loads);
  const others = values.others;
  const [dialogOpen, setDialogOpen] = useState(false);

  const updateOtherAmount = (uid: string, value: number | '') => {
    onOthersChange(others.map((item) => (item.uid === uid ? { ...item, value } : item)));
  };

  const removeOther = (uid: string) => {
    onOthersChange(others.filter((item) => item.uid !== uid));
  };

  const addOther = (name: string, amount: number | '') => {
    onOthersChange([...others, createBillOtherItem(name, amount)]);
    setDialogOpen(false);
  };

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 12 }}>
      <ChargeReadOnlyRow label="Total freight" amount={values.totalFreight} />
      <ChargeReadOnlyRow label="Commission (2%)" amount={values.commission} />

      <FormNumericField
        key="crossing"
        label="Crossing"
        onChangeNumber={(value) => onNumericChange('crossing', value)}
      />
      <FormNumericField
        key="officeMamul"
        label="Office mamul"
        onChangeNumber={(value) => onNumericChange('officeMamul', value)}
      />
      <FormNumericField
        key="tapalMamul"
        label="Tapal mamul"
        onChangeNumber={(value) => onNumericChange('tapalMamul', value)}
      />
      <FormNumericField
        key="diesel"
        label="Diesel"
        onChangeNumber={(value) => onNumericChange('diesel', value)}
      />
      <FormNumericField
        key="handLoan"
        label="Hand loan"
        onChangeNumber={(value) => onNumericChange('handLoan', value)}
      />

      {others.map((item) => (
        <Row key={item.uid} verticalAlignment="center" modifiers={[fillMaxWidth()]}>
          <FormNumericField
            label={item.key}
            compact
            initialValue={item.value}
            onChangeNumber={(value) => updateOtherAmount(item.uid, value)}
          />
          <IconButton onClick={() => removeOther(item.uid)}>
            <Icon source={DELETE_ICON} size={20} tint={colors.error} />
          </IconButton>
        </Row>
      ))}

      <OutlinedButton onClick={() => setDialogOpen(true)}>
        <Text>Add other charge</Text>
      </OutlinedButton>

      <Row verticalAlignment="center" modifiers={[fillMaxWidth(), padding(0, 4, 0, 0)]}>
        <Column modifiers={[weight(1)]} verticalArrangement={{ spacedBy: 2 }}>
          <Text style={{ typography: 'bodyMedium' }}>Truck loan</Text>
          <Text color={colors.onSurfaceVariant} style={{ typography: 'bodySmall' }}>
            {!truckLoanEnabled
              ? 'Disabled when advance is entered'
              : values.truckLoan
                ? 'Yes'
                : 'No'}
          </Text>
        </Column>
        <Switch
          value={values.truckLoan}
          enabled={truckLoanEnabled}
          onCheckedChange={onTruckLoanChange}
        />
      </Row>

      <Row verticalAlignment="center" modifiers={[fillMaxWidth(), padding(0, 8, 0, 4)]}>
        <Text modifiers={[weight(1)]} style={{ typography: 'titleMedium' }}>
          Grand Total
        </Text>
        <Spacer />
        <Text color={colors.primary} style={{ typography: 'titleMedium' }}>
          {formatBillFormCurrency(toFormNumber(values.total) ?? 0)}
        </Text>
      </Row>

      {dialogOpen ? (
        <OtherChargeDialog onAdd={addOther} onDismiss={() => setDialogOpen(false)} />
      ) : null}
    </Column>
  );
}
