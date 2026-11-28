// Puts a new set of recordings of Bobbin's lines into the app. The current ones are Amazon Polly's
// "Justin" (Standard engine, English US), downloaded one line at a time from the Polly console.
//
// Run again after changing INTRO or a question in src/lib/voice.ts (the tests fail while a recording
// is out of date), or to try another voice. Needs macOS (for afconvert) and Node 22. Give one file
// per line: the intro first, then each question in the order of STORY_QUESTIONS.
//
//   node --experimental-strip-types scripts/add-voice.mjs "<voice name>" intro.mp3 about.mp3 ...

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { INTRO, STORY_QUESTIONS } from "../src/lib/voice.ts";

const [voice, ...files] = process.argv.slice(2);
const lines = [[INTRO.id, INTRO.text], ...STORY_QUESTIONS.map((q) => [q.id, q.prompt])];
if (!voice || files.length !== lines.length) {
  console.error(`Give a voice name and ${lines.length} files, in this order:`);
  for (const [id, text] of lines) console.error(`  ${id}: ${text}`);
  process.exit(1);
}

const out = new URL("../public/voice/", import.meta.url).pathname;
lines.forEach(([id], i) => {
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", files[i], `${out}${id}.m4a`]);
});

// What each recording says, so the tests can tell when one is out of date.
writeFileSync(`${out}lines.json`, JSON.stringify({ voice, lines: Object.fromEntries(lines) }, null, 2) + "\n");
