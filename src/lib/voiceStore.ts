import { useSyncExternalStore } from "react";
import { todayStr } from "./dates";
import type { Interview } from "./voice";

/**
 * Transcripts stay on this device only. Nothing here is synced: saving people's words to a server
 * waits for the privacy page. No audio is ever stored.
 */
interface VoiceData {
  interviews: Interview[];
  /** Interviews started per "owner date", so deleting a transcript doesn't hand one back. */
  used: Record<string, number>;
}

const KEY = "tuftly-voice-v1";
const EMPTY: VoiceData = { interviews: [], used: {} };
const KEEP = 20;

let cache: { raw: string | null; value: VoiceData } = { raw: null, value: EMPTY };
const listeners = new Set<() => void>();

function read(): VoiceData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    cache = { raw, value: raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY };
    return cache.value;
  } catch {
    return EMPTY;
  }
}

function write(next: VoiceData) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: practice still works, nothing is kept.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useVoiceData(): VoiceData {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const usedToday = (data: VoiceData, owner: string) => data.used[`${owner} ${todayStr()}`] ?? 0;

/** Counts one of today's interviews. Call it once, when the first answer is given. */
export function countInterview(owner: string) {
  const data = read();
  const key = `${owner} ${todayStr()}`;
  write({ ...data, used: { ...data.used, [key]: (data.used[key] ?? 0) + 1 } });
}

export function saveInterview(interview: Interview) {
  const data = read();
  const others = data.interviews.filter((i) => i.id !== interview.id);
  write({ ...data, interviews: [interview, ...others].slice(0, KEEP) });
}

export function deleteInterview(id: string) {
  const data = read();
  write({ ...data, interviews: data.interviews.filter((i) => i.id !== id) });
}
