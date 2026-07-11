import type { AppTabItem } from '@/components/ui/tab-row';
import type { MasterEntityConfig, MastersTab } from '@/components/masters/masters-types';

function asString(value: unknown, fallback = ''): string {
  if (value == null) {
    return fallback;
  }
  return String(value);
}

export const MASTERS_TABS: AppTabItem<MastersTab>[] = [
  { id: 'name-boards', label: 'Name boards' },
  { id: 'trucks', label: 'Trucks' },
  { id: 'locations', label: 'Locations' },
  { id: 'parties', label: 'Parties' },
  { id: 'goods', label: 'Goods' },
  { id: 'units', label: 'Units' },
  { id: 'financial-years', label: 'Financial years' },
];

export const MASTER_ENTITY_CONFIG: Record<MastersTab, MasterEntityConfig> = {
  'name-boards': {
    tab: 'name-boards',
    table: 'name_board',
    idColumn: 'name_board_id',
    labelSingular: 'Name board',
    labelPlural: 'Name boards',
    formFields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'owner_name', label: 'Owner name', required: true },
      { key: 'owner_phone', label: 'Owner phone', keyboardType: 'phone' },
    ],
    mapRow: (row) => ({
      id: Number(row.name_board_id),
      title: asString(row.name),
      meta: asString(row.owner_name) || undefined,
      values: {
        code: asString(row.code),
        name: asString(row.name),
        owner_name: asString(row.owner_name),
        owner_phone: asString(row.owner_phone),
      },
    }),
    toPayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
      owner_name: values.owner_name.trim(),
      owner_phone: values.owner_phone.trim() || null,
    }),
  },
  trucks: {
    tab: 'trucks',
    table: 'truck',
    listFrom: 'v_truck',
    idColumn: 'truck_id',
    labelSingular: 'Truck',
    labelPlural: 'Trucks',
    formFields: [
      { key: 'truck_number', label: 'Truck number', required: true },
      {
        key: 'name_board_id',
        label: 'Name board ID',
        required: true,
        keyboardType: 'number',
        supportingText: 'Use an existing name board id',
      },
    ],
    mapRow: (row) => ({
      id: Number(row.truck_id),
      title: asString(row.truck_number),
      subtitle: asString(row.name_board_name) || undefined,
      values: {
        truck_number: asString(row.truck_number),
        name_board_id: asString(row.name_board_id),
      },
    }),
    toPayload: (values) => ({
      truck_number: values.truck_number.trim(),
      name_board_id: Number(values.name_board_id),
    }),
  },
  locations: {
    tab: 'locations',
    table: 'location',
    idColumn: 'location_id',
    labelSingular: 'Location',
    labelPlural: 'Locations',
    formFields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
    ],
    mapRow: (row) => ({
      id: Number(row.location_id),
      title: asString(row.name),
      values: {
        code: asString(row.code),
        name: asString(row.name),
      },
    }),
    toPayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
    }),
  },
  parties: {
    tab: 'parties',
    table: 'party',
    idColumn: 'party_id',
    labelSingular: 'Party',
    labelPlural: 'Parties',
    formFields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
    ],
    mapRow: (row) => ({
      id: Number(row.party_id),
      title: asString(row.name),
      values: {
        code: asString(row.code),
        name: asString(row.name),
      },
    }),
    toPayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
    }),
  },
  goods: {
    tab: 'goods',
    table: 'goods',
    idColumn: 'goods_id',
    labelSingular: 'Goods',
    labelPlural: 'Goods',
    formFields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
    ],
    mapRow: (row) => ({
      id: Number(row.goods_id),
      title: asString(row.name),
      values: {
        code: asString(row.code),
        name: asString(row.name),
      },
    }),
    toPayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
    }),
  },
  units: {
    tab: 'units',
    table: 'unit',
    idColumn: 'unit_id',
    labelSingular: 'Unit',
    labelPlural: 'Units',
    formFields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
    ],
    mapRow: (row) => ({
      id: Number(row.unit_id),
      title: asString(row.name),
      values: {
        code: asString(row.code),
        name: asString(row.name),
      },
    }),
    toPayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
    }),
  },
  'financial-years': {
    tab: 'financial-years',
    table: 'financial_year',
    idColumn: 'financial_year_id',
    labelSingular: 'Financial year',
    labelPlural: 'Financial years',
    formFields: [
      { key: 'code', label: 'Code', required: true, supportingText: 'e.g. 2025-26' },
      { key: 'name', label: 'Name', required: true },
    ],
    mapRow: (row) => ({
      id: Number(row.financial_year_id),
      title: asString(row.name),
      values: {
        code: asString(row.code),
        name: asString(row.name),
      },
    }),
    toPayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
    }),
  },
};
