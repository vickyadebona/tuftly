/**
 * Named practice sessions on the Interviews page, so someone can go straight to the questions
 * they're worried about. Their questions are the "say it" questions from the lessons, which are
 * open ones an interviewer would ask, and they're open to everyone without finishing a lesson.
 */
import type { Drill, Lesson } from "./types.ts";

export interface RoundQuestion {
  id: string;
  topic: string;
  prompt: string;
  code?: string;
  /** One way a strong answer might sound. */
  sayIt: string;
  rubric: string[];
  hint: string;
}

export interface NamedSession {
  id: string;
  title: string;
  about: string;
  includes: (lesson: Lesson) => boolean;
}

export const SESSION_SIZE = 5;

export const SESSIONS: NamedSession[] = [
  { id: "story", title: "Your story", about: "“Tell me about yourself” and why you fit", includes: (l) => l.id === "pitch-basics" },
  { id: "projects", title: "Your projects", about: "Your part, a walkthrough and what went wrong", includes: (l) => l.id === "pitch-followups" },
  { id: "strengths", title: "Strengths and growth", about: "A strength, and what you're working on", includes: (l) => l.id === "pitch-strengths" },
  { id: "depth", title: "Going deeper", about: "How something works and why you chose it", includes: (l) => l.id === "answer-depth" },
  { id: "javascript", title: "JavaScript out loud", about: "Arrays, objects, maps and lookups", includes: (l) => l.track === "javascript" },
  { id: "typescript", title: "TypeScript", about: "unknown, any, type and interface", includes: (l) => l.track === "typescript" },
  { id: "engineering", title: "How you build", about: "Rules, data and tests that don't flake", includes: (l) => l.track === "engineering" },
];

/**
 * The questions for one session, at most SESSION_SIZE. With more lessons than that, it takes a
 * question from each lesson in turn so no lesson crowds out the others.
 */
export function sessionQuestions(session: NamedSession, lessons: Lesson[]): RoundQuestion[] {
  const perLesson = lessons.filter(session.includes).map((l) =>
    l.ideas.map((idea) => ({
      id: `${l.id}/${idea.id}`,
      topic: idea.title,
      prompt: idea.explain.question,
      sayIt: idea.explain.modelAnswer,
      rubric: idea.explain.keyPoints,
      hint: `You could start: “${idea.explain.starter}”`,
    })),
  );
  const mixed: RoundQuestion[] = [];
  for (let i = 0; perLesson.some((g) => i < g.length); i++) {
    for (const g of perLesson) if (i < g.length) mixed.push(g[i]);
  }
  return mixed.slice(0, SESSION_SIZE);
}

/** The round drawn from lessons already finished, using their practice questions. */
export function lessonMix(drills: Drill[], done: string[], shuffle: (d: Drill[]) => Drill[]): RoundQuestion[] {
  return shuffle(drills.filter((d) => done.includes(d.lessonId))).slice(0, SESSION_SIZE);
}

/** A rough, honest estimate: about two minutes to answer and check each question. */
export const minutesFor = (count: number) => count * 2;
