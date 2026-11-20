import { addDays } from "./dates.ts";

/**
 * Spaced repetition, Leitner-style. Cards move between boxes; a higher box means a
 * longer wait before the next review. Simple on purpose: easy to explain and test.
 * (A fancier scheduler like FSRS can replace this later without touching the UI.)
 */
export type Grade = "got" | "almost" | "not-yet";

export interface CardState {
  box: number;
  due: string; // YYYY-MM-DD
  reps: number;
  lapses: number;
  lastReviewed: string;
}

/** Days to wait after landing in each box. Expanding gaps are the point of spacing. */
export const INTERVAL_DAYS = [1, 2, 4, 8, 16, 32, 64];
const MAX_BOX = INTERVAL_DAYS.length - 1;

export function newCard(today: string): CardState {
  return { box: 0, due: today, reps: 0, lapses: 0, lastReviewed: today };
}

export function review(card: CardState, grade: Grade, today: string): CardState {
  let box = card.box;
  let lapses = card.lapses;
  if (grade === "got") box = Math.min(card.box + 1, MAX_BOX);
  else if (grade === "almost") box = Math.max(card.box, 1);
  else {
    box = 0;
    lapses += 1;
  }
  return {
    box,
    due: addDays(today, INTERVAL_DAYS[box]),
    reps: card.reps + 1,
    lapses,
    lastReviewed: today,
  };
}

export function isDue(card: CardState, today: string): boolean {
  return card.due <= today;
}
