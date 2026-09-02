import {
  Column,
  Icon,
  IconButton,
  OutlinedButton,
  OutlinedCard,
  Row,
  Spacer,
  Text,
  ToggleButton,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, padding, weight } from '@expo/ui/jetpack-compose/modifiers';

import {
  BillFormNumericField,
  BillFormReadOnlyField,
} from '@/components/bill-form/bill-form-fields';
import type { BillCreateMasterRequest } from '@/components/bill-form/bill-form-header-fields';
import { MasterLookupDropdown } from '@/components/bill-form/master-lookup-dropdown';
import type { MasterListRow } from '@/components/masters/masters-types';
import {
  BILL_FORM_MAX_LOAD_ROWS,
  createEmptyLoadLine,
  formatBillFormCurrency,
  formatBillLoadLineTitle,
  suggestCodeFromName,
  toFormNumber,
} from '@/lib/bills/bill-form';
import type { BillLoadFormLine } from '@/types/bill-form';

const DELETE_ICON = require('@/assets/icons/delete.xml');

export type BillLoadLinesProps = {
  loads: BillLoadFormLine[];
  onChange: (loads: BillLoadFormLine[]) => void;
  onCreateMaster: (request: BillCreateMasterRequest) => void;
};

function unitIsFixed(row: MasterListRow) {
  return row.values.is_fixed === 'true';
}

export function BillLoadLines({ loads, onChange, onCreateMaster }: BillLoadLinesProps) {
  const colors = useMaterialColors();

  const updateLine = (index: number, patch: Partial<BillLoadFormLine>) => {
    onChange(loads.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => {
    if (loads.length >= BILL_FORM_MAX_LOAD_ROWS) {
      return;
    }

    const nextNumber = Math.max(...loads.map((line) => line.loadNumber), 0) + 1;
    onChange([...loads, createEmptyLoadLine(nextNumber)]);
  };

  const removeLine = (index: number) => {
    if (loads.length <= 1) {
      return;
    }

    onChange(loads.filter((_, i) => i !== index));
  };

  return (
    <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: 12 }}>
      {loads.map((line, index) => (
        <OutlinedCard
          key={line.loadId ?? `new-${line.loadNumber}`}
          modifiers={[fillMaxWidth()]}
          colors={{ containerColor: colors.surfaceContainerLow }}
          border={{ color: colors.outlineVariant, width: 1 }}>
          <Column
            modifiers={[fillMaxWidth(), padding(12, 12, 12, 12)]}
            verticalArrangement={{ spacedBy: 12 }}>
            <Row verticalAlignment="center" modifiers={[fillMaxWidth()]}>
              <Text style={{ typography: 'titleSmall' }}>{formatBillLoadLineTitle(index)}</Text>
              <Spacer modifiers={[weight(1)]} />
              {loads.length > 1 ? (
                <IconButton onClick={() => removeLine(index)}>
                  <Icon source={DELETE_ICON} size={20} tint={colors.error} />
                </IconButton>
              ) : null}
            </Row>

            <MasterLookupDropdown
              label="Consignor"
              tab="parties"
              required
              selectedId={line.consignorId}
              selectedLabel={line.consignorName}
              onSelect={(row) => {
                updateLine(index, {
                  consignorId: row.id,
                  consignorName: row.title,
                });
              }}
              onClear={() => {
                updateLine(index, { consignorId: null, consignorName: '' });
              }}
              onCreateRequest={(query) => {
                onCreateMaster({
                  tab: 'parties',
                  defaults: {
                    name: query,
                    code: suggestCodeFromName(query),
                  },
                  target: { kind: 'load', index, field: 'consignor' },
                });
              }}
            />

            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
              modifiers={[fillMaxWidth()]}>
              <ToggleButton
                checked={line.asPerBill}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateLine(index, {
                      consigneeId: null,
                      consigneeName: '',
                      asPerBill: true,
                    });
                    return;
                  }

                  updateLine(index, { asPerBill: false });
                }}>
                <Text>APB</Text>
              </ToggleButton>
              <Column modifiers={[weight(1), fillMaxWidth()]}>
                <MasterLookupDropdown
                  label="Consignee"
                  tab="parties"
                  required={!line.asPerBill}
                  enabled={!line.asPerBill}
                  allowCreate={!line.asPerBill}
                  selectedId={line.consigneeId}
                  selectedLabel={line.asPerBill ? 'As per bill' : line.consigneeName}
                  onSelect={(row) => {
                    updateLine(index, {
                      consigneeId: row.id,
                      consigneeName: row.title,
                      asPerBill: false,
                    });
                  }}
                  onClear={
                    line.asPerBill
                      ? undefined
                      : () => {
                          updateLine(index, { consigneeId: null, consigneeName: '' });
                        }
                  }
                  onCreateRequest={(query) => {
                    onCreateMaster({
                      tab: 'parties',
                      defaults: {
                        name: query,
                        code: suggestCodeFromName(query),
                      },
                      target: { kind: 'load', index, field: 'consignee' },
                    });
                  }}
                />
              </Column>
            </Row>

            <MasterLookupDropdown
              label="Destination"
              tab="locations"
              required
              selectedId={line.toId}
              selectedLabel={line.toLocationName}
              onSelect={(row) => {
                updateLine(index, { toId: row.id, toLocationName: row.title });
              }}
              onClear={() => {
                updateLine(index, { toId: null, toLocationName: '' });
              }}
              onCreateRequest={(query) => {
                onCreateMaster({
                  tab: 'locations',
                  defaults: {
                    name: query,
                    code: suggestCodeFromName(query),
                  },
                  target: { kind: 'load', index, field: 'destination' },
                });
              }}
            />

            <MasterLookupDropdown
              label="Goods"
              tab="goods"
              required
              selectedId={line.goodsId}
              selectedLabel={line.goodsName}
              onSelect={(row) => {
                updateLine(index, { goodsId: row.id, goodsName: row.title });
              }}
              onClear={() => {
                updateLine(index, { goodsId: null, goodsName: '' });
              }}
              onCreateRequest={(query) => {
                onCreateMaster({
                  tab: 'goods',
                  defaults: {
                    name: query,
                    code: suggestCodeFromName(query),
                  },
                  target: { kind: 'load', index, field: 'goods' },
                });
              }}
            />

            <MasterLookupDropdown
              label="Unit"
              tab="units"
              required
              selectedId={line.unitId}
              selectedLabel={line.unitName}
              onSelect={(row) => {
                updateLine(index, {
                  unitId: row.id,
                  unitName: row.title,
                  unitIsFixed: unitIsFixed(row),
                });
              }}
              onClear={() => {
                updateLine(index, { unitId: null, unitName: '', unitIsFixed: false });
              }}
              onCreateRequest={(query) => {
                onCreateMaster({
                  tab: 'units',
                  defaults: {
                    name: query,
                    code: suggestCodeFromName(query),
                  },
                  target: { kind: 'load', index, field: 'unit' },
                });
              }}
            />

            <Row horizontalArrangement={{ spacedBy: 8 }} modifiers={[fillMaxWidth()]}>
              <BillFormNumericField
                key={`${line.loadNumber}-weight`}
                label="Weight / Qty"
                required
                compact
                onChange={(weightOrQuantity) => updateLine(index, { weightOrQuantity })}
              />
              <BillFormNumericField
                key={`${line.loadNumber}-rate`}
                label="Rate"
                required
                compact
                onChange={(ratePerUnit) => updateLine(index, { ratePerUnit })}
              />
            </Row>

            <Row horizontalArrangement={{ spacedBy: 8 }} modifiers={[fillMaxWidth()]}>
              <BillFormReadOnlyField
                label="Freight"
                compact
                value={
                  toFormNumber(line.freight) == null
                    ? ''
                    : formatBillFormCurrency(toFormNumber(line.freight))
                }
              />
              <BillFormNumericField
                key={`${line.loadNumber}-advance`}
                label="Advance"
                compact
                onChange={(advance) => updateLine(index, { advance })}
              />
            </Row>

            <Row horizontalArrangement={{ spacedBy: 8 }} modifiers={[fillMaxWidth()]}>
              <BillFormNumericField
                key={`${line.loadNumber}-topay`}
                label="To Pay"
                compact
                onChange={(topay) => updateLine(index, { topay })}
              />
              <BillFormReadOnlyField
                label="Balance"
                compact
                highlighted
                value={
                  toFormNumber(line.balance) == null
                    ? ''
                    : formatBillFormCurrency(toFormNumber(line.balance))
                }
              />
            </Row>
          </Column>
        </OutlinedCard>
      ))}

      <OutlinedButton enabled={loads.length < BILL_FORM_MAX_LOAD_ROWS} onClick={addLine}>
        <Text>Add load line</Text>
      </OutlinedButton>
    </Column>
  );
}
