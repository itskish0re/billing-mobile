import { StyleSheet, Text, View } from 'react-native';

import {
  BILL_MEMO_PAY_BY_OPTIONS,
  buildBillPreviewChargeRows,
  formatBillPreviewAmount,
  formatBillPreviewConsigneeName,
  formatBillPreviewDate,
  formatBillPreviewWeight,
  prepareBillPreviewLoads,
} from '@/lib/bills/bill-preview';
import { formatTruckNumber } from '@/lib/bills/format-truck-number';
import type { BillPreviewLoadLine, BillPreviewModel } from '@/types/bill-preview';

/** Fixed on-screen size of the memo (A4 portrait @ ~96dpi). */
export const BILL_MEMO_WIDTH = 794;
export const BILL_MEMO_HEIGHT = 1123;

const INK = '#111';
const BLUE = '#1a4f9c';
const RED = '#c8232c';

/** Load-table column widths. Header, body, and footer share these percents. */
const COL = {
  sno: '4%',
  consignor: '10%',
  consignee: '12%',
  goods: '8%',
  weight: '11%',
  rate: '7.8%',
  num: '11.8%',
} as const;

const FOOT = {
  truckLoan: '26%',
  totalFreight: '38.6%',
  empty: '35.4%',
} as const;

type BillMemoTemplateProps = {
  data: BillPreviewModel;
};

function MetaField({
  label,
  value,
  labelWidth = 108,
  valueColor = INK,
  valueBold = false,
  valueSize,
}: {
  label: string;
  value: string;
  labelWidth?: number;
  valueColor?: string;
  valueBold?: boolean;
  valueSize?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { width: labelWidth }]}>{label}</Text>
      <Text
        style={[
          styles.fieldValue,
          { color: valueColor },
          valueBold ? styles.bold : null,
          valueSize ? { fontSize: valueSize } : null,
        ]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function LoadCell({
  width,
  children,
  last = false,
  left = false,
  style,
}: {
  width: string;
  children?: React.ReactNode;
  last?: boolean;
  left?: boolean;
  style?: object;
}) {
  return (
    <View
      style={[
        styles.loadCell,
        { width },
        last ? null : styles.cellBorderRight,
        left ? styles.cellLeft : null,
        style,
      ]}>
      {children}
    </View>
  );
}

function LoadRow({ row, last }: { row: BillPreviewLoadLine; last?: boolean }) {
  const consigneeName = formatBillPreviewConsigneeName(row.consigneeName, row.asPerBill);
  const to = row.toLocationName?.trim();

  return (
    <View style={[styles.loadRow, last ? styles.loadRowLast : null]}>
      <LoadCell width={COL.sno}>
        <Text style={styles.loadSno}>{row.loadNumber}</Text>
      </LoadCell>
      <LoadCell width={COL.consignor} left>
        <Text style={styles.loadText}>{row.consignorName}</Text>
      </LoadCell>
      <LoadCell width={COL.consignee} left>
        <Text style={[styles.loadText, row.asPerBill ? styles.apb : null]}>{consigneeName}</Text>
        {to ? <Text style={styles.consigneeTo}>To: {to}</Text> : null}
      </LoadCell>
      <LoadCell width={COL.goods}>
        <Text style={styles.loadText}>{row.goodsName}</Text>
      </LoadCell>
      <LoadCell width={COL.weight}>
        <Text style={styles.loadText}>{formatBillPreviewWeight(row.weightOrQuantity)}</Text>
      </LoadCell>
      <LoadCell width={COL.rate}>
        <Text style={styles.loadText}>
          {formatBillPreviewAmount(row.ratePerUnit)}
          {row.unitName?.trim() ? (
            <Text style={styles.rateUnit}> {row.unitName.trim()}</Text>
          ) : null}
        </Text>
      </LoadCell>
      <LoadCell width={COL.num}>
        <Text style={styles.loadText}>{formatBillPreviewAmount(row.freight)}</Text>
      </LoadCell>
      <LoadCell width={COL.num}>
        <Text style={styles.loadText}>{formatBillPreviewAmount(row.advance)}</Text>
      </LoadCell>
      <LoadCell width={COL.num}>
        <Text style={styles.loadText}>{formatBillPreviewAmount(row.topay)}</Text>
      </LoadCell>
      <LoadCell width={COL.num} last>
        <Text style={styles.loadText}>{formatBillPreviewAmount(row.balance)}</Text>
      </LoadCell>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  total = false,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <View style={[styles.sumRow, total ? styles.sumRowTotal : null]}>
      <View style={[styles.sumCell, styles.sumCellLabel]}>
        <Text style={[styles.sumText, total ? styles.bold : styles.semibold]}>{label}</Text>
      </View>
      <View style={[styles.sumCell, styles.sumCellLast]}>
        <Text style={[styles.sumText, styles.sumValue, total ? styles.bold : null]}>{value}</Text>
      </View>
    </View>
  );
}

/** Native truck-memo layout matching the web A4 print template. */
export function BillMemoTemplate({ data }: BillMemoTemplateProps) {
  const { company } = data;
  const loadRows = prepareBillPreviewLoads(data.loads);
  const chargeRows = buildBillPreviewChargeRows(data);
  const showUpi = data.payBy === 'upi';
  const driverMobiles = [data.driverMobile1, data.driverMobile2]
    .filter((m) => m?.trim())
    .join(', ');

  return (
    <View style={[styles.memo, data.isCancelled ? styles.memoCancelled : null]}>
      <View style={styles.outer}>
        {/* Top strip */}
        <View style={styles.top}>
          <Text style={styles.motto}>{company.motto}</Text>
          <View style={styles.bannerWrap}>
            <View style={styles.bannerFill}>
              <View style={styles.bannerCutLeft} />
              <View style={styles.bannerCutRight} />
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerText}>{company.titleTop}</Text>
              <Text style={styles.bannerText}>{company.titleBottom}</Text>
            </View>
          </View>
          <Text style={styles.phone}>{company.phone}</Text>
        </View>

        {/* Brand row */}
        <View style={styles.brandRow}>
          <View style={styles.logo} />
          <View style={styles.brandCopy}>
            <View style={styles.companyNameRow}>
              <Text style={styles.companyNameMain}>{company.companyNameMain}</Text>
              <Text style={styles.companyNameSub}>{company.companyNameSub}</Text>
            </View>
            {company.addressLines.map((line) => (
              <Text key={line} style={styles.address}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.truckBox}>
            <Text style={styles.truckBoxLabel}>Truck Number :</Text>
            <Text style={styles.truckBoxValue}>
              {formatTruckNumber(data.truckNumber) || data.truckNumber}
            </Text>
          </View>
        </View>

        {/* Meta grid */}
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <View style={styles.metaHalf}>
              <MetaField label="Owner Name :" value={data.ownerName} />
            </View>
            <View style={[styles.metaHalf, styles.metaHalfRight, styles.metaSplit]}>
              <View style={styles.metaSplitHalf}>
                <MetaField
                  label="Memo No. :"
                  value={data.billNumber}
                  labelWidth={72}
                  valueColor={RED}
                  valueBold
                  valueSize={15}
                />
              </View>
              <View style={[styles.metaSplitHalf, styles.metaHalfRight]}>
                <MetaField
                  label="Date :"
                  value={formatBillPreviewDate(data.billDate)}
                  labelWidth={44}
                />
              </View>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaHalf}>
              <MetaField label="Owner Mobile :" value={data.ownerMobile} />
            </View>
            <View style={[styles.metaHalf, styles.metaHalfRight]}>
              <MetaField label="From :" value={data.fromLocationName} />
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaHalf}>
              <MetaField label="Driver Name :" value={data.driverName} />
            </View>
            <View style={[styles.metaHalf, styles.metaHalfRight]}>
              <MetaField label="To :" value={data.toLocationName} />
            </View>
          </View>
          <View style={[styles.metaRow, styles.metaRowLast]}>
            <View style={styles.metaHalf}>
              <MetaField label="Driver Mobile :" value={driverMobiles} />
            </View>
            <View style={[styles.metaHalf, styles.metaHalfRight]}>
              <MetaField label="Name Board :" value={data.nameBoardName} />
            </View>
          </View>
        </View>

        {/* Loads */}
        <View style={styles.loadsSection}>
          <View style={styles.loadsHead}>
            <LoadCell width={COL.sno}>
              <Text style={styles.headText}>S. No.</Text>
            </LoadCell>
            <LoadCell width={COL.consignor}>
              <Text style={styles.headText}>Consignor</Text>
            </LoadCell>
            <LoadCell width={COL.consignee}>
              <Text style={styles.headText}>Consignee</Text>
            </LoadCell>
            <LoadCell width={COL.goods}>
              <Text style={styles.headText}>Goods</Text>
            </LoadCell>
            <LoadCell width={COL.weight}>
              <Text style={styles.headText}>Weight / Qty</Text>
            </LoadCell>
            <LoadCell width={COL.rate}>
              <Text style={styles.headText}>Rate / Unit</Text>
            </LoadCell>
            <LoadCell width={COL.num}>
              <Text style={styles.headText}>Freight</Text>
            </LoadCell>
            <LoadCell width={COL.num}>
              <Text style={styles.headText}>Advance</Text>
            </LoadCell>
            <LoadCell width={COL.num}>
              <Text style={styles.headText}>To Pay</Text>
            </LoadCell>
            <LoadCell width={COL.num} last>
              <Text style={styles.headText}>Balance</Text>
            </LoadCell>
          </View>

          <View style={styles.loadsBody}>
            {loadRows.map((row, index) => (
              <LoadRow
                key={row.loadNumber}
                row={row}
                last={index === loadRows.length - 1}
              />
            ))}
          </View>

          <View style={styles.loadsFoot}>
            <View style={[styles.footCell, styles.footInline, { width: FOOT.truckLoan }]}>
              <Text style={styles.footLabel} numberOfLines={1}>
                Truck Loan
              </Text>
              <Text style={styles.footValue} numberOfLines={1}>
                {data.truckLoan ? formatBillPreviewAmount(data.total) : ''}
              </Text>
            </View>
            <View style={[styles.footCell, styles.footInline, { width: FOOT.totalFreight }]}>
              <Text style={styles.footLabel} numberOfLines={1}>
                Total Freight
              </Text>
              <Text style={styles.footValue} numberOfLines={1}>
                {formatBillPreviewAmount(data.totalFreight)}
              </Text>
            </View>
            <View style={[styles.footCell, styles.footCellLast, { width: FOOT.empty }]} />
          </View>
        </View>

        {/* Footer grid */}
        <View style={styles.footerGrid}>
          <View style={styles.footerColLeft}>
            <View>
              <Text style={styles.footerTitle}>Terms &amp; conditions</Text>
              {company.terms.map((line, index) => (
                <View key={line} style={styles.termRow}>
                  <Text style={styles.termMarker}>{index + 1}.</Text>
                  <Text style={styles.termBody}>{line}</Text>
                </View>
              ))}
            </View>

            <View>
              <Text style={styles.footerTitle}>Payment Summary</Text>
              <View style={styles.payTable}>
                <View style={styles.payHeadRow}>
                  <View style={[styles.payCell, styles.payCorner]}>
                    <Text style={styles.semibold} numberOfLines={1}>
                      Payment
                    </Text>
                  </View>
                  {BILL_MEMO_PAY_BY_OPTIONS.map((option, i) => (
                    <View
                      key={option.value}
                      style={[styles.payCell, i === 2 ? styles.payCellLast : null]}>
                      <Text style={styles.payCheck}>
                        {data.payBy === option.value ? '\u2713' : ' '}
                      </Text>
                      <Text style={styles.payOptionLabel}>{option.label}</Text>
                    </View>
                  ))}
                </View>
                {showUpi ? (
                  <>
                    <View style={styles.payBodyRow}>
                      <View style={[styles.payCell, styles.payCorner]}>
                        <Text style={styles.semibold}>Name</Text>
                      </View>
                      <View style={[styles.payCell, styles.payCellLast, styles.payValueCell]}>
                        <Text style={styles.payValue}>{data.paidName ?? ''}</Text>
                      </View>
                    </View>
                    <View style={[styles.payBodyRow, styles.payBodyRowLast]}>
                      <View style={[styles.payCell, styles.payCorner]}>
                        <Text style={styles.semibold}>Mobile</Text>
                      </View>
                      <View style={[styles.payCell, styles.payCellLast, styles.payValueCell]}>
                        <Text style={styles.payValue}>{data.paidMobile ?? ''}</Text>
                      </View>
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.footerColRight}>
            <View>
              <Text style={styles.footerTitle}>Charges &amp; Total</Text>
              <View style={styles.sumTable}>
                {chargeRows.map((row) => (
                  <SummaryRow
                    key={row.key}
                    label={row.label}
                    value={formatBillPreviewAmount(row.value)}
                    total={row.key === 'total'}
                  />
                ))}
              </View>
            </View>

            {data.advanceSummary ? (
              <View>
                <Text style={styles.footerTitle}>Advance Summary</Text>
                <View style={styles.sumTable}>
                  <SummaryRow
                    label="Advance"
                    value={formatBillPreviewAmount(data.advanceSummary.advance)}
                  />
                  <SummaryRow
                    label="Commission"
                    value={formatBillPreviewAmount(data.advanceSummary.commission)}
                  />
                  <SummaryRow
                    label="Balance"
                    value={formatBillPreviewAmount(data.advanceSummary.balance)}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Signatures — truck owner / driver line hidden for now */}
        <View style={styles.signatures}>
          {/*
          <View style={styles.signatureBlock}>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureLabel}>Truck Owner&apos;s &amp; Driver&apos;s Signature</Text>
          </View>
          */}
          <View style={[styles.signatureBlock, styles.signatureBlockRight]}>
            <View style={[styles.signatureSpace, styles.signatureSpaceRight]} />
            <Text style={styles.signatureLabel}>{company.signatureLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  memo: {
    width: BILL_MEMO_WIDTH,
    minHeight: BILL_MEMO_HEIGHT,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  memoCancelled: {
    opacity: 0.72,
  },
  outer: {
    flex: 1,
    borderWidth: 2,
    borderColor: INK,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },

  // Top strip
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  motto: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: INK,
    letterSpacing: 0.5,
  },
  bannerWrap: {
    width: 210,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BLUE,
    overflow: 'hidden',
  },
  bannerCutLeft: {
    position: 'absolute',
    left: -18,
    bottom: -22,
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    transform: [{ rotate: '28deg' }],
  },
  bannerCutRight: {
    position: 'absolute',
    right: -18,
    bottom: -22,
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    transform: [{ rotate: '-28deg' }],
  },
  bannerCopy: {
    zIndex: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  bannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.2,
    lineHeight: 15,
  },
  phone: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '700',
    fontSize: 13,
    color: INK,
  },

  // Brand row
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logo: {
    width: 72,
    height: 82,
    borderWidth: 1,
    borderColor: INK,
    marginRight: 10,
  },
  brandCopy: {
    flex: 1,
    paddingTop: 4,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  companyNameMain: {
    color: RED,
    fontSize: 31,
    fontWeight: '700',
  },
  companyNameSub: {
    color: RED,
    fontSize: 25,
    fontWeight: '700',
    marginLeft: 8,
  },
  address: {
    fontSize: 12,
    fontWeight: '500',
    color: INK,
    lineHeight: 17,
  },
  truckBox: {
    width: 136,
    borderWidth: 1,
    borderColor: INK,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 7,
    minHeight: 46,
  },
  truckBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: INK,
  },
  truckBoxValue: {
    marginTop: 8,
    fontSize: 12,
    color: INK,
  },

  // Meta
  meta: {
    borderWidth: 1,
    borderColor: INK,
  },
  metaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: INK,
  },
  metaRowLast: {
    borderBottomWidth: 0,
  },
  metaHalf: {
    flex: 1,
  },
  metaHalfRight: {
    borderLeftWidth: 1,
    borderLeftColor: INK,
  },
  metaSplit: {
    flexDirection: 'row',
  },
  metaSplitHalf: {
    flex: 1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 7,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: INK,
  },
  fieldValue: {
    flex: 1,
    fontSize: 12,
    color: INK,
    paddingHorizontal: 2,
  },

  // Loads
  loadsSection: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: INK,
  },
  loadsHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: INK,
  },
  headText: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
  },
  loadsBody: {},
  loadRow: {
    flexDirection: 'row',
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: INK,
  },
  loadRowLast: {
    borderBottomWidth: 0,
  },
  loadCell: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: INK,
  },
  cellLeft: {
    alignItems: 'flex-start',
  },
  loadText: {
    fontSize: 11,
    color: INK,
    textAlign: 'center',
    lineHeight: 15,
  },
  loadSno: {
    fontSize: 10,
    color: INK,
  },
  rateUnit: {
    fontSize: 8,
    fontWeight: '500',
    color: INK,
  },
  apb: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  consigneeTo: {
    fontSize: 9,
    fontWeight: '500',
    color: INK,
    marginTop: 2,
  },

  loadsFoot: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: INK,
  },
  footCell: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    minHeight: 34,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: INK,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  footCellLast: {
    borderRightWidth: 0,
  },
  footInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  footLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
  },
  footValue: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '700',
    color: INK,
    textAlign: 'right',
  },

  // Footer grid
  footerGrid: {
    flexDirection: 'row',
    marginTop: 24,
  },
  footerColLeft: {
    flex: 1.05,
    paddingHorizontal: 10,
    gap: 24,
  },
  footerColRight: {
    flex: 0.95,
    paddingHorizontal: 10,
    gap: 24,
  },
  footerTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
    marginBottom: 4,
  },
  termRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  termMarker: {
    width: 18,
    fontSize: 10,
    color: INK,
    textAlign: 'right',
    marginRight: 3,
  },
  termBody: {
    flex: 1,
    fontSize: 10,
    fontWeight: '500',
    color: INK,
    lineHeight: 15,
  },

  // Payment table
  payTable: {
    borderWidth: 1,
    borderColor: INK,
  },
  payHeadRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: INK,
  },
  payBodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: INK,
  },
  payBodyRowLast: {
    borderBottomWidth: 0,
  },
  payCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payCellLast: {
    borderRightWidth: 0,
  },
  payCorner: {
    flex: 0,
    width: 88,
    alignItems: 'flex-start',
  },
  payCheck: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    minHeight: 14,
  },
  payOptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  payValueCell: {
    flex: 1,
    alignItems: 'flex-start',
  },
  payValue: {
    fontSize: 11,
    color: INK,
  },

  // Summary tables
  sumTable: {
    borderWidth: 1,
    borderColor: INK,
  },
  sumRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: INK,
  },
  sumRowTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: INK,
  },
  sumCell: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: INK,
    justifyContent: 'center',
  },
  sumCellLabel: {
    flex: 1.6,
  },
  sumCellLast: {
    borderRightWidth: 0,
  },
  sumText: {
    fontSize: 12,
    color: INK,
  },
  sumValue: {
    flex: 1,
    textAlign: 'right',
    minWidth: 60,
  },
  semibold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },

  // Signatures
  signatures: {
    flexDirection: 'row',
    marginTop: 24,
  },
  signatureBlock: {
    flex: 1,
  },
  signatureBlockRight: {
    alignItems: 'flex-end',
  },
  signatureSpace: {
    width: '100%',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: INK,
    marginBottom: 6,
  },
  signatureSpaceRight: {
    maxWidth: 220,
  },
  signatureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: RED,
  },
});
