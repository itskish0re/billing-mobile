import {
  BILL_FORM_MAX_LOAD_ROWS,
  collectSavableLoadLines,
  toFormNumber,
} from '@/lib/bills/bill-form';
import { formatTruckNumber } from '@/lib/bills/format-truck-number';
import type { BillFormValues } from '@/types/bill-form';
import type { BillListRow } from '@/types/bill-list';
import type {
  BillPreviewAdvanceSummary,
  BillPreviewLoadLine,
  BillPreviewModel,
  BillPreviewPayBy,
} from '@/types/bill-preview';

/** Maximum load lines rendered on the printed memo. */
export const BILL_MEMO_MAX_LOAD_ROWS = 3;

export const BILL_MEMO_PAY_BY_OPTIONS: { value: BillPreviewPayBy; label: string }[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'owner', label: 'Owner' },
];

/** Shown in the consignee column when "as per bill" is enabled. */
export const BILL_PREVIEW_AS_PER_BILL_LABEL = 'AS PER BILL';

export const DEFAULT_BILL_PREVIEW_COMPANY: BillPreviewModel['company'] = {
  motto: '|| OM NAMAH SHIVAYA ||',
  titleTop: 'TRUCK MEMO',
  titleBottom: 'COMMISSION MEMO',
  companyNameMain: 'Shiv Krupa',
  companyNameSub: 'Transport',
  addressLines: [
    'Balaji Chamber, N.H., 8-A, Opp. New R.T.O., At. New Jambudiya,',
    'Dist. MORBI-363 642. (Guj.)',
  ],
  phone: 'Mo. 98240 45196',
  signatureLabel: 'For, Shiv Krupa Transport',
  terms: [
    'In cash if truck goes out of order, we will not be responsible for the goods.',
    'In case any shortage is found in the goods we will not be responsible.',
    'In case goods are not delivered to the proper person we will not be responsible.',
    'At the time of loading truck driver has checked the goods properly.',
    'After delivery as per the way bill our responsibility is finished.',
  ],
};

export function formatBillPreviewDate(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatBillPreviewAmount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '';
  }

  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatBillPreviewWeight(weight: number | null | undefined): string {
  return formatBillPreviewAmount(weight);
}

export function formatBillPreviewConsigneeName(
  consigneeName: string,
  asPerBill: boolean
): string {
  return asPerBill ? BILL_PREVIEW_AS_PER_BILL_LABEL : consigneeName;
}

function createEmptyLoadRow(loadNumber: number): BillPreviewLoadLine {
  return {
    loadNumber,
    consignorName: '',
    consigneeName: '',
    asPerBill: false,
    toLocationName: '',
    goodsName: '',
    unitName: '',
    weightOrQuantity: null,
    ratePerUnit: null,
    freight: null,
    advance: null,
    topay: null,
    balance: null,
  };
}

function isPreviewLoadBlank(line: BillPreviewLoadLine): boolean {
  return (
    !line.consignorName.trim() &&
    !line.consigneeName.trim() &&
    !line.asPerBill &&
    !line.toLocationName.trim() &&
    !line.goodsName.trim() &&
    !line.unitName.trim() &&
    line.weightOrQuantity == null &&
    line.ratePerUnit == null &&
    line.freight == null
  );
}

/** Caps at {@link BILL_MEMO_MAX_LOAD_ROWS}; drops unused extra lines; renumbers S. No. */
export function prepareBillPreviewLoads(loads: BillPreviewLoadLine[]): BillPreviewLoadLine[] {
  const filled = [...loads]
    .sort((a, b) => a.loadNumber - b.loadNumber)
    .filter((line) => !isPreviewLoadBlank(line))
    .slice(0, BILL_MEMO_MAX_LOAD_ROWS);

  if (filled.length === 0) {
    return [createEmptyLoadRow(1)];
  }

  return filled.map((line, index) => ({ ...line, loadNumber: index + 1 }));
}

export type BillPreviewChargeRow = {
  key: string;
  label: string;
  value: number | null;
};

/** Charge rows shown below loads (fixed order, then dynamic others, then TOTAL). */
export function buildBillPreviewChargeRows(data: BillPreviewModel): BillPreviewChargeRow[] {
  const rows: BillPreviewChargeRow[] = [
    { key: 'commission', label: 'Commission', value: data.commission },
    { key: 'crossing', label: 'Crossing', value: data.crossing },
    { key: 'officeMamul', label: 'Office Mamul', value: data.officeMamul },
    { key: 'tapalMamul', label: 'Tapal Mamul', value: data.tapalMamul },
    { key: 'handLoan', label: 'Hand Loan', value: data.handLoan },
    { key: 'diesel', label: 'Diesel', value: data.diesel },
  ];

  data.others.forEach((item, index) => {
    rows.push({
      key: `other-${index}-${item.key}`,
      label: item.key.trim() || 'Extra',
      value: item.value,
    });
  });

  rows.push({ key: 'total', label: 'TOTAL', value: data.total });

  return rows;
}

function sumPreviewLoadField(
  loads: readonly Pick<BillPreviewLoadLine, 'advance' | 'balance'>[],
  field: 'advance' | 'balance'
): number {
  return loads.reduce((sum, line) => {
    const value = line[field];
    return sum + (value == null || Number.isNaN(value) ? 0 : value);
  }, 0);
}

/** Advance summary — hidden when total load advances are zero. */
export function buildBillAdvanceSummary(
  loads: readonly Pick<BillPreviewLoadLine, 'advance' | 'balance'>[],
  total: number | null
): BillPreviewAdvanceSummary | null {
  const advance = sumPreviewLoadField(loads, 'advance');
  if (advance === 0) {
    return null;
  }

  const billTotal = total ?? 0;

  return {
    advance,
    commission: billTotal,
    balance: advance - billTotal,
  };
}

function normalizePayBy(payBy: string | null): BillPreviewPayBy | null {
  return payBy === 'upi' || payBy === 'cash' || payBy === 'owner' ? payBy : null;
}

/** Maps live bill-form state to the controlled preview model. */
export function mapBillFormToPreview(values: BillFormValues): BillPreviewModel {
  const loads: BillPreviewLoadLine[] = collectSavableLoadLines(values.loads).map((line, index) => ({
    loadNumber: line.loadNumber || index + 1,
    consignorName: line.consignorName,
    consigneeName: line.consigneeName,
    asPerBill: line.asPerBill,
    toLocationName: line.toLocationName,
    goodsName: line.goodsName,
    unitName: line.unitName,
    weightOrQuantity: toFormNumber(line.weightOrQuantity),
    ratePerUnit: toFormNumber(line.ratePerUnit),
    freight: toFormNumber(line.freight),
    advance: toFormNumber(line.advance),
    topay: toFormNumber(line.topay),
    balance: toFormNumber(line.balance),
  }));

  const primaryLoad = values.loads
    .map((line, index) => ({
      loadNumber: line.loadNumber || index + 1,
      toLocationName: line.toLocationName,
    }))
    .sort((a, b) => a.loadNumber - b.loadNumber)[0];

  const payBy = normalizePayBy(values.payBy);

  return {
    company: DEFAULT_BILL_PREVIEW_COMPANY,
    billNumber: values.billNumber,
    billDate: values.billDate,
    fromLocationName: values.fromLocationName,
    toLocationName: primaryLoad?.toLocationName ?? '',
    truckNumber: formatTruckNumber(values.truckNumber),
    nameBoardName: values.nameBoardName,
    ownerName: values.ownerName,
    ownerMobile: values.ownerMobile,
    driverName: values.driverName,
    driverMobile1: values.driverMobile1,
    driverMobile2: values.driverMobile2,
    loads: loads.slice(0, BILL_FORM_MAX_LOAD_ROWS),
    truckLoan: values.truckLoan,
    payBy,
    paidName: payBy === 'upi' ? values.paidName.trim() || null : null,
    paidMobile: payBy === 'upi' ? values.paidMobile.trim() || null : null,
    advanceSummary: buildBillAdvanceSummary(loads, toFormNumber(values.total)),
    commission: toFormNumber(values.commission),
    officeMamul: toFormNumber(values.officeMamul),
    tapalMamul: toFormNumber(values.tapalMamul),
    crossing: toFormNumber(values.crossing),
    handLoan: toFormNumber(values.handLoan),
    diesel: toFormNumber(values.diesel),
    others: values.others
      .filter((o) => o.key.trim() || o.value !== '')
      .map((o) => ({ key: o.key.trim(), value: toFormNumber(o.value) })),
    total: toFormNumber(values.total),
    totalFreight: toFormNumber(values.totalFreight),
    isCancelled: values.isCancelled,
  };
}

/** Maps a persisted bill list row (view + loads) to the preview model. */
export function mapBillListRowToPreview(row: BillListRow): BillPreviewModel {
  const loads: BillPreviewLoadLine[] = row.loads.map((line, index) => ({
    loadNumber: line.loadNumber || index + 1,
    consignorName: line.consignorName,
    consigneeName: line.consigneeName,
    asPerBill: line.asPerBill,
    toLocationName: line.toLocationName,
    goodsName: line.goodsName,
    unitName: line.unitName,
    weightOrQuantity: line.weightOrQuantity,
    ratePerUnit: line.ratePerUnit,
    freight: line.freight,
    advance: line.advance,
    topay: line.topay,
    balance: line.balance,
  }));

  const payBy = normalizePayBy(row.payBy);

  return {
    company: DEFAULT_BILL_PREVIEW_COMPANY,
    billNumber: row.billNumber,
    billDate: row.billDate,
    fromLocationName: row.fromLocationName,
    toLocationName: loads[0]?.toLocationName ?? '',
    truckNumber: formatTruckNumber(row.truckNumber),
    nameBoardName: row.nameBoardName,
    ownerName: row.ownerName,
    ownerMobile: row.ownerMobile,
    driverName: row.driverName,
    driverMobile1: row.driverMobile1,
    driverMobile2: row.driverMobile2,
    loads: loads.slice(0, BILL_FORM_MAX_LOAD_ROWS),
    truckLoan: row.truckLoan,
    payBy,
    paidName: payBy === 'upi' ? (row.paidName ?? '').trim() || null : null,
    paidMobile: payBy === 'upi' ? (row.paidMobile ?? '').trim() || null : null,
    advanceSummary: buildBillAdvanceSummary(loads, row.total),
    commission: row.commission,
    officeMamul: row.officeMamul,
    tapalMamul: row.tapalMamul,
    crossing: row.crossing,
    handLoan: row.handLoan,
    diesel: row.diesel,
    others: row.others.map((o) => ({ key: o.key.trim(), value: o.value })),
    total: row.total,
    totalFreight: row.totalFreight,
    isCancelled: row.isCancelled,
  };
}
