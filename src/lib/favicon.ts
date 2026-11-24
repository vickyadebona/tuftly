import type { Season } from "./season";

/** Tab icon and home-screen icon for Bobbin's outfit in a season. Files live in public/favicons. */
export function faviconFor(season: Season): { icon: string; apple: string } {
  return { icon: `/favicons/${season}.png`, apple: `/favicons/${season}-apple.png` };
}
