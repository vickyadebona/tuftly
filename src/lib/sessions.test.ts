import assert from "node:assert/strict";
import { test } from "node:test";
import { lessons } from "../content/lessons.ts";
import { SESSION_SIZE, SESSIONS, sessionQuestions } from "./sessions.ts";

test("every named session has questions from reviewed lessons", () => {
  const shipped = lessons.filter((l) => l.reviewed);
  for (const s of SESSIONS) {
    const qs = sessionQuestions(s, shipped);
    assert.ok(qs.length >= 2 && qs.length <= SESSION_SIZE, `${s.id}: ${qs.length} questions`);
    for (const q of qs) assert.ok(q.prompt && q.sayIt && q.rubric.length > 0, `${s.id}: ${q.id} is incomplete`);
    assert.equal(new Set(qs.map((q) => q.id)).size, qs.length);
  }
});

test("a session with several lessons draws on more than one of them", () => {
  const js = sessionQuestions(SESSIONS.find((s) => s.id === "javascript")!, lessons);
  assert.ok(new Set(js.map((q) => q.id.split("/")[0])).size > 1);
});
