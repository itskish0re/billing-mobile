import {
  Column,
  OutlinedTextField,
  Text,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useState } from 'react';

import { BillDateField } from '@/components/bill-form/bill-date-field';
import { MasterLookupDropdown } from '@/components/bill-form/master-lookup-dropdown';
import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { useNextBillNumber } from '@/hooks/use-next-bill-number';

export type BillCreateMasterRequest = {
  tab: MastersTab;
  /** Prefill values for the master create form. */
  defaults: Record<string, string>;
};

export type BillCreatedMaster = {
  tab: MastersTab;
  row: MasterListRow;
};

export type BillFormHeaderFieldsProps = {
  onCreateMaster?: (request: BillCreateMasterRequest) => void;
  /** Applied when a master is created from a lookup “Create new” action. */
  createdMaster?: BillCreatedMaster | null;
  onCreatedMasterApplied?: () => void;
};

function suggestCodeFromName(name: string) {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24);
  return slug || 'NEW';
}

export function BillFormHeaderFields({
  onCreateMaster,
  createdMaster,
  onCreatedMasterApplied,
}: BillFormHeaderFieldsProps) {
  const { data: nextBillNo, isLoading: isBillNoLoading } = useNextBillNumber();
  const billNo = useNativeState('');
  const [billDate, setBillDate] = useState<Date>(() => new Date());

  const [locationId, setLocationId] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [truckId, setTruckId] = useState<number | null>(null);
  const [truckLabel, setTruckLabel] = useState('');
  const [nameBoardId, setNameBoardId] = useState<number | null>(null);
  const [nameBoardLabel, setNameBoardLabel] = useState('');

  const [ownerNameText, setOwnerNameText] = useState('');
  const [ownerMobileText, setOwnerMobileText] = useState('');
  const ownerName = useNativeState('');
  const ownerMobile = useNativeState('');

  useEffect(() => {
    if (nextBillNo) {
      void billNo.set(nextBillNo);
    }
  }, [nextBillNo, billNo]);

  useEffect(() => {
    void ownerName.set(ownerNameText);
  }, [ownerNameText, ownerName]);

  useEffect(() => {
    void ownerMobile.set(ownerMobileText);
  }, [ownerMobileText, ownerMobile]);

  const handleNameBoardSelect = (row: MasterListRow) => {
    setNameBoardId(row.id);
    setNameBoardLabel(row.title);
    const nextOwnerName = row.values.owner_name ?? row.meta ?? '';
    const nextOwnerMobile = row.values.owner_phone ?? '';
    setOwnerNameText(nextOwnerName);
    setOwnerMobileText(nextOwnerMobile);
    void ownerName.set(nextOwnerName);
    void ownerMobile.set(nextOwnerMobile);
  };

  useEffect(() => {
    if (!createdMaster) {
      return;
    }

    const { tab, row } = createdMaster;
    if (tab === 'locations') {
      setLocationId(row.id);
      setLocationLabel(row.title);
    } else if (tab === 'trucks') {
      setTruckId(row.id);
      setTruckLabel(row.title);
    } else if (tab === 'name-boards') {
      handleNameBoardSelect(row);
    }

    onCreatedMasterApplied?.();
    // Intentionally only react to createdMaster updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdMaster]);

  return (
    <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
      <OutlinedTextField
        value={billNo}
        singleLine
        readOnly
        enabled={!isBillNoLoading}
        modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Bill No.</Text>
        </OutlinedTextField.Label>
        <OutlinedTextField.SupportingText>
          <Text>
            {isBillNoLoading
              ? 'Loading next bill number…'
              : 'Auto-generated from the last bill in the active financial year'}
          </Text>
        </OutlinedTextField.SupportingText>
      </OutlinedTextField>

      <BillDateField label="Date *" date={billDate} onDateSelected={setBillDate} />

      <MasterLookupDropdown
        label="Origin / Branch"
        tab="locations"
        required
        selectedId={locationId}
        selectedLabel={locationLabel}
        onSelect={(row) => {
          setLocationId(row.id);
          setLocationLabel(row.title);
        }}
        onCreateRequest={(query) => {
          onCreateMaster?.({
            tab: 'locations',
            defaults: {
              name: query,
              code: suggestCodeFromName(query),
            },
          });
        }}
      />

      <MasterLookupDropdown
        label="Truck No."
        tab="trucks"
        required
        selectedId={truckId}
        selectedLabel={truckLabel}
        onSelect={(row) => {
          setTruckId(row.id);
          setTruckLabel(row.title);
        }}
        onCreateRequest={(query) => {
          onCreateMaster?.({
            tab: 'trucks',
            defaults: {
              truck_number: query,
              ...(nameBoardId != null ? { name_board_id: String(nameBoardId) } : {}),
            },
          });
        }}
      />

      <MasterLookupDropdown
        label="Name Board"
        tab="name-boards"
        selectedId={nameBoardId}
        selectedLabel={nameBoardLabel}
        onSelect={handleNameBoardSelect}
        onCreateRequest={(query) => {
          onCreateMaster?.({
            tab: 'name-boards',
            defaults: {
              name: query,
              code: suggestCodeFromName(query),
            },
          });
        }}
      />

      <OutlinedTextField
        value={ownerName}
        singleLine
        modifiers={[fillMaxWidth()]}
        onValueChange={setOwnerNameText}>
        <OutlinedTextField.Label>
          <Text>Owner Name</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField
        value={ownerMobile}
        singleLine
        keyboardOptions={{ keyboardType: 'phone' }}
        modifiers={[fillMaxWidth()]}
        onValueChange={setOwnerMobileText}>
        <OutlinedTextField.Label>
          <Text>Owner Mobile</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>
    </Column>
  );
}
