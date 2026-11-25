import type { Drill, Lesson } from "./types.ts";

/**
 * Staying on one idea during practice. After "Almost" or "Not yet", the learner gets more
 * questions on that same idea for as long as they like. Pure functions, so they're easy to test.
 */
export interface PracticeCard {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  answerIndex: number;
  hint?: string;
  /** Drills have a spoken answer and key points. Lesson questions have an explanation instead. */
  sayIt?: string;
  rubric: string[];
  explanation?: string;
}

/**
 * Every question we have on the drill's idea: the drill itself first, then other drills on the
 * idea, then the lesson's own questions for it. Without an idea, it's just the drill.
 */
export function practicePool(drill: Drill, drills: Drill[], lessons: Lesson[]): PracticeCard[] {
  const siblings = drill.ideaId ? drills.filter((d) => d.ideaId === drill.ideaId && d.id !== drill.id) : [];
  const idea = lessons.find((l) => l.id === drill.lessonId)?.ideas.find((i) => i.id === drill.ideaId);
  const fromLesson = idea
    ? [idea.check, ...idea.retries].map((q, n) => ({ ...q, id: `${idea.id}-q${n}`, rubric: [] }))
    : [];
  return [drill, ...siblings, ...fromLesson];
}

const COMMON = new Set(
  ("a an and are as at be but by can do does for from get got how i im in is it its me my not of on or so that the their them " +
    "then there they this to was what when where which who why will with would you your am if about dont understand know " +
    "sure struggling hard part more just really still confused").split(" "),
);

/** The words that carry meaning, with simple endings trimmed so "checks" matches "check". */
function words(text: string): Set<string> {
  const found = text.toLowerCase().match(/[a-z][a-z0-9]+/g) ?? [];
  return new Set(found.filter((w) => !COMMON.has(w)).map((w) => (w.length > 4 ? w.replace(/(ing|ed|es|s|e)$/, "") : w)));
}

/** How many of the words in `gap` a question touches. Plain word matching, not understanding. */
export function matchScore(card: PracticeCard, gap: string): number {
  const text = [card.prompt, card.code, ...card.options, ...card.rubric, card.sayIt, card.explanation].join(" ");
  const inCard = words(text);
  return [...words(gap)].filter((w) => inCard.has(w)).length;
}

/**
 * The next question on this idea: one not seen yet that best matches the gap, otherwise in order.
 * Once every question has been used it goes round again, without repeating the last one.
 */
export function nextCard(pool: PracticeCard[], seen: string[], gap = ""): PracticeCard {
  const unseen = pool.filter((c) => !seen.includes(c.id));
  const last = seen[seen.length - 1];
  const others = pool.filter((c) => c.id !== last);
  const choices = unseen.length ? unseen : others.length ? others : pool;
  const best = Math.max(...choices.map((c) => matchScore(c, gap)));
  if (best > 0) return choices.find((c) => matchScore(c, gap) === best)!;
  return unseen.length ? unseen[0] : pool[(pool.findIndex((c) => c.id === last) + 1) % pool.length];
}
