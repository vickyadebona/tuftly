import type { Track } from "./types.ts";

/**
 * Unit numbers follow the order units actually appear, so a unit that's hidden (for example
 * content that isn't reviewed yet) never leaves a gap like "Unit 2" with no "Unit 1" above it.
 * Returns 0 for a unit that isn't shown.
 */
export function unitNumber(order: Track[], isShown: (track: Track) => boolean, track: Track): number {
  return order.filter(isShown).indexOf(track) + 1;
}

/** "2 lessons, about 12 minutes in total." Counts only the lessons passed in, so pass the published ones. */
export function lessonSummary(lessons: { minutes: number }[]): string {
  const minutes = lessons.reduce((n, l) => n + l.minutes, 0);
  return `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}, about ${minutes} minutes in total.`;
}
