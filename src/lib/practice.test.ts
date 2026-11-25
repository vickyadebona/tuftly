import assert from "node:assert/strict";
import { test } from "node:test";
import { drills } from "../content/drills.ts";
import { lessons } from "../content/lessons.ts";
import { matchScore, nextCard, practicePool, type PracticeCard } from "./practice.ts";

test("more practice stays on the same idea, starting with the drill itself", () => {
  for (const d of drills.filter((x) => x.ideaId)) {
    const pool = practicePool(d, drills, lessons);
    assert.equal(pool[0].id, d.id);
    assert.ok(pool.length >= 4, `${d.id}: only ${pool.length} questions on its idea`);
    for (const card of pool) {
      const sameIdea = card.id.startsWith(`${d.ideaId}-q`) || drills.find((x) => x.id === card.id)?.ideaId === d.ideaId;
      assert.ok(sameIdea, `${d.id}: ${card.id} is from another idea`);
    }
  }
});

const card = (id: string, prompt: string): PracticeCard => ({ id, prompt, options: ["yes", "no"], answerIndex: 0, rubric: [] });
const pool = [card("a", "Who works out the price?"), card("b", "Should the server check the quantity?"), card("c", "Why share a validation schema?")];

test("it picks the question that matches what the learner is stuck on", () => {
  assert.equal(nextCard(pool, ["a"], "I don't get the schema part").id, "c");
  assert.equal(nextCard(pool, ["a"], "checking quantities").id, "b");
});

test("with nothing to match, it goes through the questions in order", () => {
  assert.equal(nextCard(pool, ["a"]).id, "b");
  assert.equal(nextCard(pool, ["a", "b"], "something unrelated").id, "c");
});

test("it keeps going for as long as the learner wants, without repeating the last question", () => {
  const seen = ["a"];
  for (let i = 0; i < 12; i++) {
    const next = nextCard(pool, seen, i % 2 ? "schema" : "");
    assert.notEqual(next.id, seen[seen.length - 1]);
    seen.push(next.id);
  }
});

test("filler words don't count as a match", () => {
  assert.equal(matchScore(pool[0], "I am still really confused about this"), 0);
});

test("a drill without an idea repeats on its own", () => {
  const loose = { ...drills[0], ideaId: undefined };
  assert.deepEqual(practicePool(loose, drills, lessons), [loose]);
});
