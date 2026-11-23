import assert from "node:assert/strict";
import { test } from "node:test";
import { drills } from "./drills.ts";
import { lessons } from "./lessons.ts";
import type { Question } from "../lib/types.ts";

// Guards against the content mistakes that are easy to make and easy to miss in a read-through:
// a wrong answerIndex, a duplicated option, an idea with no drill, a drill pointing nowhere.

function checkQuestion(where: string, q: { options: string[]; answerIndex: number }) {
  assert.ok(q.options.length >= 2, `${where}: needs at least two options`);
  assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.options.length, `${where}: answerIndex out of range`);
  assert.equal(new Set(q.options).size, q.options.length, `${where}: duplicate options`);
  for (const o of q.options) assert.ok(o.trim().length > 0, `${where}: empty option`);
}

const allQuestions = (): { where: string; q: Question | { options: string[]; answerIndex: number } }[] =>
  lessons.flatMap((l) =>
    l.ideas.flatMap((i) => [
      { where: `${i.id} guess`, q: i.guess },
      { where: `${i.id} check`, q: i.check },
      ...i.retries.map((r, n) => ({ where: `${i.id} retry ${n + 1}`, q: r })),
    ]),
  );

test("every question has a valid answer and distinct options", () => {
  for (const { where, q } of allQuestions()) checkQuestion(where, q);
});

test("every idea has all of its parts", () => {
  for (const l of lessons) {
    assert.ok(l.intro.summary && l.intro.outcomes.length >= 2, `${l.id}: intro`);
    assert.ok(l.ideas.length >= 2, `${l.id}: needs ideas`);
    for (const i of l.ideas) {
      assert.ok(i.retries.length >= 2, `${i.id}: needs two fresh questions`);
      assert.ok(i.reteach.steps.length >= 2, `${i.id}: reteach steps`);
      assert.ok(i.workedExample.walkthrough.length >= 2, `${i.id}: walkthrough`);
      assert.ok(i.workedExample.code || i.workedExample.sample, `${i.id}: example needs code or a sample`);
      assert.ok(i.explain.question && i.explain.starter && i.explain.modelAnswer, `${i.id}: say-it step`);
      assert.ok(i.explain.keyPoints.length >= 3, `${i.id}: key points`);
      assert.ok(i.recap.trim(), `${i.id}: recap`);
    }
  }
});

test("spoken model answers are a few sentences, not a paragraph or a single line", () => {
  for (const l of lessons) {
    for (const i of l.ideas) {
      const words = i.explain.modelAnswer.trim().split(/\s+/).length;
      assert.ok(words >= 25 && words <= 120, `${i.id}: model answer is ${words} words`);
    }
  }
  for (const d of drills) {
    const words = d.sayIt.trim().split(/\s+/).length;
    assert.ok(words >= 12 && words <= 100, `${d.id}: sayIt is ${words} words`);
  }
});

test("ids are unique", () => {
  const ids = [...lessons.map((l) => l.id), ...lessons.flatMap((l) => l.ideas.map((i) => i.id)), ...drills.map((d) => d.id)];
  assert.equal(new Set(ids).size, ids.length);
});

test("every drill belongs to a real lesson and idea, and is well formed", () => {
  for (const d of drills) {
    const lesson = lessons.find((l) => l.id === d.lessonId);
    assert.ok(lesson, `${d.id}: unknown lesson ${d.lessonId}`);
    if (d.ideaId) assert.ok(lesson.ideas.some((i) => i.id === d.ideaId), `${d.id}: idea ${d.ideaId} is not in ${d.lessonId}`);
    checkQuestion(d.id, d);
    assert.ok(d.rubric.length >= 2 && d.hint && d.sayIt, `${d.id}: rubric, hint and sayIt`);
  }
});

test("every lesson idea has at least one drill, so nothing taught goes unpracticed", () => {
  for (const l of lessons) {
    for (const i of l.ideas) {
      assert.ok(drills.some((d) => d.ideaId === i.id), `${i.id}: no drill`);
    }
  }
});

test("the pitch lesson's length advice matches its example", () => {
  const pitch = lessons.find((l) => l.id === "pitch-basics")!;
  const words = pitch.ideas[0].explain.modelAnswer.trim().split(/\s+/).length;
  // The lesson says roughly 70 to 150 words (30 to 60 seconds). The model answer shouldn't be below that.
  assert.ok(words >= 70, `model pitch is only ${words} words`);
});
