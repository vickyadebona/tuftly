import { test } from "node:test";
import assert from "node:assert/strict";
import { correctLine, wrongLine } from "./phrases.ts";

test("correct answers rotate through three lines", () => {
  assert.deepEqual([0, 1, 2, 3].map(correctLine), ["Tweet success!", "Peep peep, you got it!", "You're flying!", "Tweet success!"]);
});

test("wrong answers take turns, and only offer another try when there is one", () => {
  assert.equal(wrongLine(0), "No ruffled feathers.");
  assert.equal(wrongLine(0, true), "No ruffled feathers. Try again.");
  assert.equal(wrongLine(1, true), "Even early birds get stumped.");
});
