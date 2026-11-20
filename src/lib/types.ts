import type { PressureLevel } from "./config";

export type Track = "javascript" | "typescript";

/**
 * A short lesson (2-5 min). Structure follows learning-science defaults:
 * guess first (pretesting) -> worked example -> faded "your turn" -> recap.
 * Content is AI-drafted and must be human-reviewed (`reviewed`) before it ships.
 */
export interface Lesson {
  id: string;
  track: Track;
  topic: string; // e.g. "arrays", "objects"
  title: string;
  minutes: number;
  predict: {
    question: string;
    code?: string;
    options: string[];
    answerIndex: number;
    reveal: string;
  };
  workedExample: {
    code: string;
    walkthrough: string[];
  };
  yourTurn: {
    prompt: string;
    codeWithBlank: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  recap: string[];
  reviewed: boolean;
}

export type DrillKind = "quick-fire" | "pick-a-or-b";

/** Drills are graded against a rubric the learner self-checks, not free-form LLM judgment. */
export interface Drill {
  id: string;
  lessonId: string;
  topic: string;
  kind: DrillKind;
  prompt: string;
  code?: string;
  options: string[];
  answerIndex: number;
  /** Key points a strong "why" covers. Shown after answering; learner ticks what they hit. */
  rubric: string[];
  hint: string;
  reviewed: boolean;
}

export interface InterviewSession {
  id: string;
  userId: string;
  startedAt: string;
  pressure: PressureLevel;
  mode: "text" | "voice";
  /** Per-topic scores shown at the end; no replay of weak moments by design. */
  topicScores: Record<string, number>;
  nextDrillIds: string[];
}
