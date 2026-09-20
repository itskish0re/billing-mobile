/** Key/value charge line in bills.others (jsonb array). */
export type BillOtherItem = {
  /** Client-only identity so uncontrolled fields survive add/remove. */
  uid: string;
  key: string;
  value: number | '';
};

export function sumBillOtherItems(items: BillOtherItem[]): number {
  return items.reduce((sum, item) => {
    const n = item.value === '' ? 0 : Number(item.value);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

let otherItemSeq = 0;

export function createEmptyBillOtherItem(): BillOtherItem {
  otherItemSeq += 1;
  return { uid: `other-${otherItemSeq}`, key: '', value: '' };
}

/** Builds a named charge captured from the "Add other charge" dialog. */
export function createBillOtherItem(key: string, value: number | ''): BillOtherItem {
  otherItemSeq += 1;
  return { uid: `other-${otherItemSeq}`, key, value };
}

export type BillLoadFormLine = {
  loadId?: number | null;
  loadNumber: number;
  consignorId: number | null;
  consignorName: string;
  consigneeId: number | null;
  consigneeName: string;
  asPerBill: boolean;
  toId: number | null;
  toLocationName: string;
  goodsId: number | null;
  goodsName: string;
  unitId: number | null;
  unitName: string;
  unitIsFixed: boolean;
  weightOrQuantity: number | '';
  ratePerUnit: number | '';
  freight: number | '';
  advance: number | '';
  topay: number | '';
  balance: number | '';
};

export type BillFormValues = {
  billId?: number | null;
  billNumber: string;
  billDate: string;
  fromId: number | null;
  fromLocationName: string;
  truckId: number | null;
  truckNumber: string;
  nameBoardName: string;
  ownerName: string;
  ownerMobile: string;
  driverName: string;
  driverMobile1: string;
  driverMobile2: string;
  totalFreight: number | '';
  commission: number | '';
  crossing: number | '';
  handLoan: number | '';
  truckLoan: boolean;
  payBy: string | null;
  paidName: string;
  paidMobile: string;
  officeMamul: number | '';
  tapalMamul: number | '';
  diesel: number | '';
  others: BillOtherItem[];
  total: number | '';
  isCancelled: boolean;
  isSigned: boolean;
  loads: BillLoadFormLine[];
};
