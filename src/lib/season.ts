export type Season = "winter" | "spring" | "summer" | "autumn";
export type Hemisphere = "north" | "south";

export const SEASONS: Season[] = ["winter", "spring", "summer", "autumn"];

/**
 * Northern-hemisphere season for each month (index 0 = January).
 * Autumn runs September through November; "scarf season" is December through February.
 */
const NORTH: Season[] = [
  "winter", // Jan
  "winter", // Feb
  "spring", // Mar
  "spring", // Apr
  "spring", // May
  "summer", // Jun
  "summer", // Jul
  "summer", // Aug
  "autumn", // Sep
  "autumn", // Oct
  "autumn", // Nov
  "winter", // Dec
];

export function seasonForMonth(month0: number, hemisphere: Hemisphere = "north"): Season {
  const m = hemisphere === "north" ? month0 : (month0 + 6) % 12;
  return NORTH[m];
}

/** `date` is a local "YYYY-MM-DD" string (see dates.ts). */
export function seasonFor(date: string, hemisphere: Hemisphere = "north"): Season {
  return seasonForMonth(Number(date.slice(5, 7)) - 1, hemisphere);
}
