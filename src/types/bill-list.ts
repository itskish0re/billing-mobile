/** A load line joined with display names (from `v_loads`). */
export type BillListLoad = {
  loadId: number;
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
  weightOrQuantity: number | null;
  ratePerUnit: number | null;
  freight: number | null;
  advance: number | null;
  topay: number | null;
  balance: number | null;
};

/** A single bill row for the transactions list (from `v_bills` + its loads). */
export type BillListRow = {
  billId: number;
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
  totalFreight: number | null;
  commission: number | null;
  crossing: number | null;
  officeMamul: number | null;
  tapalMamul: number | null;
  diesel: number | null;
  handLoan: number | null;
  truckLoan: boolean;
  payBy: string | null;
  paidName: string | null;
  paidMobile: string | null;
  /** Raw named charges from `bills.others` jsonb (not the summed view column). */
  others: { key: string; value: number | null }[];
  total: number | null;
  isCancelled: boolean;
  isSigned: boolean;
  financialYearId: number | null;
  /** Sorted ascending by load number; the first entry is the primary "To". */
  loads: BillListLoad[];
};
