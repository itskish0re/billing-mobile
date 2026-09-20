import { recalculateBillForm } from '@/lib/bills/bill-form';
import { createBillOtherItem, type BillFormValues, type BillLoadFormLine } from '@/types/bill-form';
import type { BillListLoad, BillListRow } from '@/types/bill-list';

function numOrEmpty(value: number | null): number | '' {
  return value == null ? '' : value;
}

/**
 * Heuristic for the "fixed unit" flag, which `v_loads` doesn't expose: a fixed
 * unit stores freight equal to the rate (freight = rate, not weight × rate).
 */
function inferUnitIsFixed(load: BillListLoad): boolean {
  const { freight, ratePerUnit, weightOrQuantity } = load;
  if (freight == null || ratePerUnit == null) {
    return false;
  }
  const computed = weightOrQuantity != null ? weightOrQuantity * ratePerUnit : null;
  const matchesRate = Math.abs(freight - ratePerUnit) < 0.005;
  const matchesComputed = computed != null && Math.abs(freight - computed) < 0.005;
  return matchesRate && !matchesComputed;
}

function mapLoad(load: BillListLoad): BillLoadFormLine {
  return {
    loadId: load.loadId,
    loadNumber: load.loadNumber,
    consignorId: load.consignorId,
    consignorName: load.consignorName,
    consigneeId: load.consigneeId,
    consigneeName: load.consigneeName,
    asPerBill: load.asPerBill,
    toId: load.toId,
    toLocationName: load.toLocationName,
    goodsId: load.goodsId,
    goodsName: load.goodsName,
    unitId: load.unitId,
    unitName: load.unitName,
    unitIsFixed: inferUnitIsFixed(load),
    weightOrQuantity: numOrEmpty(load.weightOrQuantity),
    ratePerUnit: numOrEmpty(load.ratePerUnit),
    freight: numOrEmpty(load.freight),
    advance: numOrEmpty(load.advance),
    topay: numOrEmpty(load.topay),
    balance: numOrEmpty(load.balance),
  };
}

/** Builds editable form values from a persisted bill list row. */
export function mapBillListRowToForm(row: BillListRow): BillFormValues {
  const loads = row.loads.length > 0 ? row.loads.map(mapLoad) : [];

  return recalculateBillForm({
    billId: row.billId,
    billNumber: row.billNumber,
    billDate: row.billDate,
    fromId: row.fromId,
    fromLocationName: row.fromLocationName,
    truckId: row.truckId,
    truckNumber: row.truckNumber,
    nameBoardName: row.nameBoardName,
    ownerName: row.ownerName,
    ownerMobile: row.ownerMobile,
    driverName: row.driverName,
    driverMobile1: row.driverMobile1,
    driverMobile2: row.driverMobile2,
    totalFreight: numOrEmpty(row.totalFreight),
    commission: numOrEmpty(row.commission),
    crossing: numOrEmpty(row.crossing),
    handLoan: numOrEmpty(row.handLoan),
    truckLoan: row.truckLoan,
    payBy: row.payBy,
    paidName: row.paidName ?? '',
    paidMobile: row.paidMobile ?? '',
    officeMamul: numOrEmpty(row.officeMamul),
    tapalMamul: numOrEmpty(row.tapalMamul),
    diesel: numOrEmpty(row.diesel),
    others: row.others.map((o) => createBillOtherItem(o.key, numOrEmpty(o.value))),
    total: numOrEmpty(row.total),
    isCancelled: row.isCancelled,
    isSigned: row.isSigned,
    loads,
  });
}
