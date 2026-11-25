import assert from "node:assert/strict";
import { test } from "node:test";
import { gapFeedback, MAX_GAP } from "./feedback.ts";

test("nothing typed or picked means nothing to share", () => {
  assert.equal(gapFeedback("d-1", "   ", []), null);
});

test("shares only the question, the words and the picked points", () => {
  assert.deepEqual(gapFeedback("d-1", "  why is it shared? ", ["Changing `y.v` **matters**"]), {
    drill_id: "d-1",
    gap: "why is it shared?",
    points: ["Changing y.v matters"],
  });
});

test("long input is cut to what the table accepts", () => {
  const f = gapFeedback("d-1", "x".repeat(900), Array.from({ length: 14 }, () => "p".repeat(300)))!;
  assert.equal(f.gap.length, MAX_GAP);
  assert.equal(f.points.length, 10);
  assert.ok(f.points.join("").length <= 1500);
});
