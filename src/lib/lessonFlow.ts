import type { LessonIdea, Question } from "./types.ts";

/**
 * Where a learner is inside a lesson. Moves one idea at a time: a miss on the check re-teaches
 * that same idea and asks fresh questions before the lesson goes on. Pure functions, so the
 * rules are easy to test and the position is easy to save and restore.
 */
export type LessonStage = "guess" | "example" | "check" | "reteach" | "explain";

export interface LessonPosition {
  idea: number;
  stage: LessonStage;
  /** Wrong answers so far on this idea's check. Picks which question is asked. */
  attempt: number;
  /** Ideas that needed more than one try. They come back first in practice. */
  missed: string[];
}

export const START: LessonPosition = { idea: 0, stage: "guess", attempt: 0, missed: [] };

export function questionFor(idea: LessonIdea, attempt: number): Question {
  return attempt === 0 ? idea.check : (idea.retries[attempt - 1] ?? idea.retries[idea.retries.length - 1] ?? idea.check);
}

export function canRetry(idea: LessonIdea, attempt: number): boolean {
  return attempt < idea.retries.length;
}

const add = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

export function afterGuess(p: LessonPosition): LessonPosition {
  return { ...p, stage: "example" };
}

export function afterExample(p: LessonPosition): LessonPosition {
  return { ...p, stage: "check" };
}

/** Right answer: now say the idea in words. */
export function afterRight(p: LessonPosition): LessonPosition {
  return { ...p, stage: "explain" };
}

/** Wrong answer: re-teach this idea if there are fresh questions left, otherwise on to saying it in words. */
export function afterWrong(p: LessonPosition, idea: LessonIdea): LessonPosition {
  const missed = add(p.missed, idea.id);
  if (canRetry(idea, p.attempt)) return { ...p, stage: "reteach", attempt: p.attempt + 1, missed };
  return { ...p, stage: "explain", attempt: 0, missed };
}

/** Done explaining: on to the next idea. */
export function afterExplain(p: LessonPosition): LessonPosition {
  return { ...p, idea: p.idea + 1, stage: "guess", attempt: 0 };
}

export function afterReteach(p: LessonPosition): LessonPosition {
  return { ...p, stage: "check" };
}

export function isRecap(p: LessonPosition, ideaCount: number): boolean {
  return p.idea >= ideaCount;
}
