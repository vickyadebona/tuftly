import { HEMISPHERE } from "./config";
import { todayStr } from "./dates";
import { seasonFor, type Season } from "./season";
import { useHydrated } from "./store";

/** The current season from the device's date. Winter until the browser is ready (no flash of nothing). */
export function useSeason(): Season {
  const hydrated = useHydrated();
  return hydrated ? seasonFor(todayStr(), HEMISPHERE) : "winter";
}
