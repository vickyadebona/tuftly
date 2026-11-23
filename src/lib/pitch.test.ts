import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDraft, estimateSeconds, extractRequirements, wordCount } from "./pitch.ts";

test("pulls bullet lines out of a pasted description and drops headings and boilerplate", () => {
  const text = `About the role:
- 3+ years of experience with React and TypeScript
- Build accessible, well-tested user interfaces
* We are an equal opportunity employer
Requirements:
• Comfortable working with design and product teammates
short`;
  const out = extractRequirements(text);
  assert.deepEqual(out, [
    "3+ years of experience with React and TypeScript",
    "Build accessible, well-tested user interfaces",
    "Comfortable working with design and product teammates",
  ]);
});

test("splits a long paragraph into sentences", () => {
  const text =
    "You will build and maintain our customer dashboard using React, working closely with design. You will also help improve page speed and reliability across the app.";
  const out = extractRequirements(text);
  assert.equal(out.length, 2);
});

test("no description gives no suggestions", () => {
  assert.deepEqual(extractRequirements("   "), []);
});

test("the draft is built from the learner's own words, in present, past, future order", () => {
  const draft = buildDraft({
    role: "Front-end developer",
    who: "a front-end developer with three years of experience in React",
    why: "a team that cares about accessibility",
    picked: ["Build accessible user interfaces"],
    matches: { "Build accessible user interfaces": { did: "Rebuilt our checkout form", result: "Drop-offs fell by 18%" } },
  });
  const [present, past, future] = draft.split("\n\n");
  assert.equal(present, "I'm a front-end developer with three years of experience in React.");
  assert.equal(past, "Most recently, I rebuilt our checkout form, and drop-offs fell by 18%.");
  assert.match(future, /The front-end developer role asks for “Build accessible user interfaces”/);
  assert.match(future, /I'm looking for a team that cares about accessibility\.$/);
});

test("anything left blank shows up as a [bracketed] gap, never a made-up claim", () => {
  const draft = buildDraft({ role: "", who: "", why: "", picked: [], matches: {} });
  assert.match(draft, /\[who you are now/);
  assert.match(draft, /\[what you want next/);
});

test("speaking time is about 150 words a minute", () => {
  const words = Array.from({ length: 150 }, () => "word").join(" ");
  assert.equal(wordCount(words), 150);
  assert.equal(estimateSeconds(words), 60);
});

test("acronyms keep their capitals mid-sentence", () => {
  const draft = buildDraft({ role: "UX engineer", who: "a UX engineer", why: "", picked: ["Design systems"], matches: {} });
  assert.match(draft, /The UX engineer role asks for/);
  assert.match(draft, /I'm a UX engineer\./);
});
