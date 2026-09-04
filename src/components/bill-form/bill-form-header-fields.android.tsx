import { Column } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect } from 'react';

import { BillDateField } from '@/components/bill-form/bill-date-field';
import { FormReadOnlyField, FormTextField } from '@/components/ui/form-fields';
import { MasterLookupDropdown } from '@/components/bill-form/master-lookup-dropdown';
import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { useNextBillNumber } from '@/hooks/use-next-bill-number';
import { parseIsoDate, suggestCodeFromName, toIsoDate } from '@/lib/bills/bill-form';
import type { BillFormValues } from '@/types/bill-form';

export type BillCreateMasterTarget =
  | { kind: 'from' }
  | { kind: 'truck' }
  | {
      kind: 'load';
      index: number;
      field: 'consignor' | 'consignee' | 'destination' | 'goods' | 'unit';
    };

export type BillCreateMasterRequest = {
  tab: MastersTab;
  defaults: Record<string, string>;
  target: BillCreateMasterTarget;
};

export type BillFormHeaderFieldsProps = {
  values: BillFormValues;
  onPatch: (patch: Partial<BillFormValues>) => void;
  onCreateMaster: (request: BillCreateMasterRequest) => void;
  /** Auto-assign the next bill number on create; disable in edit mode. */
  autoAssignBillNumber?: boolean;
};

function truckDerivedFromRow(row: MasterListRow): Partial<BillFormValues> {
  return {
    truckId: row.id,
    truckNumber: row.title,
    nameBoardName: row.values.name_board_name ?? row.subtitle ?? '',
    ownerName: row.values.owner_name ?? '',
    ownerMobile: row.values.owner_phone ?? '',
  };
}

export function BillFormHeaderFields({
  values,
  onPatch,
  onCreateMaster,
  autoAssignBillNumber = true,
}: BillFormHeaderFieldsProps) {
  const { data: nextBillNo, isLoading: isBillNoLoading } = useNextBillNumber();

  // Monospaced, letter-spaced style for phone numbers (matches read-only fields).
  const monoTextStyle = { fontFamily: 'monospace', letterSpacing: 1 } as const;

  useEffect(() => {
    if (autoAssignBillNumber && nextBillNo && nextBillNo !== values.billNumber) {
      onPatch({ billNumber: nextBillNo });
    }
  }, [autoAssignBillNumber, nextBillNo, onPatch, values.billNumber]);

  return (
    <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
      <FormReadOnlyField
        label="Bill No."
        value={values.billNumber}
        supportingText={isBillNoLoading ? 'Loading…' : 'Auto generated'}
      />

      <BillDateField
        label="Date *"
        date={parseIsoDate(values.billDate)}
        onDateSelected={(date) => onPatch({ billDate: toIsoDate(date) })}
        onClear={() => onPatch({ billDate: '' })}
      />

      <MasterLookupDropdown
        label="From"
        tab="locations"
        required
        selectedId={values.fromId}
        selectedLabel={values.fromLocationName}
        onSelect={(row) => {
          onPatch({ fromId: row.id, fromLocationName: row.title });
        }}
        onClear={() => {
          onPatch({ fromId: null, fromLocationName: '' });
        }}
        onCreateRequest={(query) => {
          onCreateMaster({
            tab: 'locations',
            defaults: {
              name: query,
              code: suggestCodeFromName(query),
            },
            target: { kind: 'from' },
          });
        }}
      />

      <MasterLookupDropdown
        label="Truck No."
        tab="trucks"
        required
        selectedId={values.truckId}
        selectedLabel={values.truckNumber}
        onSelect={(row) => {
          onPatch(truckDerivedFromRow(row));
        }}
        onClear={() => {
          onPatch({
            truckId: null,
            truckNumber: '',
            nameBoardName: '',
            ownerName: '',
            ownerMobile: '',
          });
        }}
        onCreateRequest={(query) => {
          onCreateMaster({
            tab: 'trucks',
            defaults: {
              truck_number: query,
            },
            target: { kind: 'truck' },
          });
        }}
      />

      <FormReadOnlyField label="Name Board" value={values.nameBoardName} />
      <FormReadOnlyField label="Owner Name" value={values.ownerName} />
      <FormReadOnlyField label="Owner Mobile" value={values.ownerMobile} monospace />

      <FormTextField
        label="Driver Name"
        required
        capitalization="words"
        imeAction="next"
        initialText={values.driverName}
        onChangeText={(driverName) => onPatch({ driverName })}
      />

      <FormTextField
        label="Driver Mobile 1"
        required
        keyboardType="phone"
        maxLength={10}
        imeAction="next"
        textStyle={monoTextStyle}
        initialText={values.driverMobile1}
        onChangeText={(driverMobile1) => onPatch({ driverMobile1 })}
      />

      <FormTextField
        label="Driver Mobile 2"
        keyboardType="phone"
        maxLength={10}
        imeAction="done"
        textStyle={monoTextStyle}
        initialText={values.driverMobile2}
        onChangeText={(driverMobile2) => onPatch({ driverMobile2 })}
      />
    </Column>
  );
}
