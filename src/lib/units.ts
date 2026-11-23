import type { Track } from "./types.ts";

/**
 * Unit numbers follow the order units actually appear, so a unit that's hidden (for example
 * content that isn't reviewed yet) never leaves a gap like "Unit 2" with no "Unit 1" above it.
 * Returns 0 for a unit that isn't shown.
 */
export function unitNumber(order: Track[], isShown: (track: Track) => boolean, track: Track): number {
  return order.filter(isShown).indexOf(track) + 1;
}
