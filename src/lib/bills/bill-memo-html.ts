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
import type { BillPreviewModel } from '@/types/bill-preview';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function text(value: string | null | undefined): string {
  return escapeHtml(value?.trim() ?? '');
}

/** A4 HTML for `expo-print`, matching the on-screen truck-memo template. */
export function buildBillMemoHtml(data: BillPreviewModel): string {
  const { company } = data;
  const loadRows = prepareBillPreviewLoads(data.loads);
  const chargeRows = buildBillPreviewChargeRows(data);
  const showUpi = data.payBy === 'upi';
  const driverMobiles = [data.driverMobile1, data.driverMobile2]
    .filter((mobile) => mobile?.trim())
    .join(', ');
  const cancelledClass = data.isCancelled ? ' cancelled' : '';

  const loadBody = loadRows
    .map((row) => {
      const consignee = formatBillPreviewConsigneeName(row.consigneeName, row.asPerBill);
      const to = row.toLocationName?.trim();
      const unit = row.unitName?.trim();
      return `<tr>
        <td class="c-sno">${row.loadNumber}</td>
        <td class="left">${text(row.consignorName)}</td>
        <td class="left">${row.asPerBill ? `<span class="apb">${text(consignee)}</span>` : text(consignee)}${
          to ? `<div class="to">To: ${text(to)}</div>` : ''
        }</td>
        <td>${text(row.goodsName)}</td>
        <td>${text(formatBillPreviewWeight(row.weightOrQuantity))}</td>
        <td>${text(formatBillPreviewAmount(row.ratePerUnit))}${
          unit ? ` <span class="unit">${text(unit)}</span>` : ''
        }</td>
        <td>${text(formatBillPreviewAmount(row.freight))}</td>
        <td>${text(formatBillPreviewAmount(row.advance))}</td>
        <td>${text(formatBillPreviewAmount(row.topay))}</td>
        <td>${text(formatBillPreviewAmount(row.balance))}</td>
      </tr>`;
    })
    .join('');

  const chargeBody = chargeRows
    .map(
      (row) => `<tr class="${row.key === 'total' ? 'total' : ''}">
        <td>${text(row.label)}</td>
        <td class="num">${text(formatBillPreviewAmount(row.value))}</td>
      </tr>`
    )
    .join('');

  const payOptions = BILL_MEMO_PAY_BY_OPTIONS.map(
    (option) => `<td class="pay-opt">${
      data.payBy === option.value ? '✓' : '&nbsp;'
    }<div>${text(option.label)}</div></td>`
  ).join('');

  const upiRows = showUpi
    ? `<tr>
        <th>Name</th>
        <td class="left" colspan="3">${text(data.paidName)}</td>
      </tr>
      <tr>
        <th>Mobile</th>
        <td class="left" colspan="3">${text(data.paidMobile)}</td>
      </tr>`
    : '';

  const advanceBlock = data.advanceSummary
    ? `<h3>Advance Summary</h3>
      <table class="sum">
        <tr><td>Advance</td><td class="num">${text(formatBillPreviewAmount(data.advanceSummary.advance))}</td></tr>
        <tr><td>Commission</td><td class="num">${text(formatBillPreviewAmount(data.advanceSummary.commission))}</td></tr>
        <tr><td>Balance</td><td class="num">${text(formatBillPreviewAmount(data.advanceSummary.balance))}</td></tr>
      </table>`
    : '';

  const terms = company.terms
    .map((line, index) => `<div class="term"><span>${index + 1}.</span><p>${text(line)}</p></div>`)
    .join('');

  const addresses = company.addressLines.map((line) => `<div>${text(line)}</div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page { size: A4; margin: 8mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      color: #111;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
    }
    .memo { width: 100%; }
    .memo.cancelled { opacity: 0.72; }
    .frame { border: 2px solid #111; padding: 8px 10px 10px; }
    .top { display: table; width: 100%; margin-bottom: 6px; }
    .top > * { display: table-cell; vertical-align: middle; }
    .motto { font-weight: 600; letter-spacing: 0.5px; width: 28%; }
    .banner {
      background: #1a4f9c;
      color: #fff;
      text-align: center;
      font-weight: 700;
      letter-spacing: 1.2px;
      padding: 6px 28px 7px;
      width: 36%;
      -webkit-clip-path: polygon(0 0, 100% 0, 86% 100%, 14% 100%);
      clip-path: polygon(0 0, 100% 0, 86% 100%, 14% 100%);
    }
    .banner div { line-height: 1.25; }
    .phone { text-align: right; font-weight: 700; font-size: 13px; width: 36%; }
    .brand { display: table; width: 100%; margin-bottom: 8px; }
    .brand > * { display: table-cell; vertical-align: top; }
    .logo { width: 72px; height: 82px; border: 1px solid #111; }
    .brand-copy { padding: 4px 10px 0; }
    .company { color: #c8232c; font-weight: 700; line-height: 1.1; margin-bottom: 4px; }
    .company .main { font-size: 28px; }
    .company .sub { font-size: 22px; margin-left: 8px; }
    .address { font-weight: 500; line-height: 1.4; }
    .truck { width: 136px; border: 1px solid #111; padding: 6px 10px 7px; }
    .truck .label { font-weight: 600; }
    .truck .value { margin-top: 8px; }
    table.meta, table.loads, table.pay, table.sum { width: 100%; border-collapse: collapse; }
    table.meta td, table.meta th, table.loads td, table.loads th, table.pay td, table.pay th, table.sum td {
      border: 1px solid #111;
      padding: 5px 8px;
      vertical-align: top;
    }
    table.meta .lbl { font-weight: 600; white-space: nowrap; width: 28%; }
    .red { color: #c8232c; font-weight: 700; font-size: 15px; }
    table.loads { margin-top: 0; border-top: 0; table-layout: fixed; }
    table.loads col.c-sno { width: 4%; }
    table.loads col.c-consignor { width: 10%; }
    table.loads col.c-consignee { width: 12%; }
    table.loads col.c-goods { width: 8%; }
    table.loads col.c-weight { width: 11%; }
    table.loads col.c-rate { width: 7.8%; }
    table.loads col.c-num { width: 11.8%; }
    table.loads th { font-weight: 600; text-align: center; white-space: nowrap; font-size: 10px; }
    table.loads td { text-align: center; height: 40px; }
    table.loads td.left { text-align: left; }
    .apb { font-family: monospace; font-size: 8px; font-weight: 600; letter-spacing: 0.6px; }
    .to { font-size: 9px; font-weight: 500; margin-top: 2px; }
    .unit { font-size: 8px; font-weight: 500; }
    table.loads td.foot-loan,
    table.loads td.foot-freight,
    table.loads td.foot-empty { vertical-align: middle; }
    table.loads td.foot-loan,
    table.loads td.foot-freight { text-align: left; }
    .foot-label { font-weight: 600; }
    .foot-value { font-weight: 700; float: right; }
    .footer { display: table; width: 100%; margin-top: 20px; }
    .footer > * { display: table-cell; vertical-align: top; width: 50%; padding: 0 8px; }
    h3 { font-size: 11px; font-weight: 600; margin: 0 0 4px; }
    .term { display: table; width: 100%; margin-bottom: 4px; }
    .term span { display: table-cell; width: 18px; text-align: right; padding-right: 4px; }
    .term p { display: table-cell; margin: 0; font-weight: 500; line-height: 1.4; }
    table.pay { margin-top: 4px; }
    table.pay th { width: 88px; text-align: left; white-space: nowrap; }
    table.pay .pay-opt { text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
    table.sum td.num, .num { text-align: right; }
    table.sum tr.total td { font-weight: 700; border-top: 2px solid #111; }
    .advance { margin-top: 18px; }
    .signs { display: table; width: 100%; margin-top: 24px; }
    .signs > * { display: table-cell; width: 50%; vertical-align: bottom; }
    .signs .right { text-align: right; }
    .sign-line { border-bottom: 1px solid #111; height: 48px; margin-bottom: 6px; }
    .signs .right .sign-line { margin-left: auto; max-width: 220px; }
    .sign-label { font-weight: 600; color: #c8232c; }
  </style>
</head>
<body>
  <div class="memo${cancelledClass}">
    <div class="frame">
      <div class="top">
        <div class="motto">${text(company.motto)}</div>
        <div class="banner">
          <div>${text(company.titleTop)}</div>
          <div>${text(company.titleBottom)}</div>
        </div>
        <div class="phone">${text(company.phone)}</div>
      </div>

      <div class="brand">
        <div class="logo"></div>
        <div class="brand-copy">
          <div class="company">
            <span class="main">${text(company.companyNameMain)}</span>
            <span class="sub">${text(company.companyNameSub)}</span>
          </div>
          <div class="address">${addresses}</div>
        </div>
        <div class="truck">
          <div class="label">Truck Number :</div>
          <div class="value">${text(formatTruckNumber(data.truckNumber) || data.truckNumber)}</div>
        </div>
      </div>

      <table class="meta">
        <tr>
          <td class="lbl">Owner Name :</td>
          <td>${text(data.ownerName)}</td>
          <td class="lbl">Memo No. :</td>
          <td class="red">${text(data.billNumber)}</td>
          <td class="lbl">Date :</td>
          <td>${text(formatBillPreviewDate(data.billDate))}</td>
        </tr>
        <tr>
          <td class="lbl">Owner Mobile :</td>
          <td>${text(data.ownerMobile)}</td>
          <td class="lbl">From :</td>
          <td colspan="3">${text(data.fromLocationName)}</td>
        </tr>
        <tr>
          <td class="lbl">Driver Name :</td>
          <td>${text(data.driverName)}</td>
          <td class="lbl">To :</td>
          <td colspan="3">${text(data.toLocationName)}</td>
        </tr>
        <tr>
          <td class="lbl">Driver Mobile :</td>
          <td>${text(driverMobiles)}</td>
          <td class="lbl">Name Board :</td>
          <td colspan="3">${text(data.nameBoardName)}</td>
        </tr>
      </table>

      <table class="loads">
        <colgroup>
          <col class="c-sno" />
          <col class="c-consignor" />
          <col class="c-consignee" />
          <col class="c-goods" />
          <col class="c-weight" />
          <col class="c-rate" />
          <col class="c-num" />
          <col class="c-num" />
          <col class="c-num" />
          <col class="c-num" />
        </colgroup>
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Consignor</th>
            <th>Consignee</th>
            <th>Goods</th>
            <th>Weight / Qty</th>
            <th>Rate / Unit</th>
            <th>Freight</th>
            <th>Advance</th>
            <th>To Pay</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>${loadBody}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="foot-loan">
              <span class="foot-label">Truck Loan</span>
              <span class="foot-value">${
                data.truckLoan ? text(formatBillPreviewAmount(data.total)) : ''
              }</span>
            </td>
            <td colspan="4" class="foot-freight">
              <span class="foot-label">Total Freight</span>
              <span class="foot-value">${text(formatBillPreviewAmount(data.totalFreight))}</span>
            </td>
            <td colspan="3" class="foot-empty"></td>
          </tr>
        </tfoot>
      </table>

      <div class="footer">
        <div>
          <h3>Terms &amp; conditions</h3>
          ${terms}
          <h3 style="margin-top:18px">Payment Summary</h3>
          <table class="pay">
            <tr>
              <th>Payment</th>
              ${payOptions}
            </tr>
            ${upiRows}
          </table>
        </div>
        <div>
          <h3>Charges &amp; Total</h3>
          <table class="sum">${chargeBody}</table>
          ${advanceBlock ? `<div class="advance">${advanceBlock}</div>` : ''}
        </div>
      </div>

      <div class="signs">
        <!--
        <div>
          <div class="sign-line"></div>
          <div class="sign-label">Truck Owner's &amp; Driver's Signature</div>
        </div>
        -->
        <div class="right">
          <div class="sign-line"></div>
          <div class="sign-label">${text(company.signatureLabel)}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
