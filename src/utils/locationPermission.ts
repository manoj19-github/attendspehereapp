import { Platform } from "react-native";
import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  openSettings,
} from "react-native-permissions";

export async function ensureLocationPermission(): Promise<boolean> {
  const perm =
    Platform.OS === "ios"
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  const current = await check(perm);

  if (current === RESULTS.GRANTED) return true;

  if (current === RESULTS.BLOCKED) {
    // User permanently denied (or disabled). You must send them to settings.
    await openSettings();
    return false;
  }

  // RESULTS.DENIED or RESULTS.LIMITED => request
  const res = await request(perm);
  return res === RESULTS.GRANTED;
}
