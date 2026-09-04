import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { buildBillMemoHtml } from '@/lib/bills/bill-memo-html';
import type { BillPreviewModel } from '@/types/bill-preview';

/** A4 at 72 PPI — expo-print page size in pixels. */
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

function filePart(value: string): string {
  return value
    .trim()
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/** `bill_<number>_<name board>_<truck>_<date>.pdf` */
function pdfFileName(data: BillPreviewModel): string {
  const truck = data.truckNumber.replace(/[\s-]+/g, '').toUpperCase();
  const parts = [
    'bill',
    filePart(data.billNumber),
    filePart(data.nameBoardName),
    filePart(truck || data.truckNumber),
    filePart(data.billDate),
  ].filter(Boolean);

  return `${parts.join('_')}.pdf`;
}

async function namedPdfUri(printedUri: string, data: BillPreviewModel): Promise<string> {
  try {
    const named = new File(Paths.cache, pdfFileName(data));
    if (named.exists) {
      named.delete();
    }
    new File(printedUri).copy(named);
    return named.uri;
  } catch {
    return printedUri;
  }
}

/** Renders the truck-memo HTML to a PDF and opens the system share sheet. */
export async function shareBillPdf(data: BillPreviewModel): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }

  const { uri } = await Print.printToFileAsync({
    html: buildBillMemoHtml(data),
    width: A4_WIDTH,
    height: A4_HEIGHT,
  });

  const shareUri = await namedPdfUri(uri, data);
  await Sharing.shareAsync(shareUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: data.billNumber ? `Share Bill ${data.billNumber}` : 'Share bill',
  });
}
