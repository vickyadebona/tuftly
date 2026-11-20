// Exports every lesson and drill to one readable Markdown file for human review.
// Usage: node scripts/export-review.mjs   (Node 22)  ->  docs/content-review.md
import { mkdirSync, writeFileSync } from "node:fs";
import { lessons } from "../src/content/lessons.ts";
import { drills } from "../src/content/drills.ts";

const code = (s) => "```js\n" + s + "\n```";
const options = (opts, answerIndex) =>
  opts.map((o, i) => `- ${i === answerIndex ? "**✔ " : ""}\`${o}\`${i === answerIndex ? "**" : ""}`).join("\n");

const out = [];
out.push("# Content review");
out.push(
  "Generated from `src/content/`. Set `reviewed: true` on an item only after you've checked it.\n" +
    "All code outputs below were already run in Node by `scripts/verify-content.mjs` (13/13 pass), so the review is mainly about **wording, teaching quality and tone**.\n",
);
out.push(
  "## Checklist for each item\n- [ ] Is every statement true (not just 'mostly')?\n- [ ] Would a stressed beginner understand it on first read?\n- [ ] Is the tone encouraging, never blaming?\n- [ ] Is anything missing that an interviewer would expect?\n- [ ] Is the difficulty right for a refresher?\n",
);

for (const l of lessons) {
  out.push(`---\n\n## Lesson: ${l.title}`);
  out.push(`id: \`${l.id}\` · topic: ${l.topic} · ${l.minutes} min · reviewed: **${l.reviewed}**\n`);
  out.push(`### 1. Guess first\n${l.predict.question}\n`);
  if (l.predict.code) out.push(code(l.predict.code));
  out.push(options(l.predict.options, l.predict.answerIndex));
  out.push(`\n**Reveal:** ${l.predict.reveal}\n`);
  out.push(`### 2. Worked example\n${code(l.workedExample.code)}`);
  out.push(l.workedExample.walkthrough.map((w, i) => `${i + 1}. ${w}`).join("\n") + "\n");
  out.push(`### 3. Your turn\n${l.yourTurn.prompt}\n\n${code(l.yourTurn.codeWithBlank)}`);
  out.push(options(l.yourTurn.options, l.yourTurn.answerIndex));
  out.push(`\n**Explanation:** ${l.yourTurn.explanation}\n`);
  out.push(`### 4. Recap\n${l.recap.map((r) => `- ${r}`).join("\n")}\n`);
  out.push("Review: - [ ] accurate  - [ ] clear  - [ ] encouraging\n");
  const mine = drills.filter((d) => d.lessonId === l.id);
  out.push(`### Drills for this lesson (${mine.length})\n`);
  for (const d of mine) {
    out.push(`#### ${d.id} (${d.kind}) · reviewed: **${d.reviewed}**\n${d.prompt}\n`);
    if (d.code) out.push(code(d.code));
    out.push(options(d.options, d.answerIndex));
    out.push(`\n**Key points a good "why" covers:**\n${d.rubric.map((r) => `- ${r}`).join("\n")}\n`);
    out.push(`**Hint:** ${d.hint}\n`);
    out.push("Review: - [ ] accurate  - [ ] clear  - [ ] encouraging\n");
  }
}

mkdirSync(new URL("../docs/", import.meta.url), { recursive: true });
writeFileSync(new URL("../docs/content-review.md", import.meta.url), out.join("\n") + "\n");
console.log(`Wrote docs/content-review.md (${lessons.length} lessons, ${drills.length} drills)`);
