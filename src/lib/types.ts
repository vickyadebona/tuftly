import type { PressureLevel } from "./config";

/** "communication" lessons teach how to talk about yourself and your work, not code. */
export type Track = "javascript" | "typescript" | "communication" | "engineering";

/** A multiple-choice question with a short explanation shown after answering. */
export interface Question {
  prompt: string;
  code?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/**
 * One sub-topic of a lesson. Each idea runs on its own: guess, example, then a check. A miss on
 * the check re-teaches this same idea (`reteach`) and asks fresh questions (`retries`) before the
 * lesson moves on, so a learner never skips past something they haven't got yet.
 */
export interface LessonIdea {
  id: string;
  title: string;
  /** Pretest: guess before seeing the answer. Never counts as a miss. */
  guess: {
    question: string;
    code?: string;
    options: string[];
    answerIndex: number;
    reveal: string;
  };
  workedExample: {
    /** Code to study. Omit for communication lessons. */
    code?: string;
    /** A spoken example, shown as a quote. Used by communication lessons. */
    sample?: string;
    walkthrough: string[];
  };
  /** The "your turn" check. A wrong answer sends the learner to `reteach`. */
  check: Question;
  /** The same idea from a different angle, shown after a miss. */
  reteach: {
    steps: string[];
    code?: string;
  };
  /**
   * "Say it" step: the idea as an interviewer would ask it, answered in words. The learner writes
   * their own answer, then compares with `modelAnswer` and ticks the `keyPoints` they covered.
   */
  explain: {
    question: string;
    /** A way to begin the sentence, for when the blank page is the hard part. */
    starter: string;
    /** Two or three plain, spoken-style sentences a strong answer might use. */
    modelAnswer: string;
    keyPoints: string[];
  };
  /** Fresh questions on this same idea, one per extra attempt. */
  retries: Question[];
  /** One line for the final recap. */
  recap: string;
}

/**
 * A short lesson (2-5 min per idea set), built from ideas. Structure follows learning-science
 * defaults: guess first (pretesting) -> worked example -> faded "your turn" -> targeted re-teach.
 * Content is AI-drafted and must be human-reviewed (`reviewed`) before it ships.
 */
export interface Lesson {
  id: string;
  track: Track;
  topic: string; // e.g. "arrays", "objects"
  title: string;
  minutes: number;
  /** Shown before the lesson starts, so the learner knows what they're getting into. */
  intro: {
    summary: string;
    /** "By the end you'll be able to…" Each one starts with a verb. */
    outcomes: string[];
  };
  ideas: LessonIdea[];
  reviewed: boolean;
}

/** A unit is a group of lessons on one track, introduced once before its first lesson. */
export interface UnitInfo {
  track: Track;
  title: string;
  blurb: string;
  forWho: string;
  learn: string[];
  format: string;
}

export type DrillKind = "quick-fire" | "pick-a-or-b";

/** Drills are graded against a rubric the learner self-checks, not free-form LLM judgment. */
export interface Drill {
  id: string;
  lessonId: string;
  /** The lesson idea this drill practices, so struggled ideas can come back first. */
  ideaId?: string;
  topic: string;
  kind: DrillKind;
  prompt: string;
  code?: string;
  options: string[];
  answerIndex: number;
  /** Key points a strong "why" covers. Shown after answering; learner ticks what they hit. */
  rubric: string[];
  hint: string;
  /** How you could say the answer in an interview: a few plain sentences, not just code or output. */
  sayIt: string;
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
