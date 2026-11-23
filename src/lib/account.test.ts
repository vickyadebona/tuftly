import assert from "node:assert/strict";
import { test } from "node:test";
import { looksReturning } from "./account.ts";

test("no saved progress means a new person", () => {
  assert.equal(looksReturning(null), false);
  assert.equal(looksReturning("{}"), false);
  assert.equal(looksReturning('{"cards":{},"activeDays":[],"lessonsDone":[]}'), false);
});

test("any lesson, active day or practice card means a returning person", () => {
  assert.equal(looksReturning('{"lessonsDone":["a"]}'), true);
  assert.equal(looksReturning('{"activeDays":["2026-11-02"]}'), true);
  assert.equal(looksReturning('{"cards":{"d1":{}}}'), true);
});

test("unreadable data is treated as new, not as a crash", () => {
  assert.equal(looksReturning("not json"), false);
});
