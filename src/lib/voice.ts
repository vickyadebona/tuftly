/**
 * Voice practice, without an AI: Bobbin asks written questions out loud, the answer is turned into
 * text on screen, and you check it against key points yourself. Pure rules live here.
 */

/** Speaking time for one interview. It only runs while you are answering. */
export const VOICE_SECONDS = 7 * 60;

/** Coach Me checks in after each answer. Full interview saves everything for the end. */
export type Mode = "coach" | "full";
export const MODE_LABEL: Record<Mode, string> = { coach: "Coach Me", full: "Full interview" };

export interface VoiceQuestion {
  id: string;
  kind: "question" | "followup";
  prompt: string;
  /** Key points to check your own answer against. */
  rubric: string[];
  /** A way to start, shown after "I'm not sure". */
  hints: string[];
}

const HONEST = "Say it honestly: “I haven't thought about that yet, but here's how I would.”";

/** "Your story": three questions, each with one follow-up. The follow-ups are fixed for now. */
export const STORY_QUESTIONS: VoiceQuestion[] = [
  {
    id: "story/about",
    kind: "question",
    prompt: "Tell me about yourself.",
    rubric: [
      "Starts with who you are now",
      "Gives one recent highlight with a result",
      "Ends with what you want next, tied to this role",
      "Takes about a minute, not five",
    ],
    hints: ["Present: who you are and what you do now", "Past: one thing you did, and what changed", "Future: what you want next"],
  },
  {
    id: "story/about-own-part",
    kind: "followup",
    prompt: "In the work you just described, what did you do yourself?",
    rubric: ["Says what you owned, using “I”", "Names something specific you did", "Credits other people's parts"],
    hints: ["Pick one piece that was yours", "Say what you did to it", HONEST],
  },
  {
    id: "story/fit",
    kind: "question",
    prompt: "Why do you think you're a good fit for this role?",
    rubric: [
      "Names two or three things the role asks for",
      "Matches each one to something you actually did",
      "Says what changed or what the result was",
      "Uses the role's own words",
    ],
    hints: ["Name one thing the role asks for", "Say when you did something like it", "Say what came of it"],
  },
  {
    id: "story/fit-gap",
    kind: "followup",
    prompt: "Which part of the role is newest to you, and how would you learn it?",
    rubric: ["Names the gap plainly", "Mentions the closest related thing you've done", "Says how you'd close it"],
    hints: ["Name the part you haven't done", "Name the closest thing you have done", "Say how you'd close the gap"],
  },
  {
    id: "story/proof",
    kind: "question",
    prompt: "Tell me about something you did that made a difference.",
    rubric: ["Says what you did", "Says how you did it", "Says what changed", "Doesn't invent a number"],
    hints: ["Think of a problem someone had", "Say what you did about it", "Say what was different afterward"],
  },
  {
    id: "story/proof-how",
    kind: "followup",
    prompt: "How did you know it worked?",
    rubric: ["Points to something you could observe", "Is honest about what you didn't measure"],
    hints: ["A number, if you have a real one", "Or what people did or stopped doing", HONEST],
  },
];

export interface Turn {
  questionId: string;
  kind: VoiceQuestion["kind"];
  question: string;
  answer: string;
  seconds: number;
  /** The text was changed by hand after Bobbin heard it. */
  edited: boolean;
  typed: boolean;
  notSure: boolean;
  skipped: boolean;
  /** Which key points were checked off. */
  covered: boolean[];
}

export interface Interview {
  id: string;
  /** The signed-in person's id, or "device" without sign-in, so a shared computer keeps them apart. */
  owner: string;
  /** When it started, in milliseconds. */
  at: number;
  mode: Mode;
  turns: Turn[];
  /** 1 (not ready) to 5 (ready), before and after. */
  readyBefore: number;
  readyAfter?: number;
}

export function interviewsLeft(usedToday: number, cap: number): number {
  return Math.max(0, cap - usedToday);
}

export function reassurance(ready: number): { text: string; offerTea: boolean } {
  if (ready <= 2) {
    return {
      text: "That's completely normal. How about a cup of tea first? Take a few quiet minutes, and we'll start when you're ready.",
      offerTea: true,
    };
  }
  if (ready === 3) return { text: "A good place to start. A cup of tea first could help you settle in.", offerTea: true };
  return { text: "Love that. Let's put it to the test and see what you can sharpen.", offerTea: false };
}

export function fmtClock(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Main answers are best at about 30 to 60 seconds; follow-ups can be shorter. Null when typed. */
export function lengthNote(turn: Pick<Turn, "seconds" | "kind" | "typed" | "skipped">): string | null {
  if (turn.typed || turn.skipped) return null;
  const length = `Length: ${turn.seconds} ${turn.seconds === 1 ? "second" : "seconds"}.`;
  if (turn.kind === "followup") return turn.seconds > 75 ? `${length} A follow-up can be shorter.` : length;
  if (turn.seconds < 30) return `${length} Aim for about 30 to 60.`;
  if (turn.seconds > 75) return `${length} Try trimming it to about a minute.`;
  return `${length} A good length.`;
}

function rubricFor(id: string): string[] {
  return STORY_QUESTIONS.find((q) => q.id === id)?.rubric ?? [];
}

/** What was checked off, and what to try next time. Built only from your own checks. */
export function summarize(turns: Turn[]): { covered: string[]; next: string[] } {
  const covered = new Set<string>();
  const next = new Set<string>();
  for (const turn of turns) {
    if (turn.skipped) continue;
    rubricFor(turn.questionId).forEach((point, i) => (turn.covered[i] ? covered : next).add(point));
  }
  for (const point of covered) next.delete(point);
  return { covered: [...covered].slice(0, 4), next: [...next].slice(0, 3) };
}

export function answerNotes(turn: Turn): string {
  if (turn.skipped) return "Skipped";
  return [
    turn.notSure ? "Marked “I'm not sure”, then answered" : "",
    turn.typed ? "Typed" : `${turn.seconds} sec`,
    turn.edited ? "Edited by you" : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

/** The plain text file people can download. */
export function transcriptText(interview: Interview): string {
  const date = new Date(interview.at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const { covered, next } = summarize(interview.turns);
  const lines = [`tuftly practice transcript`, `Your story · ${MODE_LABEL[interview.mode]} · ${date}`, ""];
  for (const turn of interview.turns) {
    lines.push(`Bobbin (${turn.kind === "followup" ? "follow-up" : "question"}): ${turn.question}`);
    lines.push(`You (${answerNotes(turn)}): ${turn.answer || "No answer"}`, "");
  }
  if (covered.length) lines.push("Key points you checked off:", ...covered.map((p) => `- ${p}`), "");
  if (next.length) lines.push("To try next time:", ...next.map((p) => `- ${p}`), "");
  return lines.join("\n");
}
