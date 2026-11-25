import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeSettings, streakSummary, withSettings, type StreakInput } from "./streak.ts";

// November 1, 2026 is a Sunday.
const d = (n: number) => `2026-11-${String(n).padStart(2, "0")}`;
const input = (days: number[], more: Partial<StreakInput> = {}): StreakInput => ({
  activeDays: days.map(d),
  restWeekdays: [],
  ...more,
});

test("today not yet done does not break the streak", () => {
  const s = streakSummary(input([7, 8, 9]), d(10));
  assert.equal(s.current, 3);
  assert.equal(s.statusOf(d(10)), "today");
});

test("one missed day a week is covered, a second one ends the streak", () => {
  const one = streakSummary(input([2, 3, 5]), d(5));
  assert.equal(one.current, 3);
  assert.equal(one.statusOf(d(4)), "covered");
  assert.equal(one.graceUsed, d(4));

  const two = streakSummary(input([2, 4, 6]), d(6));
  assert.equal(two.statusOf(d(3)), "covered");
  assert.equal(two.statusOf(d(5)), "missed");
  assert.equal(two.current, 1);
  assert.equal(two.longest, 2);
});

test("practicing every other day does not last", () => {
  const s = streakSummary(input([2, 4, 6, 8, 10, 12]), d(12));
  assert.ok(s.longest <= 3);
});

test("the grace day comes back on the chosen first day of the week", () => {
  // Missed Friday the 6th and Sunday the 8th: separate weeks from Sunday, the same week from Monday.
  const days = [4, 5, 7, 9];
  assert.equal(streakSummary(input(days), d(9)).current, 4);
  const monday = { from: d(1), at: 1, rest: [], weekStart: 1 as const };
  const s = streakSummary(input(days, { streakSettings: [monday] }), d(9));
  assert.equal(s.statusOf(d(8)), "missed");
  assert.equal(s.current, 1);
});

test("rest days are skipped without using the grace day", () => {
  const s = streakSummary(input([6, 9, 10], { restWeekdays: [0, 6] }), d(10));
  assert.equal(s.current, 3);
  assert.equal(s.graceUsed, null);
  assert.equal(s.statusOf(d(7)), "rest");
});

test("practice on a rest day still counts", () => {
  assert.equal(streakSummary(input([6, 7], { restWeekdays: [6] }), d(7)).current, 2);
});

test("changing rest days does not rewrite the past", () => {
  const before = input([5, 6, 9], { restWeekdays: [0, 6] });
  const streakSettings = withSettings(before, d(9), { rest: [] }, 1);
  assert.equal(streakSummary({ ...before, streakSettings }, d(9)).current, 3);
});

test("a second change on the same day replaces the first", () => {
  const first = withSettings(input([]), d(9), { rest: [1] }, 1);
  const second = withSettings(input([], { streakSettings: first }), d(9), { weekStart: 1 }, 2);
  assert.deepEqual(second, [{ from: d(9), at: 2, rest: [1], weekStart: 1 }]);
});

test("a rest day removed later stays removed after merging devices", () => {
  const old = [{ from: d(1), at: 1, rest: [3], weekStart: 0 as const }];
  const removed = [...old, { from: d(5), at: 2, rest: [], weekStart: 0 as const }];
  assert.deepEqual(mergeSettings(old, removed), removed);
  assert.deepEqual(mergeSettings(removed, old), removed);
});

test("the covered message lasts until the next practice", () => {
  assert.equal(streakSummary(input([2, 3]), d(5)).justCovered, true);
  assert.equal(streakSummary(input([2, 3, 5]), d(5)).justCovered, false);
});

test("a long break leaves the longest streak and no current one", () => {
  const s = streakSummary(input([2, 3, 4]), d(20));
  assert.equal(s.current, 0);
  assert.equal(s.longest, 3);
});

test("nothing practiced yet", () => {
  const s = streakSummary(input([]), d(10));
  assert.equal(s.current, 0);
  assert.equal(s.longest, 0);
  assert.equal(s.statusOf(d(9)), "before");
});
