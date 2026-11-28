import { HEMISPHERE, SEASON_OVERRIDE } from "./config";
import { todayStr } from "./dates";
import { seasonFor, type Season } from "./season";

/**
 * The season on the day the site was built. Pages are drawn ahead of time, so the server and the
 * first paint in the browser both use it. Safe to import from server files.
 */
export const BUILT_SEASON: Season = SEASON_OVERRIDE ?? seasonFor(process.env.BUILT_ON ?? todayStr(), HEMISPHERE);
