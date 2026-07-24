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
  const [billDate, setBillDate] = useState<Date | null>(() => new Date());

  const [locationId, setLocationId] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [truckId, setTruckId] = useState<number | null>(null);
  const [truckLabel, setTruckLabel] = useState('');

  const nameBoard = useNativeState('');
  const ownerName = useNativeState('');
  const ownerMobile = useNativeState('');

  useEffect(() => {
    if (nextBillNo) {
      void billNo.set(nextBillNo);
    }
  }, [nextBillNo, billNo]);

  const applyTruckRow = (row: MasterListRow) => {
    setTruckId(row.id);
    setTruckLabel(row.title);
    void nameBoard.set(row.values.name_board_name ?? row.subtitle ?? '');
    void ownerName.set(row.values.owner_name ?? '');
    void ownerMobile.set(row.values.owner_phone ?? '');
  };

  const clearTruckDerived = () => {
    setTruckId(null);
    setTruckLabel('');
    void nameBoard.set('');
    void ownerName.set('');
    void ownerMobile.set('');
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
      applyTruckRow(row);
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
          <Text>{isBillNoLoading ? 'Loading…' : 'Auto generated'}</Text>
        </OutlinedTextField.SupportingText>
      </OutlinedTextField>

      <BillDateField
        label="Date *"
        date={billDate}
        onDateSelected={setBillDate}
        onClear={() => setBillDate(null)}
      />

      <MasterLookupDropdown
        label="From"
        tab="locations"
        required
        selectedId={locationId}
        selectedLabel={locationLabel}
        onSelect={(row) => {
          setLocationId(row.id);
          setLocationLabel(row.title);
        }}
        onClear={() => {
          setLocationId(null);
          setLocationLabel('');
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
        onSelect={applyTruckRow}
        onClear={clearTruckDerived}
        onCreateRequest={(query) => {
          onCreateMaster?.({
            tab: 'trucks',
            defaults: {
              truck_number: query,
            },
          });
        }}
      />

      <OutlinedTextField value={nameBoard} singleLine readOnly modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Name Board</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={ownerName} singleLine readOnly modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Owner Name</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>

      <OutlinedTextField value={ownerMobile} singleLine readOnly modifiers={[fillMaxWidth()]}>
        <OutlinedTextField.Label>
          <Text>Owner Mobile</Text>
        </OutlinedTextField.Label>
      </OutlinedTextField>
    </Column>
  );
}
