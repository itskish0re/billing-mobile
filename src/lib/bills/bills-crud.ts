import { recalculateBillForm, toFormNumber } from '@/lib/bills/bill-form';
import { BILL_FILTER_FIELDS } from '@/lib/filters/bill-filter-fields';
import { applyFieldFilters } from '@/lib/filters/filter-query';
import { supabase } from '@/lib/supabase';
import type { BillFormValues, BillLoadFormLine } from '@/types/bill-form';
import type { BillListLoad, BillListRow } from '@/types/bill-list';

/** Bills/loads views are not in the generated Database types yet. */
const db = supabase as any;

export type FetchBillListParams = {
  financialYearId: number;
  /**
   * URL-encoded filters, e.g.
   * `bill_date_gte=2026-09-01&bill_date_lte=2026-09-16&bill_number=5`.
   * Date params both apply to `v_bills.bill_date`; omit `bill_date_lte` when
   * the end date is empty.
   */
  filterQuery?: string | null;
};

function toNumberOrNull(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toStringValue(value: unknown): string {
  return value == null ? '' : String(value);
}

function toOthersArray(value: unknown): { key: string; value: number | null }[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => {
    const record = (item ?? {}) as Record<string, unknown>;
    return { key: toStringValue(record.key), value: toNumberOrNull(record.value) };
  });
}

function mapLoadRow(row: Record<string, unknown>): BillListLoad {
  return {
    loadId: Number(row.load_id),
    loadNumber: Number(row.load_number) || 0,
    consignorId: toNumberOrNull(row.consignor_id),
    consignorName: toStringValue(row.consignor_name),
    consigneeId: toNumberOrNull(row.consignee_id),
    consigneeName: toStringValue(row.consignee_name),
    asPerBill: row.as_per_bill === true,
    toId: toNumberOrNull(row.to_id),
    toLocationName: toStringValue(row.to_location_name),
    goodsId: toNumberOrNull(row.goods_id),
    goodsName: toStringValue(row.goods_name),
    unitId: toNumberOrNull(row.unit_id),
    unitName: toStringValue(row.unit_name),
    weightOrQuantity: toNumberOrNull(row.weight_or_quantity),
    ratePerUnit: toNumberOrNull(row.rate_per_unit),
    freight: toNumberOrNull(row.freight),
    advance: toNumberOrNull(row.advance),
    topay: toNumberOrNull(row.topay),
    balance: toNumberOrNull(row.balance),
  };
}

/**
 * Fetches bills for the active financial year using the saved filter query
 * (`bill_date` bounds plus optional field filters), enriched with each bill's
 * loads and its raw `others` charges. Loads and named charges power the
 * preview memo and the edit form; the list card itself only needs the header
 * fields plus the first load's destination.
 */
export async function fetchBillList({
  financialYearId,
  filterQuery,
}: FetchBillListParams): Promise<BillListRow[]> {
  let billsQuery = db
    .from('v_bills')
    .select('*')
    .eq('financial_year_id', financialYearId)
    .order('bill_date', { ascending: false })
    .order('bill_id', { ascending: false });

  if (filterQuery) {
    billsQuery = applyFieldFilters(billsQuery, filterQuery, BILL_FILTER_FIELDS);
  }

  const { data: billRows, error: billsError } = await billsQuery;
  if (billsError) {
    throw billsError;
  }

  const bills = (billRows ?? []) as Record<string, unknown>[];
  if (bills.length === 0) {
    return [];
  }

  const billIds = bills.map((row) => Number(row.bill_id));

  const [{ data: loadRows, error: loadsError }, { data: othersRows, error: othersError }] =
    await Promise.all([
      db.from('v_loads').select('*').in('bill_id', billIds),
      db.from('bills').select('bill_id, others').in('bill_id', billIds),
    ]);

  if (loadsError) {
    throw loadsError;
  }
  if (othersError) {
    throw othersError;
  }

  const loadsByBill = new Map<number, BillListLoad[]>();
  for (const raw of (loadRows ?? []) as Record<string, unknown>[]) {
    const billId = Number(raw.bill_id);
    const list = loadsByBill.get(billId) ?? [];
    list.push(mapLoadRow(raw));
    loadsByBill.set(billId, list);
  }

  const othersByBill = new Map<number, { key: string; value: number | null }[]>();
  for (const raw of (othersRows ?? []) as Record<string, unknown>[]) {
    othersByBill.set(Number(raw.bill_id), toOthersArray(raw.others));
  }

  return bills.map((row): BillListRow => {
    const billId = Number(row.bill_id);
    const loads = (loadsByBill.get(billId) ?? []).sort((a, b) => a.loadNumber - b.loadNumber);

    return {
      billId,
      billNumber: toStringValue(row.bill_number),
      billDate: toStringValue(row.bill_date),
      fromId: toNumberOrNull(row.from_id),
      fromLocationName: toStringValue(row.from_location_name),
      truckId: toNumberOrNull(row.truck_id),
      truckNumber: toStringValue(row.truck_number),
      nameBoardName: toStringValue(row.name_board_name),
      ownerName: toStringValue(row.owner_name),
      ownerMobile: toStringValue(row.owner_mobile),
      driverName: toStringValue(row.driver_name),
      driverMobile1: toStringValue(row.driver_mobile1),
      driverMobile2: toStringValue(row.driver_mobile2),
      totalFreight: toNumberOrNull(row.total_freight),
      commission: toNumberOrNull(row.commission),
      crossing: toNumberOrNull(row.crossing),
      officeMamul: toNumberOrNull(row.office_mamul),
      tapalMamul: toNumberOrNull(row.tapal_mamul),
      diesel: toNumberOrNull(row.diesel),
      handLoan: toNumberOrNull(row.hand_loan),
      truckLoan: row.truck_loan === true,
      payBy: row.pay_by == null ? null : String(row.pay_by),
      paidName: row.paid_name == null ? null : String(row.paid_name),
      paidMobile: row.paid_mobile == null ? null : String(row.paid_mobile),
      others: othersByBill.get(billId) ?? [],
      total: toNumberOrNull(row.total),
      isCancelled: row.is_cancelled === true,
      financialYearId: toNumberOrNull(row.financial_year_id),
      loads,
    };
  });
}

export type SaveBillParams = {
  values: BillFormValues;
  loads: BillLoadFormLine[];
  financialYearId: number;
  userId: string | null;
};

function money(value: number | '' | null | undefined): number {
  return toFormNumber(value) ?? 0;
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

function throwQueryError(error: { code?: string; message?: string } | null, fallback: string): void {
  if (!error) {
    return;
  }

  if (error.code === '23505') {
    throw new Error('A bill with this number already exists in this financial year.');
  }
  if (error.code === '23503') {
    throw new Error('One of the selected masters is missing. Refresh and try again.');
  }

  throw new Error(error.message || fallback);
}

function billWritePayload(
  values: BillFormValues,
  financialYearId: number,
  userId: string | null,
  mode: 'create' | 'update'
) {
  const computed = recalculateBillForm(values);
  const isUpi = computed.payBy === 'upi';

  return {
    bill_number: computed.billNumber.trim(),
    bill_date: computed.billDate,
    from_id: computed.fromId,
    truck_id: computed.truckId,
    driver_name: computed.driverName.trim(),
    driver_mobile1: emptyToNull(computed.driverMobile1),
    driver_mobile2: emptyToNull(computed.driverMobile2),
    total_freight: money(computed.totalFreight),
    commission: money(computed.commission),
    crossing: money(computed.crossing),
    hand_loan: money(computed.handLoan),
    truck_loan: computed.truckLoan,
    pay_by: computed.payBy,
    paid_name: isUpi ? emptyToNull(computed.paidName) : null,
    paid_mobile: isUpi ? emptyToNull(computed.paidMobile) : null,
    office_mamul: money(computed.officeMamul),
    tapal_mamul: money(computed.tapalMamul),
    diesel: money(computed.diesel),
    others: computed.others
      .filter((item) => item.key.trim())
      .map((item) => ({ key: item.key.trim(), value: money(item.value) })),
    total: money(computed.total),
    is_cancelled: computed.isCancelled,
    financial_year_id: financialYearId,
    updated_by: userId,
    ...(mode === 'create' ? { created_by: userId } : {}),
  };
}

function loadWritePayload(
  line: BillLoadFormLine,
  index: number,
  billId: number,
  financialYearId: number,
  userId: string | null
) {
  return {
    bill_id: billId,
    load_number: index + 1,
    consignor_id: line.consignorId,
    consignee_id: line.asPerBill ? null : line.consigneeId,
    as_per_bill: line.asPerBill,
    to_id: line.toId,
    goods_id: line.goodsId,
    unit_id: line.unitId,
    weight_or_quantity: money(line.weightOrQuantity),
    rate_per_unit: money(line.ratePerUnit),
    freight: money(line.freight),
    advance: money(line.advance),
    topay: money(line.topay),
    balance: money(line.balance),
    financial_year_id: financialYearId,
    is_deleted: false,
    deleted_at: null,
    is_active: true,
    is_enabled: true,
    updated_by: userId,
    created_by: userId,
  };
}

function loadRpcPayload(line: BillLoadFormLine) {
  return {
    consignor_id: line.consignorId,
    consignee_id: line.asPerBill ? null : line.consigneeId,
    as_per_bill: line.asPerBill,
    to_id: line.toId,
    goods_id: line.goodsId,
    unit_id: line.unitId,
    weight_or_quantity: money(line.weightOrQuantity),
    rate_per_unit: money(line.ratePerUnit),
    freight: money(line.freight),
    advance: money(line.advance),
    topay: money(line.topay),
    balance: money(line.balance),
  };
}

async function saveBillViaRpc(params: SaveBillParams): Promise<number | null> {
  const bill = billWritePayload(
    params.values,
    params.financialYearId,
    params.userId,
    params.values.billId != null ? 'update' : 'create'
  );

  const { data, error } = await db.rpc('save_bill', {
    p_bill:
      params.values.billId != null ? { ...bill, bill_id: params.values.billId } : bill,
    p_loads: params.loads.map(loadRpcPayload),
  });

  if (error) {
    const missingFn =
      error.code === 'PGRST202' ||
      (/save_bill/i.test(error.message ?? '') &&
        /does not exist|could not find/i.test(error.message ?? ''));
    if (missingFn) {
      return null;
    }
    throwQueryError(error, 'Could not save the bill.');
  }

  const billId = Number(data);
  if (!Number.isFinite(billId)) {
    throw new Error('Could not save the bill.');
  }
  return billId;
}

async function insertLoads(
  loads: BillLoadFormLine[],
  billId: number,
  financialYearId: number,
  userId: string | null
): Promise<void> {
  if (loads.length === 0) {
    return;
  }

  const { error } = await db.from('loads').insert(
    loads.map((line, index) => loadWritePayload(line, index, billId, financialYearId, userId))
  );
  throwQueryError(error, 'Could not save load lines.');
}

async function softDeleteBill(billId: number, userId: string | null): Promise<void> {
  const { error } = await db
    .from('bills')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      is_active: false,
      is_enabled: false,
      updated_by: userId,
    })
    .eq('bill_id', billId);

  throwQueryError(error, 'Could not roll back the bill after a load save failed.');
}

async function createBill({
  values,
  loads,
  financialYearId,
  userId,
}: SaveBillParams): Promise<number> {
  const { data, error } = await db
    .from('bills')
    .insert(billWritePayload(values, financialYearId, userId, 'create'))
    .select('bill_id')
    .single();

  throwQueryError(error, 'Could not create the bill.');
  const billId = Number(data?.bill_id);
  if (!Number.isFinite(billId)) {
    throw new Error('Could not create the bill.');
  }

  try {
    await insertLoads(loads, billId, financialYearId, userId);
  } catch (loadError) {
    await softDeleteBill(billId, userId).catch(() => undefined);
    throw loadError;
  }

  return billId;
}

async function updateBill({
  values,
  loads,
  financialYearId,
  userId,
}: SaveBillParams): Promise<number> {
  const billId = values.billId;
  if (billId == null) {
    throw new Error('Cannot update a bill without an id.');
  }

  const { error: billError } = await db
    .from('bills')
    .update(billWritePayload(values, financialYearId, userId, 'update'))
    .eq('bill_id', billId)
    .eq('is_deleted', false);

  throwQueryError(billError, 'Could not update the bill.');

  const { data: existingRows, error: existingError } = await db
    .from('loads')
    .select('load_id')
    .eq('bill_id', billId)
    .eq('is_deleted', false);

  throwQueryError(existingError, 'Could not load existing load lines.');

  const existingIds = new Set(
    ((existingRows ?? []) as { load_id: number }[]).map((row) => Number(row.load_id))
  );
  const keptIds = new Set(
    loads.map((line) => line.loadId).filter((id): id is number => id != null && Number.isFinite(id))
  );
  const removedIds = [...existingIds].filter((id) => !keptIds.has(id));

  // Hard-delete removed lines so (bill_id, load_number) can be reused. Soft-deleted
  // rows would still occupy the unique constraint (numbers are only 1–3).
  if (removedIds.length > 0) {
    const { error: deleteError } = await db.from('loads').delete().in('load_id', removedIds);
    throwQueryError(deleteError, 'Could not remove dropped load lines.');
  }

  const toInsert: { line: BillLoadFormLine; index: number }[] = [];
  const updates: Promise<{ error: { code?: string; message?: string } | null }>[] = [];

  for (const [index, line] of loads.entries()) {
    const payload = loadWritePayload(line, index, billId, financialYearId, userId);

    if (line.loadId != null && existingIds.has(line.loadId)) {
      const { created_by: _createdBy, ...updatePayload } = payload;
      updates.push(db.from('loads').update(updatePayload).eq('load_id', line.loadId));
      continue;
    }

    toInsert.push({ line, index });
  }

  if (updates.length > 0) {
    const results = await Promise.all(updates);
    for (const result of results) {
      throwQueryError(result.error, 'Could not update load lines.');
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await db
      .from('loads')
      .insert(
        toInsert.map(({ index, line }) =>
          loadWritePayload(line, index, billId, financialYearId, userId)
        )
      );
    throwQueryError(insertError, 'Could not add load lines.');
  }

  return billId;
}

/**
 * Creates or updates a bill and syncs its load lines. Create rolls the bill back
 * (soft-delete) if load insert fails. Edit hard-deletes dropped load lines so
 * load numbers 1–3 stay reusable under the unique constraint.
 */
export async function saveBill(params: SaveBillParams): Promise<number> {
  const viaRpc = await saveBillViaRpc(params);
  if (viaRpc != null) {
    return viaRpc;
  }

  if (params.values.billId != null) {
    return updateBill(params);
  }
  return createBill(params);
}
