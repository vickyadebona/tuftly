import { STREAK } from "./config.ts";
import type { CardState } from "./scheduler.ts";
import type { Progress } from "./store.ts";

/**
 * Combine progress from this device with progress saved online. Nothing is ever lost:
 * finished lessons and active days are unioned, and each drill keeps whichever copy was
 * reviewed most recently (more reps breaks a tie).
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const cards: Record<string, CardState> = { ...b.cards };
  for (const [id, mine] of Object.entries(a.cards)) {
    const theirs = cards[id];
    if (!theirs || mine.lastReviewed > theirs.lastReviewed || (mine.lastReviewed === theirs.lastReviewed && mine.reps > theirs.reps)) {
      cards[id] = mine;
    }
  }
  const union = <T,>(x: T[], y: T[]) => [...new Set([...x, ...y])];
  return {
    cards,
    activeDays: union(a.activeDays, b.activeDays).sort(),
    lessonsDone: union(a.lessonsDone, b.lessonsDone),
    // Keep to the weekly limit; this device's choices come first.
    restWeekdays: union(a.restWeekdays, b.restWeekdays).slice(0, STREAK.restDaysPerWeek),
  };
}
