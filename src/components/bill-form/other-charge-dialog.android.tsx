import {
  BasicAlertDialog,
  Button,
  Column,
  Row,
  Text,
  TextButton,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  background,
  clip,
  fillMaxWidth,
  padding,
  Shapes,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

import { FormNumericField, FormTextField } from '@/components/ui/form-fields';

export type OtherChargeDialogProps = {
  onAdd: (name: string, amount: number | '') => void;
  onDismiss: () => void;
};

/**
 * Capture-once dialog for a named "other charge". The charge name is only
 * editable here — once added it becomes a fixed label on the form row, so
 * changing it means deleting the row and adding a fresh one.
 */
export function OtherChargeDialog({ onAdd, onDismiss }: OtherChargeDialogProps) {
  const colors = useMaterialColors();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  const trimmedName = name.trim();
  const canAdd = trimmedName.length > 0;

  return (
    <BasicAlertDialog onDismissRequest={onDismiss}>
      <Column
        modifiers={[
          fillMaxWidth(),
          clip(Shapes.RoundedCorner(28)),
          background(colors.surfaceContainerHigh),
          padding(24, 24, 24, 20),
        ]}
        verticalArrangement={{ spacedBy: 16 }}>
        <Text color={colors.onSurface} style={{ typography: 'titleLarge' }}>
          Add other charge
        </Text>

        <FormTextField
          label="Charge name"
          required
          autoFocus
          capitalization="words"
          imeAction="next"
          onChangeText={setName}
        />

        <FormNumericField
          label="Amount"
          imeAction="done"
          onChangeNumber={setAmount}
          onSubmit={() => {
            if (canAdd) {
              onAdd(trimmedName, amount);
            }
          }}
        />

        <Row
          modifiers={[fillMaxWidth(), padding(0, 8, 0, 0)]}
          horizontalArrangement={{ spacedBy: 8 }}
          verticalAlignment="center">
          <Column modifiers={[weight(1)]} />
          <TextButton onClick={onDismiss}>
            <Text>Cancel</Text>
          </TextButton>
          <Button enabled={canAdd} onClick={() => onAdd(trimmedName, amount)}>
            <Text>Add</Text>
          </Button>
        </Row>
      </Column>
    </BasicAlertDialog>
  );
}
