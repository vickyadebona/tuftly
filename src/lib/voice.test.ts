import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import {
  INTRO,
  interviewsLeft,
  lengthNote,
  reassurance,
  spokenLength,
  STORY_QUESTIONS,
  summarize,
  transcriptText,
  VOICE_SECONDS,
  type Turn,
} from "./voice.ts";

const turn = (more: Partial<Turn> = {}): Turn => ({
  questionId: "story/about",
  kind: "question",
  question: "Tell me about yourself.",
  answer: "I build React apps.",
  seconds: 40,
  edited: false,
  typed: false,
  notSure: false,
  skipped: false,
  covered: [true, false, false, false],
  ...more,
});

test("an interview is seven minutes of speaking", () => {
  assert.equal(VOICE_SECONDS, 420);
});

test("every question has a follow-up, key points and a way to start", () => {
  assert.equal(STORY_QUESTIONS.length, 6);
  STORY_QUESTIONS.forEach((q, i) => {
    assert.equal(q.kind, i % 2 ? "followup" : "question");
    assert.ok(q.rubric.length >= 2 && q.hints.length >= 2, q.id);
  });
  assert.equal(new Set(STORY_QUESTIONS.map((q) => q.id)).size, 6);
});

test("the daily limit never goes below zero", () => {
  assert.equal(interviewsLeft(0, 2), 2);
  assert.equal(interviewsLeft(3, 2), 0);
});

test("tea is offered for readiness 1 to 3 only", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => reassurance(n).offerTea), [true, true, true, false, false]);
});

test("length notes follow the kind of question, and typed answers get none", () => {
  assert.match(lengthNote(turn({ seconds: 12 }))!, /Aim for about 30 to 60/);
  assert.match(lengthNote(turn({ seconds: 45 }))!, /good length/);
  assert.match(lengthNote(turn({ seconds: 90 }))!, /trimming/);
  assert.equal(lengthNote(turn({ kind: "followup", seconds: 12 })), "Length: 12 seconds.");
  assert.equal(lengthNote(turn({ typed: true })), null);
});

test("the summary uses only your own checks and ignores skipped questions", () => {
  const s = summarize([turn(), turn({ questionId: "story/fit", skipped: true, covered: [] })]);
  assert.deepEqual(s.covered, ["Starts with who you are now"]);
  assert.equal(s.next.length, 3);
  assert.ok(!s.next.includes("Names two or three things the role asks for"));
});

test("the download holds both sides of the conversation and how each answer was given", () => {
  const text = transcriptText({
    id: "1",
    owner: "device",
    at: Date.UTC(2026, 10, 25, 18),
    mode: "coach",
    readyBefore: 2,
    turns: [turn({ edited: true, notSure: true })],
  });
  assert.match(text, /Bobbin \(question\): Tell me about yourself\./);
  assert.match(text, /You \(Marked “I'm not sure”, then answered · 40 sec · Edited by you\): I build React apps\./);
  assert.match(text, /November 25, 2026/);
});

test("every line Bobbin says has an up-to-date recording", () => {
  const folder = new URL("../../public/voice/", import.meta.url);
  const recorded = JSON.parse(readFileSync(new URL("lines.json", folder), "utf8")).lines;
  const spoken = [[INTRO.id, INTRO.text], ...STORY_QUESTIONS.map((q) => [q.id, q.prompt])];
  // Changed a line? Record it again with scripts/add-voice.mjs.
  assert.deepEqual(recorded, Object.fromEntries(spoken));
  for (const [id] of spoken) assert.ok(existsSync(new URL(`${id}.m4a`, folder)), id);
});

test("spoken words appear one at a time, from the first to the whole line", () => {
  const line = "Hi! Tell me about yourself.";
  assert.equal(line.slice(0, spokenLength(line, 0)), "Hi! ");
  assert.equal(spokenLength(line, 1), line.length);
  // Still on "Hi!" during the pause after it.
  assert.equal(line.slice(0, spokenLength(line, 0.2)), "Hi! ");
  let last = 0;
  for (let f = 0; f <= 1; f += 0.05) {
    const shown = spokenLength(line, f);
    assert.ok(shown >= last);
    assert.ok(shown === line.length || line[shown - 1] === " ", "whole words only");
    last = shown;
  }
});
