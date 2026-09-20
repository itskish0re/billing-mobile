import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

export const BILL_CANCELLED_STAMP = require('@/assets/images/cancelled-stamp.png');
export const BILL_SIGNATURE_IMAGE = require('@/assets/images/signature.png');
export const BILL_LOGO_IMAGE = require('@/assets/images/logo.png');

export type BillMemoImageUris = {
  cancelledStamp?: string;
  signature?: string;
  logo?: string;
};

async function assetToDataUri(moduleId: number): Promise<string | undefined> {
  try {
    const asset = Asset.fromModule(moduleId);
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (!uri) {
      return undefined;
    }
    const base64 = await new File(uri).base64();
    return `data:image/png;base64,${base64}`;
  } catch {
    return undefined;
  }
}

/** Data URIs so expo-print can embed the stamp and signature in the PDF. */
export async function loadBillMemoImageUris(): Promise<BillMemoImageUris> {
  const [cancelledStamp, signature, logo] = await Promise.all([
    assetToDataUri(BILL_CANCELLED_STAMP),
    assetToDataUri(BILL_SIGNATURE_IMAGE),
    assetToDataUri(BILL_LOGO_IMAGE),
  ]);
  return { cancelledStamp, signature, logo };
}
