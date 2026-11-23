import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeProgress } from "./merge.ts";
import type { Progress } from "./store.ts";

const card = (box: number, lastReviewed: string, reps: number) => ({ box, due: lastReviewed, reps, lapses: 0, lastReviewed });
const empty: Progress = { cards: {}, activeDays: [], lessonsDone: [], restWeekdays: [], lessonProgress: {}, struggled: [], unitsSeen: [] };

test("keeps everything from both sides", () => {
  const local: Progress = { ...empty, lessonsDone: ["a"], activeDays: ["2026-11-02"] };
  const remote: Progress = { ...empty, lessonsDone: ["b", "a"], activeDays: ["2026-11-01"] };
  const m = mergeProgress(local, remote);
  assert.deepEqual(m.lessonsDone.sort(), ["a", "b"]);
  assert.deepEqual(m.activeDays, ["2026-11-01", "2026-11-02"]);
});

test("a drill keeps the most recently reviewed copy", () => {
  const local: Progress = { ...empty, cards: { d1: card(3, "2026-11-10", 4) } };
  const remote: Progress = { ...empty, cards: { d1: card(1, "2026-11-05", 2), d2: card(0, "2026-11-01", 1) } };
  const m = mergeProgress(local, remote);
  assert.equal(m.cards.d1.box, 3);
  assert.ok(m.cards.d2);
});

test("same review day: the copy with more reps wins", () => {
  const local: Progress = { ...empty, cards: { d1: card(1, "2026-11-10", 2) } };
  const remote: Progress = { ...empty, cards: { d1: card(2, "2026-11-10", 5) } };
  assert.equal(mergeProgress(local, remote).cards.d1.reps, 5);
});

test("rest days never exceed the weekly limit", () => {
  const m = mergeProgress({ ...empty, restWeekdays: [0, 6] }, { ...empty, restWeekdays: [1, 2] });
  assert.equal(m.restWeekdays.length, 2);
  assert.deepEqual(m.restWeekdays, [0, 6]);
});

test("merging with an empty side changes nothing", () => {
  const local: Progress = { ...empty, lessonsDone: ["a"], cards: { d1: card(2, "2026-11-10", 3) } };
  assert.deepEqual(mergeProgress(local, empty), { ...local, activeDays: [] });
});

const pos = (idea: number, updatedAt: number) => ({ idea, stage: "guess" as const, attempt: 0, missed: [], updatedAt });

test("a lesson in progress keeps the copy touched most recently", () => {
  const m = mergeProgress(
    { ...empty, lessonProgress: { l1: pos(1, 100) } },
    { ...empty, lessonProgress: { l1: pos(2, 200), l2: pos(0, 50) } },
  );
  assert.equal(m.lessonProgress.l1.idea, 2);
  assert.ok(m.lessonProgress.l2);
});

test("a lesson finished on either side is no longer in progress", () => {
  const m = mergeProgress(
    { ...empty, lessonsDone: ["l1"] },
    { ...empty, lessonProgress: { l1: pos(1, 100) } },
  );
  assert.deepEqual(m.lessonProgress, {});
});

test("struggled ideas from both sides are kept", () => {
  const m = mergeProgress({ ...empty, struggled: ["a"] }, { ...empty, struggled: ["b", "a"] });
  assert.deepEqual(m.struggled.sort(), ["a", "b"]);
});

test("units seen on either side stay seen", () => {
  const m = mergeProgress({ ...empty, unitsSeen: ["javascript"] }, { ...empty, unitsSeen: ["communication", "javascript"] });
  assert.deepEqual(m.unitsSeen.sort(), ["communication", "javascript"]);
});
