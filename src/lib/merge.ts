import { STREAK } from "./config.ts";
import { mergeSettings } from "./streak.ts";
import type { CardState } from "./scheduler.ts";
import type { Progress, SavedPosition } from "./store.ts";

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
  // A lesson in progress keeps the copy touched most recently, unless it's finished on either side.
  const done = new Set(union(a.lessonsDone, b.lessonsDone));
  const lessonProgress: Record<string, SavedPosition> = {};
  const mine = a.lessonProgress ?? {};
  const theirs = b.lessonProgress ?? {};
  for (const id of new Set([...Object.keys(mine), ...Object.keys(theirs)])) {
    if (done.has(id)) continue;
    const x = mine[id];
    const y = theirs[id];
    lessonProgress[id] = !x ? y : !y ? x : x.updatedAt >= y.updatedAt ? x : y;
  }
  const tea = !a.tea || (b.tea && b.tea.at > a.tea.at) ? b.tea : a.tea;
  const streakSettings = mergeSettings(a.streakSettings, b.streakSettings);
  return {
    ...(streakSettings.length ? { streakSettings } : {}),
    ...(tea ? { tea } : {}),
    cards,
    lessonProgress,
    struggled: union(a.struggled ?? [], b.struggled ?? []),
    unitsSeen: union(a.unitsSeen ?? [], b.unitsSeen ?? []),
    activeDays: union(a.activeDays, b.activeDays).sort(),
    lessonsDone: union(a.lessonsDone, b.lessonsDone),
    // Keep to the weekly limit; this device's choices come first.
    restWeekdays: union(a.restWeekdays, b.restWeekdays).slice(0, STREAK.restDaysPerWeek),
  };
}
