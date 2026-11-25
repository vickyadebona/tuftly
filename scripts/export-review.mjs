// Exports every lesson and drill to one readable Markdown file for human review.
// Usage: node scripts/export-review.mjs   (Node 22)  ->  docs/content-review.md
import { mkdirSync, writeFileSync } from "node:fs";
import { lessons } from "../src/content/lessons.ts";
import { drills } from "../src/content/drills.ts";

const code = (s) => "```js\n" + s + "\n```";
const quote = (s) => s.split("\n").map((line) => (line ? `> ${line}` : ">")).join("\n");
const bullets = (items) => items.map((item) => `- ${item}`).join("\n");
const numbered = (items) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");
const REVIEW_BOXES = "Review: - [ ] accurate  - [ ] clear  - [ ] encouraging";

const out = [];
const add = (...blocks) => out.push(...blocks.filter(Boolean));

/** A prompt, its code if any, and the choices with the marked answer. Spoken answers stay plain text. */
function question(prompt, q, spoken) {
  const options = q.options
    .map((option, i) => {
      const text = spoken ? option : `\`${option}\``;
      return i === q.answerIndex ? `- **✔ ${text}**` : `- ${text}`;
    })
    .join("\n");
  add(prompt, q.code && code(q.code), options);
}

add(
  "# Content review",
  "Generated from `src/content/` by `node scripts/export-review.mjs`, so edit the source files, not this one. Set `reviewed: true` on an item only after you've checked it.",
  "`npm test` checks the structure of the content and some of the code answers. It can't tell whether a statement is true or well put, so that is what this review is for.",
  "## Checklist for each item\n" +
    bullets([
      "[ ] Is every statement true (not just 'mostly')?",
      "[ ] Would a stressed beginner understand it on first read?",
      "[ ] Is the tone encouraging, never blaming?",
      "[ ] Is anything missing that an interviewer would expect?",
      "[ ] Is the difficulty right for a refresher?",
    ]),
);

for (const lesson of lessons) {
  const spoken = lesson.track === "communication";
  add(
    "---",
    `## Lesson: ${lesson.title}`,
    `id: \`${lesson.id}\` · track: ${lesson.track} · topic: ${lesson.topic} · ${lesson.minutes} min · reviewed: **${lesson.reviewed}**`,
    lesson.intro.summary,
    "**By the end you'll be able to:**\n" + bullets(lesson.intro.outcomes),
  );

  lesson.ideas.forEach((idea, n) => {
    const { guess, workedExample, check, reteach, explain, retries } = idea;
    add(`### Idea ${n + 1}: ${idea.title}`, `id: \`${idea.id}\``);

    add("#### Guess first");
    question(guess.question, guess, spoken);
    add(`**Reveal:** ${guess.reveal}`);

    add(
      "#### Worked example",
      workedExample.code && code(workedExample.code),
      workedExample.sample && quote(workedExample.sample),
      workedExample.diagram && `**Diagram:** ${workedExample.diagram.caption} ${workedExample.diagram.description}`,
      numbered(workedExample.walkthrough),
    );

    add("#### Your turn");
    question(check.prompt, check, spoken);
    add(`**Explanation:** ${check.explanation}`);

    add("#### Another look (after a miss)", numbered(reteach.steps), reteach.code && code(reteach.code));
    retries.forEach((retry, i) => {
      add(`**Fresh question ${i + 1}**`);
      question(retry.prompt, retry, spoken);
      add(`**Explanation:** ${retry.explanation}`);
    });

    add(
      "#### Say it",
      explain.question,
      `**Starter:** ${explain.starter}`,
      `**Model answer:**\n${quote(explain.modelAnswer)}`,
      "**Key points:**\n" + bullets(explain.keyPoints),
      `**Recap line:** ${idea.recap}`,
    );
  });

  add(REVIEW_BOXES);

  const mine = drills.filter((d) => d.lessonId === lesson.id);
  add(`### Drills for this lesson (${mine.length})`);
  for (const d of mine) {
    add(`#### ${d.id} (${d.kind}) · reviewed: **${d.reviewed}**`, d.ideaId && `idea: \`${d.ideaId}\``);
    question(d.prompt, d, spoken);
    add(
      "**Key points a good \"why\" covers:**\n" + bullets(d.rubric),
      `**Hint:** ${d.hint}`,
      `**How you could say it:**\n${quote(d.sayIt)}`,
      REVIEW_BOXES,
    );
  }
}

// A drill pointing at no lesson would otherwise be left out without a word.
const orphans = drills.filter((d) => !lessons.some((l) => l.id === d.lessonId));
if (orphans.length) throw new Error(`Drills with no lesson: ${orphans.map((d) => d.id).join(", ")}`);

mkdirSync(new URL("../docs/", import.meta.url), { recursive: true });
writeFileSync(new URL("../docs/content-review.md", import.meta.url), out.join("\n\n") + "\n");
console.log(`Wrote docs/content-review.md (${lessons.length} lessons, ${drills.length} drills)`);
