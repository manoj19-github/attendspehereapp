import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOUR_GLOBAL_KEY = "tour_global_done_v1";
export const TOUR_DASHBOARD_KEY = "tour_seen_dashboard_v1";
export const TOUR_SERVICES_KEY = "tour_seen_services_v1";

export async function isTourGloballyDone() {
  return (await AsyncStorage.getItem(TOUR_GLOBAL_KEY)) === "1";
}

export async function setTourGloballyDone() {
  await AsyncStorage.setItem(TOUR_GLOBAL_KEY, "1");
}

export async function hasSeen(key: string) {
  return (await AsyncStorage.getItem(key)) === "1";
}

export async function setSeen(key: string) {
  await AsyncStorage.setItem(key, "1");
}