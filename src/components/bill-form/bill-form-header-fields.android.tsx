import {
  Button,
  Column,
  OutlinedTextField,
  Row,
  Text,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, weight } from '@expo/ui/jetpack-compose/modifiers';

import type { MastersTab } from '@/components/masters/masters-types';

export type BillFormHeaderFieldsProps = {
  /** Open masters create panel for a missing entity (stacked over the bill form). */
  onCreateMaster?: (tab: MastersTab) => void;
};

type NativeStringState = ReturnType<typeof useNativeState<string>>;

export function BillFormHeaderFields({ onCreateMaster }: BillFormHeaderFieldsProps) {
  const billNo = useNativeState('');
  const date = useNativeState('');
  const origin = useNativeState('');
  const truckNo = useNativeState('');
  const nameBoard = useNativeState('');
  const ownerName = useNativeState('');
  const ownerMobile = useNativeState('');

  return (
    <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
      <OutlinedTextField value={billNo} singleLine modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Bill No.</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={date} singleLine readOnly modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Date *</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <LookupWithCreate
        label="Origin / Branch *"
        value={origin}
        createLabel="location"
        onCreate={onCreateMaster ? () => onCreateMaster('locations') : undefined}
      />

      <LookupWithCreate
        label="Truck No. *"
        value={truckNo}
        createLabel="truck"
        onCreate={onCreateMaster ? () => onCreateMaster('trucks') : undefined}
      />

      <LookupWithCreate
        label="Name Board"
        value={nameBoard}
        createLabel="name board"
        onCreate={onCreateMaster ? () => onCreateMaster('name-boards') : undefined}
      />

      <OutlinedTextField value={ownerName} singleLine modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Owner Name</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField
        value={ownerMobile}
        singleLine
        keyboardOptions={{ keyboardType: 'phone' }}
        modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Owner Mobile</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>
    </Column>
  );
}

function LookupWithCreate({
  label,
  value,
  createLabel,
  onCreate,
}: {
  label: string;
  value: NativeStringState;
  createLabel: string;
  onCreate?: () => void;
}) {
  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 6 }}>
      <OutlinedTextField value={value} singleLine modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>{label}</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>
      {onCreate ? (
        <Row modifiers={[fillMaxWidth()]}>
          <Button modifiers={[weight(1)]} onClick={onCreate}>
            <Text>{`+ Add new ${createLabel}`}</Text>
          </Button>
        </Row>
      ) : null}
    </Column>
  );
}
