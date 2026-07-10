import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

const RECONNECT_DELAY_MS = 800;

export function isNetInfoOnline(state: NetInfoState) {
  if (!state.isConnected) {
    return false;
  }

  // Android often reports `null` while Wi-Fi is connected and usable.
  return state.isInternetReachable !== false;
}

export async function resolveConnectivity(wasOffline: boolean) {
  if (wasOffline) {
    await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));
  }

  const state = await NetInfo.fetch();
  return isNetInfoOnline(state);
}
