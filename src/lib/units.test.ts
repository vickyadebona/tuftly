import assert from "node:assert/strict";
import { test } from "node:test";
import { lessonSummary, unitNumber } from "./units.ts";

const order = ["communication", "javascript", "typescript"] as const;

test("units are numbered in the order they appear", () => {
  const all = () => true;
  assert.equal(unitNumber([...order], all, "communication"), 1);
  assert.equal(unitNumber([...order], all, "javascript"), 2);
});

test("a hidden unit leaves no gap in the numbering", () => {
  const noStory = (t: string) => t !== "communication";
  assert.equal(unitNumber([...order], noStory, "javascript"), 1);
  assert.equal(unitNumber([...order], noStory, "communication"), 0);
});

test("the lesson summary counts only the lessons it is given", () => {
  assert.equal(lessonSummary([{ minutes: 6 }]), "1 lesson, about 6 minutes in total.");
  assert.equal(lessonSummary([{ minutes: 6 }, { minutes: 5 }]), "2 lessons, about 11 minutes in total.");
});
