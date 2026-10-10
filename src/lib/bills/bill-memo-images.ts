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

function isReadableFileUri(uri: string | null | undefined): uri is string {
  return (
    typeof uri === 'string' &&
    uri.startsWith('file://') &&
    !uri.startsWith('file:///android_res/')
  );
}

async function assetToDataUri(moduleId: number): Promise<string | undefined> {
  try {
    const asset = Asset.fromModule(moduleId);
    // Release Android images resolve to drawable names (no scheme). Asset marks
    // those as downloaded so Image can use them, but File cannot read them.
    // Force a copy into the cache as a real file:// URI first.
    if (!isReadableFileUri(asset.localUri)) {
      asset.localUri = null;
      asset.downloaded = false;
    }
    await asset.downloadAsync();
    const uri = asset.localUri;
    if (!isReadableFileUri(uri)) {
      return undefined;
    }
    const base64 = await new File(uri).base64();
    const mime = asset.type === 'jpg' || asset.type === 'jpeg' ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${base64}`;
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
