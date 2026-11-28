import { useSyncExternalStore } from "react";

/**
 * The pitch builder: the learner pastes a role, picks what it asks for, matches each to their own
 * real experience, and gets a first draft of "tell me about yourself". Saved on this device, and
 * with their account when signed in (it's personal: only they can read it). Nothing here writes
 * claims for them: it only arranges what they type.
 */
export interface PitchMatch {
  did: string;
  result: string;
}

export interface PitchData {
  step: number;
  role: string;
  description: string;
  /** Requirement lines the learner added themselves. */
  custom: string[];
  picked: string[];
  matches: Record<string, PitchMatch>;
  who: string;
  why: string;
  draft: string;
  updatedAt: number;
}

export const MAX_PICKS = 3;

export const EMPTY_PITCH: PitchData = {
  step: 0,
  role: "",
  description: "",
  custom: [],
  picked: [],
  matches: {},
  who: "",
  why: "",
  draft: "",
  updatedAt: 0,
};

const BOILERPLATE = /equal opportunity|\bEEO\b|benefits|salary|compensation|how to apply|to apply|privacy|reasonable accommodation/i;

/** Pull candidate "what they're asking for" lines out of a pasted description. */
export function extractRequirements(text: string): string[] {
  const pieces = text
    .split(/\r?\n|[•·▪●]/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    // Strip a bullet or a list number ("-", "*", "1." or "2)"), but never a leading "3+ years".
    .map((l) => l.replace(/^\s*(?:[-*–—]+|\d+[.)])\s+/, "").trim())
    .filter((l) => l.length >= 15 && l.length <= 180)
    .filter((l) => !l.endsWith(":") && !BOILERPLATE.test(l));
  return [...new Set(pieces)].slice(0, 12);
}

const stripEnd = (s: string) => s.trim().replace(/[.\s]+$/, "");
/** Lowercase the first letter mid-sentence, but leave acronyms alone ("UX designer", "iOS developer"). */
const lowerFirst = (s: string) => (s && /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** About 150 words a minute when speaking. */
export function estimateSeconds(text: string): number {
  return Math.round(wordCount(text) / 2.5);
}

/**
 * Present, past, future, built only from the learner's own words. Gaps show as [brackets] so
 * they're obvious to fill in.
 */
export function buildDraft(d: Pick<PitchData, "role" | "who" | "why" | "picked" | "matches">): string {
  const who = stripEnd(d.who) || "[who you are now: your role and how long you've done it]";
  const present = `I'm ${lowerFirst(who)}.`;

  const lead = ["Most recently, I", "I also", "And I"];
  const past = d.picked
    .map((req, i) => {
      const m = d.matches[req];
      const did = m?.did?.trim() ? stripEnd(lowerFirst(m.did.trim())) : "[what you did]";
      const result = m?.result?.trim() ? `, and ${stripEnd(lowerFirst(m.result.trim()))}` : "";
      return `${lead[i] ?? "I also"} ${did}${result}.`;
    })
    .join(" ");

  const asks = d.picked.slice(0, 2).map((r) => `“${stripEnd(r)}”`);
  const roleName = d.role.trim() ? `the ${lowerFirst(stripEnd(d.role))} role` : "this role";
  const fit = asks.length
    ? `${cap(roleName)} asks for ${asks.join(" and ")}, and that's the kind of work I've been doing.`
    : "";
  const why = d.why.trim() ? ` I'm looking for ${stripEnd(lowerFirst(d.why))}.` : " I'm looking for [what you want next, tied to this role].";

  return [present, past, `${fit}${why}`.trim()].filter(Boolean).join("\n\n");
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const FOLLOW_UPS = [
  "What was your part, and what did the rest of the team do?",
  "What was the hardest part, and how did you handle it?",
  "How did you know it worked?",
  "What would you do differently now?",
];

export const PITCH_CHECKS = [
  "It runs about a minute or less when I say it out loud",
  "It starts with who I am now",
  "It has at least one result I can explain",
  "It ends with what I want next, tied to this role",
  "Everything in it is something I could talk about for two more minutes",
];

/** Of this device's pitch and the saved one, the one edited most recently. */
export function newerPitch(local: PitchData, saved: PitchData | null): PitchData {
  return saved && saved.updatedAt > local.updatedAt ? { ...EMPTY_PITCH, ...saved } : local;
}

// ---- storage (this device; SyncManager copies it to the account)

const KEY = "tuftly-pitch-v1";
let cache: { raw: string | null; value: PitchData } = { raw: null, value: EMPTY_PITCH };
const listeners = new Set<() => void>();

function read(): PitchData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    cache = { raw, value: raw ? { ...EMPTY_PITCH, ...JSON.parse(raw) } : EMPTY_PITCH };
    return cache.value;
  } catch {
    return EMPTY_PITCH;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function usePitch(): PitchData {
  return useSyncExternalStore(subscribe, read, () => EMPTY_PITCH);
}

function write(next: PitchData | null) {
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the pitch just won't persist this session.
  }
  listeners.forEach((l) => l());
}

/** Current pitch, outside React. Used by sync. */
export function getPitch(): PitchData {
  return read();
}

export function subscribePitch(cb: () => void) {
  return subscribe(cb);
}

/** Overwrite this device's pitch with the saved one, keeping its edit time. */
export function replacePitch(next: PitchData) {
  write(next);
}

export function savePitch(patch: Partial<PitchData>) {
  write({ ...read(), ...patch, updatedAt: Date.now() });
}

/** The learner starts over. Dated, so the empty pitch also replaces the saved copy. */
export function clearPitch() {
  write({ ...EMPTY_PITCH, updatedAt: Date.now() });
}

/** Drop this device's copy without touching anyone's account (someone else is using it). */
export function forgetPitch() {
  write(null);
}
