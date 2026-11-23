import assert from "node:assert/strict";
import { test } from "node:test";
import { unitNumber } from "./units.ts";

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
