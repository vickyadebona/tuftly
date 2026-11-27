/**
 * Bobbin's catchphrases. They add flavor beside plain words, about one to a screen, and stay out of
 * Full interview, which is meant to feel like the real thing.
 */
export const HELLO = "Peep peep!";
export const READY = "Ready when you are!";
export const LESSON_DONE = "Look at you, spreading your wings!";
export const WELCOME_BACK = "Welcome back to the nest.";
export const STREAK = "Peep peep! Another day!";
export const TEA_TIME = "Tea time! I saved you a perch.";
export const BEFORE_INTERVIEW = "Deep breath. You don't have to wing it.";
export const NOT_SURE = "Even early birds get stumped.";
export const INTERVIEW_DONE = "That was something to crow about!";

const CORRECT = ["Tweet success!", "Peep peep, you got it!", "You're flying!"];

/** `turn` counts answers, so the lines take turns. */
export function correctLine(turn: number): string {
  return CORRECT[turn % CORRECT.length];
}

/** `retry` is true when another go comes next, so Bobbin only says "try again" when there is one. */
export function wrongLine(turn: number, retry = false): string {
  return turn % 2 === 0 ? `No ruffled feathers.${retry ? " Try again." : ""}` : NOT_SURE;
}
