/** Payment mode printed on the memo. */
export type BillPreviewPayBy = 'upi' | 'cash' | 'owner';

export type BillPreviewOtherItem = {
  key: string;
  value: number | null;
};

export type BillPreviewLoadLine = {
  loadNumber: number;
  consignorName: string;
  consigneeName: string;
  asPerBill: boolean;
  toLocationName: string;
  goodsName: string;
  unitName: string;
  weightOrQuantity: number | null;
  ratePerUnit: number | null;
  freight: number | null;
  advance: number | null;
  topay: number | null;
  balance: number | null;
};

export type BillPreviewAdvanceSummary = {
  /** Sum of advances across all loads. */
  advance: number;
  /** Bill total (printed under the "Commission" label to match the paper memo). */
  commission: number;
  /** advance − bill total. */
  balance: number;
};

export type BillPreviewCompany = {
  motto: string;
  titleTop: string;
  titleBottom: string;
  /** Primary script line (e.g. "Shiv Krupa"). */
  companyNameMain: string;
  /** Secondary script line on the same row (e.g. "Transport"). */
  companyNameSub: string;
  addressLines: string[];
  phone: string;
  signatureLabel: string;
  /** Numbered disclaimer lines at the bottom-left of the memo. */
  terms: string[];
};

/** Controlled display model for the truck-memo preview. */
export type BillPreviewModel = {
  company: BillPreviewCompany;
  billNumber: string;
  billDate: string;
  fromLocationName: string;
  /** Primary destination — `to` of the load with the lowest load number. */
  toLocationName: string;
  truckNumber: string;
  nameBoardName: string;
  ownerName: string;
  ownerMobile: string;
  driverName: string;
  driverMobile1: string;
  driverMobile2: string;
  loads: BillPreviewLoadLine[];
  truckLoan: boolean;
  payBy: BillPreviewPayBy | null;
  paidName: string | null;
  paidMobile: string | null;
  /** Shown when the sum of load advances is non-zero. */
  advanceSummary: BillPreviewAdvanceSummary | null;
  commission: number | null;
  officeMamul: number | null;
  tapalMamul: number | null;
  crossing: number | null;
  handLoan: number | null;
  diesel: number | null;
  others: BillPreviewOtherItem[];
  total: number | null;
  totalFreight: number | null;
  isCancelled: boolean;
};
