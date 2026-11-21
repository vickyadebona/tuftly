import assert from "node:assert/strict";
import { test } from "node:test";
import { afterExample, afterExplain, afterGuess, afterReteach, afterRight, afterWrong, canRetry, isRecap, questionFor, START } from "./lessonFlow.ts";
import type { LessonIdea, Question } from "./types.ts";

const q = (n: number): Question => ({ prompt: `q${n}`, options: ["a", "b"], answerIndex: 0, explanation: "" });
const idea = (id: string, retries = 2): LessonIdea => ({
  id,
  title: id,
  guess: { question: "", options: [], answerIndex: 0, reveal: "" },
  workedExample: { code: "", walkthrough: [] },
  explain: { question: "", starter: "", modelAnswer: "", keyPoints: [] },
  check: q(0),
  reteach: { steps: [] },
  retries: Array.from({ length: retries }, (_, i) => q(i + 1)),
  recap: "",
});

test("an idea runs guess, example, check in order", () => {
  const ex = afterGuess(START);
  assert.equal(ex.stage, "example");
  assert.equal(afterExample(ex).stage, "check");
});

test("a right answer moves to saying it in words, then on to the next idea", () => {
  const p = afterRight({ ...START, stage: "check" });
  assert.deepEqual(p, { idea: 0, stage: "explain", attempt: 0, missed: [] });
  assert.deepEqual(afterExplain(p), { idea: 1, stage: "guess", attempt: 0, missed: [] });
});

test("a wrong answer stays on the same idea: re-teach, then a fresh question", () => {
  const a = idea("sort");
  const p = afterWrong({ ...START, stage: "check" }, a);
  assert.equal(p.idea, 0);
  assert.equal(p.stage, "reteach");
  assert.equal(p.attempt, 1);
  assert.deepEqual(p.missed, ["sort"]);
  const again = afterReteach(p);
  assert.equal(again.stage, "check");
  assert.equal(questionFor(a, again.attempt).prompt, "q1");
});

test("the original question is asked first, then fresh ones in order", () => {
  const a = idea("sort");
  assert.equal(questionFor(a, 0).prompt, "q0");
  assert.equal(questionFor(a, 1).prompt, "q1");
  assert.equal(questionFor(a, 2).prompt, "q2");
});

test("after the fresh questions run out, it goes to saying it in words and remembers the miss", () => {
  const a = idea("sort", 1);
  let p = afterWrong({ ...START, stage: "check" }, a); // attempt 1
  p = afterReteach(p);
  assert.equal(canRetry(a, p.attempt), false);
  p = afterWrong(p, a);
  assert.equal(p.idea, 0);
  assert.equal(p.stage, "explain");
  assert.equal(p.attempt, 0);
  assert.deepEqual(p.missed, ["sort"]);
  assert.equal(afterExplain(p).idea, 1);
});

test("getting it right on a retry moves on and keeps the idea flagged", () => {
  const a = idea("sort");
  const wrong = afterReteach(afterWrong({ ...START, stage: "check" }, a));
  const next = afterExplain(afterRight(wrong));
  assert.equal(next.idea, 1);
  assert.deepEqual(next.missed, ["sort"]);
});

test("recap starts once every idea is done", () => {
  assert.equal(isRecap({ ...START, idea: 2 }, 3), false);
  assert.equal(isRecap({ ...START, idea: 3 }, 3), true);
});
