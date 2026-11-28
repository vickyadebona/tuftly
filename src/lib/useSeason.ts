import { BUILT_SEASON } from "./builtSeason";
import { HEMISPHERE, SEASON_OVERRIDE } from "./config";
import { todayStr } from "./dates";
import { seasonFor, type Season } from "./season";
import { useHydrated } from "./store";

/** The current season from the device's date. Until the browser is ready, the build's season. */
export function useSeason(): Season {
  const hydrated = useHydrated();
  if (SEASON_OVERRIDE) return SEASON_OVERRIDE;
  return hydrated ? seasonFor(todayStr(), HEMISPHERE) : BUILT_SEASON;
}
