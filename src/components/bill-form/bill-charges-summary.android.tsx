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

import {
  BillFormNumericField,
  BillFormTextField,
} from '@/components/bill-form/bill-form-fields';
import {
  formatBillFormCurrency,
  isTruckLoanAllowed,
  toFormNumber,
} from '@/lib/bills/bill-form';
import { createEmptyBillOtherItem, type BillFormValues, type BillOtherItem } from '@/types/bill-form';

const DELETE_ICON = require('@/assets/icons/delete.xml');

export type BillChargesSummaryProps = {
  values: BillFormValues;
  onNumericChange: (key: 'crossing' | 'officeMamul' | 'tapalMamul' | 'diesel' | 'handLoan', value: number | '') => void;
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
        {n == null ? '—' : formatBillFormCurrency(n)}
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

  const updateOther = (index: number, patch: Partial<BillOtherItem>) => {
    onOthersChange(others.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addOther = () => {
    onOthersChange([...others, createEmptyBillOtherItem()]);
  };

  const removeOther = (index: number) => {
    if (others.length <= 1) {
      onOthersChange([createEmptyBillOtherItem()]);
      return;
    }

    onOthersChange(others.filter((_, i) => i !== index));
  };

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 12 }}>
      <ChargeReadOnlyRow label="Total freight" amount={values.totalFreight} />
      <ChargeReadOnlyRow label="Commission (2%)" amount={values.commission} />

      <BillFormNumericField
        key="crossing"
        label="Crossing"
        onChange={(value) => onNumericChange('crossing', value)}
      />
      <BillFormNumericField
        key="officeMamul"
        label="Office mamul"
        onChange={(value) => onNumericChange('officeMamul', value)}
      />
      <BillFormNumericField
        key="tapalMamul"
        label="Tapal mamul"
        onChange={(value) => onNumericChange('tapalMamul', value)}
      />
      <BillFormNumericField
        key="diesel"
        label="Diesel"
        onChange={(value) => onNumericChange('diesel', value)}
      />
      <BillFormNumericField
        key="handLoan"
        label="Hand loan"
        onChange={(value) => onNumericChange('handLoan', value)}
      />

      {others.map((item, index) => (
        <Column
          key={item.uid}
          modifiers={[fillMaxWidth()]}
          verticalArrangement={{ spacedBy: 8 }}>
          <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
            <BillFormTextField
              label="Other charge"
              compact
              onChange={(key) => updateOther(index, { key })}
            />
            {others.length > 1 || item.key.trim() ? (
              <IconButton onClick={() => removeOther(index)}>
                <Icon source={DELETE_ICON} size={20} tint={colors.error} />
              </IconButton>
            ) : null}
          </Row>
          <BillFormNumericField
            label="Amount"
            onChange={(value) => updateOther(index, { value })}
          />
        </Column>
      ))}

      <OutlinedButton onClick={addOther}>
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
    </Column>
  );
}
