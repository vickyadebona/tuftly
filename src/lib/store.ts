import { useSyncExternalStore } from "react";
import type { TeaId } from "@/components/PixelIcon";
import { todayStr } from "./dates";
import type { LessonPosition } from "./lessonFlow";
import { newCard, review, type CardState, type Grade } from "./scheduler";

/**
 * Local-only progress for now (browser localStorage). Swap for Supabase later:
 * keep the same Progress shape and these action functions.
 */
export interface Progress {
  cards: Record<string, CardState>;
  activeDays: string[];
  lessonsDone: string[];
  restWeekdays: number[];
  /** Lessons started but not finished: where to pick up. Cleared when the lesson is completed. */
  lessonProgress: Record<string, SavedPosition>;
  /** Lesson ideas that needed a second try. Their drills come up first in practice. */
  struggled: string[];
  /** Unit tracks whose introduction has been seen, so it only shows once. */
  unitsSeen: string[];
  /** The tea last chosen for a tea break, and when, so the latest choice wins across devices. */
  tea?: { id: TeaId; at: number };
}

export type SavedPosition = LessonPosition & { updatedAt: number };

const KEY = "tuftly-progress-v1";
const EMPTY: Progress = { cards: {}, activeDays: [], lessonsDone: [], restWeekdays: [], lessonProgress: {}, struggled: [], unitsSeen: [] };

let cache: { raw: string | null; value: Progress } = { raw: null, value: EMPTY };
const listeners = new Set<() => void>();

function read(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    cache = { raw, value: raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY };
    return cache.value;
  } catch {
    return EMPTY;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function update(fn: (p: Progress) => Progress) {
  const next = fn(read());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode, full). Progress just won't persist this session.
  }
  listeners.forEach((l) => l());
}

/** Current progress, outside React. Used by sync. */
export function getProgress(): Progress {
  return read();
}

/** Overwrite local progress (after merging with what's saved online). */
export function replaceProgress(next: Progress) {
  update(() => next);
}

export function subscribeProgress(cb: () => void) {
  return subscribe(cb);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** False during server render and hydration, true once the browser state is readable. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function withToday(days: string[], today: string): string[] {
  return days.includes(today) ? days : [...days, today];
}

export function recordReview(drillId: string, grade: Grade) {
  const today = todayStr();
  update((p) => ({
    ...p,
    cards: { ...p.cards, [drillId]: review(p.cards[drillId] ?? newCard(today), grade, today) },
    activeDays: withToday(p.activeDays, today),
  }));
}

function without<T>(obj: Record<string, T>, key: string): Record<string, T> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));
}

/** Remember where the learner is in a lesson, so they can leave and come back. */
export function saveLessonPosition(lessonId: string, pos: LessonPosition) {
  update((p) => ({ ...p, lessonProgress: { ...p.lessonProgress, [lessonId]: { ...pos, updatedAt: Date.now() } } }));
}

export function markUnitSeen(track: string) {
  update((p) => (p.unitsSeen.includes(track) ? p : { ...p, unitsSeen: [...p.unitsSeen, track] }));
}

export function chooseTea(id: TeaId) {
  update((p) => ({ ...p, tea: { id, at: Date.now() } }));
}

/** Wipe progress on this device (used when someone else takes over the device). */
export function resetProgress() {
  update(() => ({ ...EMPTY }));
}

export function clearLessonPosition(lessonId: string) {
  update((p) => {
    return { ...p, lessonProgress: without(p.lessonProgress, lessonId) };
  });
}

/** `missed` lists the ideas that needed a second try, so practice can bring them back first. */
export function completeLesson(lessonId: string, missed: string[] = []) {
  const today = todayStr();
  update((p) => {
    return {
      ...p,
      lessonsDone: p.lessonsDone.includes(lessonId) ? p.lessonsDone : [...p.lessonsDone, lessonId],
      lessonProgress: without(p.lessonProgress, lessonId),
      struggled: [...new Set([...p.struggled, ...missed])],
      activeDays: withToday(p.activeDays, today),
    };
  });
}

export function toggleRestWeekday(day: number, max: number) {
  update((p) => {
    if (p.restWeekdays.includes(day)) {
      return { ...p, restWeekdays: p.restWeekdays.filter((d) => d !== day) };
    }
    if (p.restWeekdays.length >= max) return p;
    return { ...p, restWeekdays: [...p.restWeekdays, day] };
  });
}
