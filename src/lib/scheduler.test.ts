import test from "node:test";
import assert from "node:assert/strict";
import { INTERVAL_DAYS, isDue, newCard, review } from "./scheduler.ts";
import { computeStreak } from "./streak.ts";
import { addDays } from "./dates.ts";

const T = "2026-03-10";

test("got it moves up a box and spaces the next review further out", () => {
  let c = newCard(T);
  c = review(c, "got", T);
  assert.equal(c.box, 1);
  assert.equal(c.due, addDays(T, INTERVAL_DAYS[1]));
  c = review(c, "got", c.due);
  assert.equal(c.box, 2);
});

test("not yet resets to box 0 and counts a lapse, due tomorrow", () => {
  let c = review(review(newCard(T), "got", T), "got", T);
  c = review(c, "not-yet", T);
  assert.equal(c.box, 0);
  assert.equal(c.lapses, 1);
  assert.equal(c.due, addDays(T, 1));
});

test("almost never drops below box 1 and never rises", () => {
  assert.equal(review(newCard(T), "almost", T).box, 1);
  const c3 = { ...newCard(T), box: 3 };
  assert.equal(review(c3, "almost", T).box, 3);
});

test("isDue is inclusive of the due date", () => {
  const c = review(newCard(T), "got", T);
  assert.equal(isDue(c, T), false);
  assert.equal(isDue(c, c.due), true);
});

test("box never exceeds the last interval", () => {
  let c = { ...newCard(T), box: INTERVAL_DAYS.length - 1 };
  c = review(c, "got", T);
  assert.equal(c.box, INTERVAL_DAYS.length - 1);
});

test("streak: today not yet done does not break it", () => {
  const days = ["2026-03-09", "2026-03-08", "2026-03-07"];
  assert.equal(computeStreak(days, T, 1, []), 3);
});

test("streak: one missed day is forgiven, two are not", () => {
  assert.equal(computeStreak(["2026-03-10", "2026-03-08", "2026-03-07"], T, 1, []), 3);
  assert.equal(computeStreak(["2026-03-10", "2026-03-07", "2026-03-06"], T, 1, []), 1);
});

test("streak: rest weekdays are skipped without penalty", () => {
  // 2026-03-08 is a Sunday (0); mark Sunday + Saturday (6) as rest days.
  const days = ["2026-03-10", "2026-03-09", "2026-03-06"];
  assert.equal(computeStreak(days, T, 0, [0, 6]), 3);
});
