import {
  sumBillOtherItems,
  type BillFormValues,
  type BillLoadFormLine,
} from '@/types/bill-form';

export const BILL_FORM_MAX_LOAD_ROWS = 3;
export const BILL_FORM_NUMERIC_MAX_DIGITS = 8;

const BILL_COMMISSION_RATE = 0.02;

export function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date | null {
  if (!iso) {
    return null;
  }

  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function suggestCodeFromName(name: string) {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24);
  return slug || 'NEW';
}

/** True when the user has started filling a load line (empty extras are skipped on save). */
export function isLoadLineStarted(line: BillLoadFormLine): boolean {
  return (
    line.consignorId != null ||
    line.consigneeId != null ||
    line.asPerBill ||
    line.toId != null ||
    line.goodsId != null ||
    line.unitId != null ||
    line.weightOrQuantity !== '' ||
    line.ratePerUnit !== '' ||
    line.advance !== '' ||
    line.topay !== ''
  );
}

/** First load is always saved; later empty rows are ignored. */
export function collectSavableLoadLines(loads: BillLoadFormLine[]): BillLoadFormLine[] {
  return loads.filter((line, index) => index === 0 || isLoadLineStarted(line));
}

export function createEmptyLoadLine(loadNumber = 1): BillLoadFormLine {
  return {
    loadNumber,
    consignorId: null,
    consignorName: '',
    consigneeId: null,
    consigneeName: '',
    asPerBill: false,
    toId: null,
    toLocationName: '',
    goodsId: null,
    goodsName: '',
    unitId: null,
    unitName: '',
    unitIsFixed: false,
    weightOrQuantity: '',
    ratePerUnit: '',
    freight: '',
    advance: '',
    topay: '',
    balance: '',
    loadId: null,
  };
}

export function createInitialBillFormValues(): BillFormValues {
  return recalculateBillForm({
    billNumber: '',
    billDate: todayIsoDate(),
    fromId: null,
    fromLocationName: '',
    truckId: null,
    truckNumber: '',
    nameBoardName: '',
    ownerName: '',
    ownerMobile: '',
    driverName: '',
    driverMobile1: '',
    driverMobile2: '',
    totalFreight: '',
    commission: '',
    crossing: '',
    handLoan: '',
    truckLoan: false,
    payBy: 'upi',
    paidName: '',
    paidMobile: '',
    officeMamul: '',
    tapalMamul: '',
    diesel: '',
    others: [],
    total: '',
    isCancelled: false,
    loads: [createEmptyLoadLine()],
  });
}

export function formatBillFormAmount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '';
  }

  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatBillFormCurrency(value: number | null | undefined): string {
  const amount = value ?? 0;
  return `₹ ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function toFormNumber(value: number | '' | null | undefined): number | null {
  if (value === '' || value == null) {
    return null;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseBillFormNumericInput(raw: string): number | '' | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return '';
  }

  if (!/^-?\d*(\.\d*)?$/.test(trimmed) || trimmed === '-' || trimmed === '.') {
    return null;
  }

  const integerPart = trimmed.split('.')[0]?.replace(/^-/, '') ?? '';
  if (integerPart.length > BILL_FORM_NUMERIC_MAX_DIGITS) {
    return null;
  }

  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function sumLoadField(loads: BillLoadFormLine[], field: 'advance' | 'balance'): number {
  return loads.reduce((sum, line) => sum + (toFormNumber(line[field]) ?? 0), 0);
}

export function sumLoadAdvances(loads: BillLoadFormLine[]): number {
  return sumLoadField(loads, 'advance');
}

export function isTruckLoanAllowed(loads: BillLoadFormLine[]): boolean {
  return sumLoadAdvances(loads) === 0;
}

export function formatBillLoadLineTitle(index: number): string {
  const loadNumber = index + 1;
  const mod100 = loadNumber % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return `${loadNumber}th load`;
  }

  switch (loadNumber % 10) {
    case 1:
      return `${loadNumber}st load`;
    case 2:
      return `${loadNumber}nd load`;
    case 3:
      return `${loadNumber}rd load`;
    default:
      return `${loadNumber}th load`;
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Commission rounding on the ones digit, to a multiple of 10.
 * Last digit below 5 floors (`3523` → `3520`); 5 and above ceils
 * (`3759` → `3760`).
 */
export function roundCommission(value: number): number {
  if (!Number.isFinite(value) || value === 0) {
    return 0;
  }

  const sign = value < 0 ? -1 : 1;
  const rupees = Math.round(Math.abs(value));
  const lastDigit = rupees % 10;
  const base = rupees - lastDigit;
  return sign * (lastDigit < 5 ? base : base + 10);
}

function calculateLoadFreight(line: BillLoadFormLine): number | null {
  const rate = toFormNumber(line.ratePerUnit);
  if (rate == null) {
    return null;
  }

  if (line.unitIsFixed) {
    return roundMoney(rate);
  }

  const weight = toFormNumber(line.weightOrQuantity);
  if (weight == null) {
    return null;
  }

  return roundMoney(weight * rate);
}

export function recalculateLoadLine(line: BillLoadFormLine): BillLoadFormLine {
  const freight = calculateLoadFreight(line);
  const advance = toFormNumber(line.advance) ?? 0;
  const topay = toFormNumber(line.topay) ?? 0;
  const balance =
    freight != null ? roundMoney(freight - advance - topay) : toFormNumber(line.balance);

  return {
    ...line,
    freight: freight ?? '',
    balance: balance ?? '',
  };
}

export function recalculateBillForm(values: BillFormValues): BillFormValues {
  const loads = values.loads.map(recalculateLoadLine);
  const totalFreight = roundMoney(
    loads.reduce((sum, line) => sum + (toFormNumber(line.freight) ?? 0), 0)
  );
  const commission = roundCommission(totalFreight * BILL_COMMISSION_RATE);
  const truckLoanAllowed = isTruckLoanAllowed(loads);

  const charges =
    commission +
    (toFormNumber(values.crossing) ?? 0) +
    (toFormNumber(values.officeMamul) ?? 0) +
    (toFormNumber(values.tapalMamul) ?? 0) +
    (toFormNumber(values.diesel) ?? 0) +
    (toFormNumber(values.handLoan) ?? 0) +
    sumBillOtherItems(values.others);

  const total = roundMoney(charges);

  return {
    ...values,
    loads,
    totalFreight,
    commission,
    truckLoan: truckLoanAllowed ? values.truckLoan : false,
    total,
  };
}
