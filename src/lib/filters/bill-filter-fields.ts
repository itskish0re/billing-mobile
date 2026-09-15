import type { QueryFilterField } from '@/types/entity-query-filter';

/** Fields exposed in the bill query builder (subset of `v_bills`). */
export const BILL_FILTER_FIELDS: QueryFilterField[] = [
  { id: 1, key: 'bill_number', label: 'Bill number', match: 'exact' },
  { id: 2, key: 'name_board_name', label: 'Name board', match: 'contains' },
  { id: 3, key: 'from_location_name', label: 'From location', match: 'contains' },
  { id: 4, key: 'truck_number', label: 'Truck number', match: 'contains' },
  { id: 5, key: 'driver_name', label: 'Driver name', match: 'contains' },
];
