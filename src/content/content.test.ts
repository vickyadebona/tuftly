import assert from "node:assert/strict";
import { test } from "node:test";
import { drills } from "./drills.ts";
import { lessons } from "./lessons.ts";
import vm from "node:vm";
import util from "node:util";
import ts from "typescript";
import { FIRST_LESSON_MINUTES } from "../lib/config.ts";
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

const OPTS: ts.CompilerOptions = { noEmit: true, lib: ["lib.es2022.d.ts"], target: ts.ScriptTarget.ES2022, types: [] };
const SNIPPET = "/snippet.ts";
// Globals the lessons use that the core language library doesn't declare.
const PRELUDE = "declare const console: { log(...a: unknown[]): void };\ndeclare function structuredClone<T>(value: T): T;\n";

// TypeScript diagnostics that mean "this name was never defined".
const CANNOT_FIND_NAME = 2304;
const DID_YOU_MEAN = 2552; // "Cannot find name 'x'. Did you mean 'y'?"
const CANNOT_FIND_NAME_IN_THIS_SCOPE_CLASS = 2663;
const CANNOT_FIND_NAME_IN_ES_VERSION = 2686;
const UNDEFINED_NAME_CODES = [CANNOT_FIND_NAME, DID_YOU_MEAN, CANNOT_FIND_NAME_IN_THIS_SCOPE_CLASS, CANNOT_FIND_NAME_IN_ES_VERSION];

// Reading TypeScript's own library files is the slow part, so keep them between snippets.
const libCache = new Map<string, ts.SourceFile | undefined>();

function hostFor(text: string): ts.CompilerHost {
  const host = ts.createCompilerHost(OPTS);
  const getSourceFile = host.getSourceFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  host.getSourceFile = (file, lang, ...rest) => {
    if (file === SNIPPET) return ts.createSourceFile(file, text, lang);
    if (!libCache.has(file)) libCache.set(file, getSourceFile(file, lang, ...rest));
    return libCache.get(file);
  };
  host.fileExists = (file) => file === SNIPPET || fileExists(file);
  return host;
}

/** Names a snippet uses without defining, and whether it parses as code at all. */
function undefinedNames(code: string): { names: string[]; parses: boolean } {
  const program = ts.createProgram([SNIPPET], OPTS, hostFor(PRELUDE + code));
  const sourceFile = program.getSourceFile(SNIPPET)!;
  const parses = program.getSyntacticDiagnostics(sourceFile).length === 0;
  const names = new Set<string>();
  for (const d of program.getSemanticDiagnostics(sourceFile)) {
    if (!UNDEFINED_NAME_CODES.includes(d.code)) continue;
    const quoted = ts.flattenDiagnosticMessageText(d.messageText, "\n").match(/'([^']+)'/);
    if (quoted && quoted[1] !== "___") names.add(quoted[1]);
  }
  return { names: [...names], parses };
}

interface Snippet { where: string; code: string; options: string[]; prompt: string; answerIndex?: number }

function questionSnippet(where: string, q: { code?: string; options: string[]; answerIndex: number }, prompt: string): Snippet {
  return { where, code: q.code ?? "", options: q.options, prompt, answerIndex: q.answerIndex };
}

function allSnippets(): Snippet[] {
  const out: Snippet[] = [];
  for (const lesson of lessons) {
    for (const idea of lesson.ideas) {
      out.push(questionSnippet(`${idea.id} guess`, idea.guess, idea.guess.question));
      out.push(questionSnippet(`${idea.id} check`, idea.check, idea.check.prompt));
      idea.retries.forEach((r, n) => out.push(questionSnippet(`${idea.id} retry ${n + 1}`, r, r.prompt)));
      if (idea.workedExample.code) out.push({ where: `${idea.id} example`, code: idea.workedExample.code, options: [], prompt: "" });
      if (idea.reteach.code) out.push({ where: `${idea.id} another look`, code: idea.reteach.code, options: [], prompt: "" });
    }
  }
  for (const d of drills) out.push(questionSnippet(d.id, d as { code?: string; options: string[]; answerIndex: number }, d.prompt));
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

function show(value: unknown): string {
  return typeof value === "string" ? value : util.inspect(value, { depth: 5, breakLength: Infinity, compact: true });
}

/** Runs a snippet and returns each console.log line, or null if it throws. */
function run(code: string): string[] | null {
  const printed: string[] = [];
  const sandbox = { console: { log: (...args: unknown[]) => printed.push(args.map(show).join(" ")) }, structuredClone };
  try {
    vm.runInNewContext(code, sandbox, { timeout: 1000 });
    return printed;
  } catch {
    return null;
  }
}

/** Removes a trailing `// comment`, ignoring any `//` that sits inside a string. */
function withoutComment(line: string): string {
  let quote = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = "";
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "/" && line[i + 1] === "/") return line.slice(0, i).trimEnd();
  }
  return line;
}

/**
 * One spelling for the same value: double quotes become single, and spaces next to brackets, commas
 * and colons don't matter. Spaces inside a word still do, so "a b" never matches "ab".
 */
function canon(text: string): string {
  return text.replace(/"/g, "'").replace(/\s+/g, " ").replace(/\s*([[\]{}(),:])\s*/g, "$1").trim();
}

/**
 * Does what the lesson says match what the code printed? console.log shows the string "5" and the
 * number 5 the same way, so a bare string line can also be written with its quotes.
 */
function sameOutput(printed: string, written: string): boolean {
  return canon(printed) === canon(written) || canon(`'${printed}'`) === canon(written);
}

// A note after the result, like "[1, 2, 3] (the original)", isn't part of the output.
const trailingNote = /\s+\([A-Za-z][^()]*\)$/;
const loggedWithResult = /console\.log\((.*)\);\s*\/\/\s*(.*)$/;

test("results written next to examples are what the code really prints", () => {
  const problems: string[] = [];
  for (const s of allSnippets().filter((x) => /example|another look/.test(x.where))) {
    const lines = s.code.split("\n");
    const logs = lines.map((line, n) => ({ n, match: line.match(loggedWithResult) })).filter((x) => x.match);
    if (!logs.length) continue;
    const printed = run(lines.map(withoutComment).join("\n"));
    if (!printed || printed.length !== logs.length) {
      problems.push(`${s.where}: the code doesn't run or prints a different number of lines`);
      continue;
    }
    logs.forEach((log, k) => {
      const written = log.match![2].replace(trailingNote, "").trim();
      if (written && !sameOutput(printed[k], written)) {
        problems.push(`${s.where}: line ${log.n + 1} says "${written}" but prints "${printed[k]}"`);
      }
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
      else if (!sameOutput(printed.join(" "), marked)) {
        problems.push(`${s.where}: it prints "${printed.join(" ")}" but the marked answer is "${marked}"`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test("the first lesson takes as long as the landing and About pages say", () => {
  // The first reviewed lesson in app order is the one a new learner starts with in production.
  const first = lessons.find((l) => l.reviewed);
  assert.equal(first?.minutes, FIRST_LESSON_MINUTES);
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
  // Arrow function parameters: `x =>`, `(a, b, c) =>`, `({ name, tags }) =>`, `([k, v]) =>`.
  for (const m of text.matchAll(/(?:\(([^()]*)\)|\b([a-z]\w*))\s*=>/g)) {
    for (const name of (m[1] ?? m[2]).matchAll(/[A-Za-z_]\w*/g)) s.add(name[0]);
  }
  for (const m of text.matchAll(/\b([a-z]\w*)\s*=\s*[{\[]/g)) s.add(m[1]);
  return s;
}

test("explanations only name variables that the idea's code defines", () => {
  const problems: string[] = [];
  for (const l of lessons) {
    for (const i of l.ideas) {
      const ideaText = [
        i.guess.code, i.guess.question, i.workedExample.code, i.check.code, i.check.prompt, i.reteach.code,
        ...i.retries.flatMap((r) => [r.code, r.prompt]),
      ];
      const known = definedIn(ideaText.filter(Boolean).join("\n"));
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
      for (const [field, text] of prose) {
        for (const v of variablesNamed(text)) {
          if (!known.has(v)) problems.push(`${i.id}: ${field} mentions "${v}", which no code in this idea defines`);
        }
      }
    }
  }
  for (const d of drills) {
    const known = definedIn(d.code ?? "");
    const prose: [string, string][] = [
      ["the hint", d.hint],
      ["the model answer", d.sayIt],
      ...d.rubric.map((r): [string, string] => ["a key point", r]),
    ];
    for (const [field, text] of prose) {
      for (const v of variablesNamed(text)) {
        if (!known.has(v)) problems.push(`${d.id}: ${field} mentions "${v}", which the drill's code doesn't define`);
      }
    }
  }
  assert.deepEqual(problems, []);
});
