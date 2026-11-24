import assert from "node:assert/strict";
import { test } from "node:test";
import { drills } from "./drills.ts";
import { lessons } from "./lessons.ts";
import vm from "node:vm";
import util from "node:util";
import ts from "typescript";
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

// ---------------------------------------------------------------------------------------------
// Full context for the code. Every snippet a learner sees has to make sense on its own: no name
// that is used but never defined, no result that doesn't match what the code really prints.
// ---------------------------------------------------------------------------------------------

const OPTS: ts.CompilerOptions = { noEmit: true, lib: ["lib.es2023.d.ts"], target: ts.ScriptTarget.ES2022, types: [] };
const SNIPPET = "/snippet.ts";
// Globals the lessons use that the core language library doesn't declare.
const PRELUDE = "declare const console: { log(...a: unknown[]): void };\ndeclare function structuredClone<T>(value: T): T;\n";
const libCache = new Map<string, ts.SourceFile | undefined>();
let snippetText = "";
const host = ts.createCompilerHost(OPTS);
const hostGetSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (f, lang, ...rest) => {
  if (f === SNIPPET) return ts.createSourceFile(f, snippetText, lang);
  if (!libCache.has(f)) libCache.set(f, hostGetSourceFile(f, lang, ...rest));
  return libCache.get(f);
};
const hostFileExists = host.fileExists.bind(host);
host.fileExists = (f) => f === SNIPPET || hostFileExists(f);

/** Names a snippet uses without defining, and whether it parses as code at all. */
function undefinedNames(code: string): { names: string[]; parses: boolean } {
  snippetText = PRELUDE + code;
  const program = ts.createProgram([SNIPPET], OPTS, host);
  const sf = program.getSourceFile(SNIPPET)!;
  const parses = program.getSyntacticDiagnostics(sf).length === 0;
  const names = new Set<string>();
  for (const d of program.getSemanticDiagnostics(sf)) {
    if (![2304, 2552, 2663, 2686].includes(d.code)) continue;
    const m = ts.flattenDiagnosticMessageText(d.messageText, "\n").match(/'([^']+)'/);
    if (m && m[1] !== "___") names.add(m[1]);
  }
  return { names: [...names], parses };
}

interface Snippet { where: string; code: string; options: string[]; prompt: string; answerIndex?: number }
function allSnippets(): Snippet[] {
  const out: Snippet[] = [];
  for (const l of lessons) {
    for (const i of l.ideas) {
      out.push({ where: `${i.id} guess`, code: i.guess.code ?? "", options: i.guess.options, prompt: i.guess.question, answerIndex: i.guess.answerIndex });
      out.push({ where: `${i.id} check`, code: i.check.code ?? "", options: i.check.options, prompt: i.check.prompt, answerIndex: i.check.answerIndex });
      i.retries.forEach((r, n) => out.push({ where: `${i.id} retry ${n + 1}`, code: r.code ?? "", options: r.options, prompt: r.prompt, answerIndex: r.answerIndex }));
      if (i.workedExample.code) out.push({ where: `${i.id} example`, code: i.workedExample.code, options: [], prompt: "" });
      if (i.reteach.code) out.push({ where: `${i.id} another look`, code: i.reteach.code, options: [], prompt: "" });
    }
  }
  for (const d of drills) out.push({ where: d.id, code: d.code ?? "", options: d.options, prompt: d.prompt, answerIndex: d.answerIndex });
  return out;
}

test("every snippet and answer choice only uses names that are defined", () => {
  const problems: string[] = [];
  for (const s of allSnippets()) {
    // "You have settings = { ... }" in the question counts as a definition.
    const inline = new Set([...s.prompt.matchAll(/\b([a-z]\w*)\s*=\s*[{\[]/g)].map((m) => m[1]));
    const base = undefinedNames(s.code);
    for (const n of base.names) if (!inline.has(n)) problems.push(`${s.where}: the code uses "${n}" but never defines it`);
    for (const o of s.options) {
      const blank = /___/.test(s.code);
      // A fill-in answer goes into the blank; any other answer is read as an expression after the code.
      const r = undefinedNames(blank ? s.code.replace(/___/g, o) : `${s.code}\n;(${o});`);
      if (!r.parses) continue; // plain English, like "It throws an error"
      for (const n of r.names) if (!base.names.includes(n) && !inline.has(n)) problems.push(`${s.where}: the answer "${o}" uses "${n}", which the code doesn't define`);
    }
  }
  assert.deepEqual(problems, []);
});

function run(code: string): string[] | null {
  const printed: string[] = [];
  const sandbox = { console: { log: (...a: unknown[]) => printed.push(a.map((x) => (typeof x === "string" ? x : util.inspect(x, { depth: 5, breakLength: Infinity, compact: true }))).join(" ")) }, structuredClone };
  try {
    vm.runInNewContext(code, sandbox, { timeout: 1000 });
    return printed;
  } catch {
    return null;
  }
}
const same = (a: string, b: string) => a.replace(/[\s'"]/g, "") === b.replace(/[\s'"]/g, "");

test("results written next to examples are what the code really prints", () => {
  const problems: string[] = [];
  for (const s of allSnippets().filter((x) => /example|another look/.test(x.where))) {
    const lines = s.code.split("\n");
    const logs = lines.map((l, n) => ({ n, m: l.match(/console\.log\((.*)\);\s*\/\/\s*(.*)$/) })).filter((x) => x.m);
    if (!logs.length) continue;
    const printed = run(lines.map((l) => l.replace(/\s*\/\/.*$/, "")).join("\n"));
    if (!printed || printed.length !== logs.length) { problems.push(`${s.where}: the code doesn't run or prints a different number of lines`); continue; }
    logs.forEach((x, k) => {
      const want = x.m![2].replace(/\(.*\)$/, "").trim();
      if (want && !same(printed[k], want)) problems.push(`${s.where}: line ${x.n + 1} says "${want}" but prints "${printed[k]}"`);
    });
  }
  assert.deepEqual(problems, []);
});

test("the marked answer is what the code really prints, and the marked fill-in answer runs", () => {
  const problems: string[] = [];
  for (const s of allSnippets()) {
    if (s.answerIndex === undefined || !s.code) continue;
    const marked = s.options[s.answerIndex];
    if (/___/.test(s.code)) {
      if (run(s.code.replace(/___/g, marked)) === null) problems.push(`${s.where}: with "${marked}" the code throws`);
    } else if (/console\.log/.test(s.code)) {
      const printed = run(s.code);
      if (!printed) problems.push(`${s.where}: the code doesn't run`);
      else if (!same(printed.join(" "), marked)) problems.push(`${s.where}: it prints "${printed.join(" ")}" but the marked answer is "${marked}"`);
    }
  }
  assert.deepEqual(problems, []);
});

// Explanations that name a variable should name one the learner has seen in that idea's code.
const GENERIC = new Set(["arr", "obj", "set"]); // placeholders like [...arr] or { ...obj }
const NOT_VARIABLES = new Set(["Math", "Object", "Array", "JSON", "console", "Map", "Set", "Promise", "String", "Number", "Date", "structuredClone", "Symbol"]);
function variablesNamed(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/\b([a-z][A-Za-z0-9]*)\.(sort|map|filter|forEach|push|has|get|set|delete|size|length|slice|reverse|includes|reduce|find|tags)\b/g)) found.add(m[1]);
  for (const m of text.matchAll(/\[\.\.\.([a-z][A-Za-z0-9]*)\]/g)) found.add(m[1]);
  for (const m of text.matchAll(/\{ \.\.\.([a-z][A-Za-z0-9]*) \}/g)) found.add(m[1]);
  for (const m of text.matchAll(/structuredClone\(([a-z][A-Za-z0-9]*)\)/g)) found.add(m[1]);
  return [...found].filter((v) => !NOT_VARIABLES.has(v) && !GENERIC.has(v));
}
function definedIn(text: string): Set<string> {
  const s = new Set<string>();
  for (const m of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_]\w*)/g)) s.add(m[1]);
  for (const m of text.matchAll(/\(?\b([a-z]\w*)\b(?:\s*,\s*([a-z]\w*))?\)?\s*=>/g)) { s.add(m[1]); if (m[2]) s.add(m[2]); }
  for (const m of text.matchAll(/\b([a-z]\w*)\s*=\s*[{\[]/g)) s.add(m[1]);
  return s;
}

test("explanations only name variables that the idea's code defines", () => {
  const problems: string[] = [];
  for (const l of lessons) {
    for (const i of l.ideas) {
      const known = definedIn([i.guess.code, i.guess.question, i.workedExample.code, i.check.code, i.check.prompt, i.reteach.code, ...i.retries.flatMap((r) => [r.code, r.prompt])].filter(Boolean).join("\n"));
      const prose: [string, string][] = [
        ["the guess answer", i.guess.reveal],
        ...i.workedExample.walkthrough.map((w): [string, string] => ["the walkthrough", w]),
        ["the check explanation", i.check.explanation],
        ...i.retries.map((r): [string, string] => ["a retry explanation", r.explanation]),
        ...i.reteach.steps.map((r): [string, string] => ["the re-teach", r]),
        ["the recap", i.recap],
        ["the model answer", i.explain.modelAnswer],
        ...i.explain.keyPoints.map((k): [string, string] => ["a key point", k]),
      ];
      for (const [field, text] of prose) for (const v of variablesNamed(text)) if (!known.has(v)) problems.push(`${i.id}: ${field} mentions "${v}", which no code in this idea defines`);
    }
  }
  for (const d of drills) {
    const known = definedIn(d.code ?? "");
    for (const [field, text] of [["the hint", d.hint], ["the model answer", d.sayIt], ...d.rubric.map((r): [string, string] => ["a key point", r])] as [string, string][])
      for (const v of variablesNamed(text)) if (!known.has(v)) problems.push(`${d.id}: ${field} mentions "${v}", which the drill's code doesn't define`);
  }
  assert.deepEqual(problems, []);
});
