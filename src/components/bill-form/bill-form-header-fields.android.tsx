import { Column, OutlinedTextField, Text, useNativeState } from '@expo/ui/jetpack-compose';

export function BillFormHeaderFields() {
  const billNo = useNativeState('1042');
  const date = useNativeState('06/11/2026');
  const origin = useNativeState('Chennai');
  const truckNo = useNativeState('TN 23 AB 4567');
  const nameBoard = useNativeState('R.S Transport');
  const ownerName = useNativeState('Sivachandran');
  const ownerMobile = useNativeState('9876543210');

  return (
    <Column verticalArrangement={{ spacedBy: 12 }}>
      <OutlinedTextField value={billNo} singleLine>
        <OutlinedTextField.Label>
          <Text>Bill No.</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={date} singleLine readOnly>
        <OutlinedTextField.Label>
          <Text>Date *</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={origin} singleLine>
        <OutlinedTextField.Label>
          <Text>Origin / Branch *</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={truckNo} singleLine readOnly>
        <OutlinedTextField.Label>
          <Text>Truck No. *</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={nameBoard} singleLine>
        <OutlinedTextField.Label>
          <Text>Name Board</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={ownerName} singleLine>
        <OutlinedTextField.Label>
          <Text>Owner Name</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={ownerMobile} singleLine keyboardOptions={{ keyboardType: 'phone' }}>
        <OutlinedTextField.Label>
          <Text>Owner Mobile</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>
    </Column>
  );
}
