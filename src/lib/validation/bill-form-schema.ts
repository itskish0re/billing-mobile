import {
  collectSavableLoadLines,
  formatBillLoadLineTitle,
  toFormNumber,
} from '@/lib/bills/bill-form';
import type { BillFormValues, BillLoadFormLine } from '@/types/bill-form';

const PHONE_10 = /^\d{10}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PAY_BY = new Set(['upi', 'cash', 'owner']);

export type BillFormValidationResult =
  | { success: true; loads: BillLoadFormLine[] }
  | { success: false; message: string };

function fail(message: string): BillFormValidationResult {
  return { success: false, message };
}

function isFilled(value: string): boolean {
  return value.trim().length > 0;
}

function isValidPhone(value: string): boolean {
  return PHONE_10.test(value.trim());
}

function validateLoadLine(line: BillLoadFormLine, index: number): string | null {
  const prefix = formatBillLoadLineTitle(index);

  if (line.consignorId == null) {
    return `${prefix}: Consignor is required`;
  }
  if (!line.asPerBill && line.consigneeId == null) {
    return `${prefix}: Consignee is required`;
  }
  if (line.toId == null) {
    return `${prefix}: Destination is required`;
  }
  if (line.goodsId == null) {
    return `${prefix}: Goods is required`;
  }
  if (line.unitId == null) {
    return `${prefix}: Unit is required`;
  }
  if (!line.unitIsFixed && toFormNumber(line.weightOrQuantity) == null) {
    return `${prefix}: Weight / Qty is required`;
  }
  if (toFormNumber(line.ratePerUnit) == null) {
    return `${prefix}: Rate is required`;
  }

  return null;
}

/**
 * Client-side bill save checks. Returns savable load lines (empty extra rows dropped)
 * so the write path does not re-filter.
 */
export function validateBillForm(values: BillFormValues): BillFormValidationResult {
  if (!isFilled(values.billNumber)) {
    return fail('Bill number is required');
  }
  if (!ISO_DATE.test(values.billDate)) {
    return fail('Date is required');
  }
  if (values.fromId == null) {
    return fail('From is required');
  }
  if (values.truckId == null) {
    return fail('Truck No. is required');
  }
  if (!isFilled(values.driverName)) {
    return fail('Driver name is required');
  }
  if (!isValidPhone(values.driverMobile1)) {
    return fail('Driver mobile 1 must be a 10-digit number');
  }
  if (isFilled(values.driverMobile2) && !isValidPhone(values.driverMobile2)) {
    return fail('Driver mobile 2 must be a 10-digit number');
  }

  const payBy = values.payBy?.trim() ?? '';
  if (!PAY_BY.has(payBy)) {
    return fail('Payment mode is required');
  }
  if (payBy === 'upi') {
    if (!isFilled(values.paidName)) {
      return fail('Paid name is required for UPI');
    }
    if (!isValidPhone(values.paidMobile)) {
      return fail('Paid mobile must be a 10-digit number');
    }
  }

  const loads = collectSavableLoadLines(values.loads);
  if (loads.length === 0) {
    return fail('Add at least one load');
  }

  for (let index = 0; index < loads.length; index += 1) {
    const loadError = validateLoadLine(loads[index]!, index);
    if (loadError) {
      return fail(loadError);
    }
  }

  return { success: true, loads };
}
