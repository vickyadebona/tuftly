"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// The browser's own speech tools. Support varies: Chrome, Edge and Safari can listen, Firefox
// mostly can't, and some browsers send the audio to their maker's service to turn it into text.

interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function recognitionClass(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const canListen = () => recognitionClass() !== null;

export type ListenError = "blocked" | "nomic" | "service" | "unsupported" | "failed";

/** What to tell someone for each way listening can fail. */
export const LISTEN_PROBLEM: Record<ListenError, string> = {
  blocked: "Your microphone isn't allowed yet. Allow it from the icon by the address bar, then try again.",
  nomic: "I couldn't find a microphone. Plug one in or check your settings, then try again.",
  service: "This browser couldn't turn speech into text. Chrome or Safari usually can.",
  unsupported: "This browser can't listen.",
  failed: "I couldn't use the microphone. Try again.",
};

// Set once the browser has let us use the microphone, so later starts happen right away.
let allowed = false;

/**
 * Asks for the microphone and waits for the answer, however long that takes. Listening itself
 * gives up if the browser's prompt is still open, so ask first.
 */
async function askForMicrophone(): Promise<ListenError | null> {
  if (allowed || !navigator.mediaDevices?.getUserMedia) return null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    allowed = true;
    return null;
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") return "blocked";
    if (name === "NotFoundError") return "nomic";
    return "failed";
  }
}

const join = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(" ");

/** Turns speech into text until stopped. Pauses don't end it. */
export function useDictation() {
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<ListenError | null>(null);
  // True while the browser is asking whether we may use the microphone.
  const [waiting, setWaiting] = useState(false);
  const active = useRef<Recognition | null>(null);
  // Goes up on every start and stop, so a late answer to an old request is ignored.
  const attempt = useRef(0);
  const finalText = useRef("");

  const stop = useCallback(() => {
    attempt.current++;
    setWaiting(false);
    const r = active.current;
    active.current = null;
    if (r) {
      r.onend = null;
      r.onresult = null;
      r.onerror = null;
      r.abort();
    }
    setInterim("");
  }, []);

  /** `keep` is text already heard, to carry on from (after a tea break, say). */
  const start = useCallback(
    (keep = "") => {
      stop();
      finalText.current = keep;
      setText(keep);
      setError(null);
      const Class = recognitionClass();
      if (!Class) {
        setError("unsupported");
        return;
      }
      const r = new Class();
      r.lang = "en-US";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let pending = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i];
          if (result.isFinal) finalText.current = join(finalText.current, result[0].transcript);
          else pending = join(pending, result[0].transcript);
        }
        setText(finalText.current);
        setInterim(pending);
      };
      r.onerror = (e) => {
        // Silence and our own stops are normal. Anything else ends listening.
        if (e.error === "no-speech" || e.error === "aborted") return;
        if (e.error === "not-allowed" || e.error === "audio-capture") allowed = false;
        setError(
          e.error === "not-allowed"
            ? "blocked"
            : e.error === "audio-capture"
              ? "nomic"
              : e.error === "network" || e.error === "service-not-allowed"
                ? "service"
                : "failed",
        );
        active.current = null;
      };
      // Browsers stop on their own after a quiet spell, so start again while we still want to hear.
      r.onend = () => {
        if (active.current !== r) return;
        try {
          r.start();
        } catch {
          setError("failed");
        }
      };
      active.current = r;
      const mine = attempt.current;
      const begin = () => {
        try {
          r.start();
        } catch {
          setError("failed");
        }
      };
      if (allowed) return begin();
      setWaiting(true);
      askForMicrophone().then((problem) => {
        if (attempt.current !== mine) return;
        setWaiting(false);
        if (problem) {
          active.current = null;
          setError(problem);
        } else begin();
      });
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { heard: join(text, interim), error, waiting, start, stop };
}

// Bobbin's lines are recorded ahead of time (scripts/add-voice.mjs), so they sound the same
// everywhere. The browser's own voice is the backup if a recording can't play.
let player: HTMLAudioElement | null = null;
// Goes up on every new line and every hush, so a late failure of an old line stays quiet.
let line = 0;
let speaking = false;
// The recording being read out, so its words can appear in time with it.
let reading: string | null = null;
const listeners = new Set<() => void>();

function setSpeaking(next: boolean) {
  if (speaking === next) return;
  speaking = next;
  listeners.forEach((l) => l());
}

function setReading(next: string | null) {
  if (reading === next) return;
  reading = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

/** True while Bobbin is talking. */
export function useSpeaking() {
  return useSyncExternalStore(
    subscribe,
    () => speaking,
    () => false,
  );
}

/**
 * How far through the recording `id` Bobbin is, from 0 to 1. Null when he isn't reading it, which
 * means: show all of it.
 */
export function useSpokenFraction(id: string): number | null {
  const active = useSyncExternalStore(
    subscribe,
    () => reading === id,
    () => false,
  );
  const [fraction, setFraction] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const tick = () => {
      const length = player?.duration ?? 0;
      setFraction(player && length > 0 ? player.currentTime / length : 0);
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [active, id]);
  return active ? fraction : null;
}

function sayInBrowserVoice(text: string) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.onstart = () => setSpeaking(true);
  utterance.onend = utterance.onerror = () => setSpeaking(false);
  window.speechSynthesis.speak(utterance);
}

/** Says a line out loud. `id` names its recording; `text` is the same words. */
export function speak(id: string, text: string) {
  if (typeof window === "undefined") return;
  hush();
  const mine = line;
  // One player for every line: browsers that let it play once keep letting it.
  player ??= new Audio();
  const audio = player;
  audio.src = `/voice/${id}.m4a`;
  audio.onplaying = () => {
    setReading(id);
    setSpeaking(true);
  };
  audio.onpause = audio.onended = () => {
    // A late event from the line before must not end this one.
    if (!audio.paused) return;
    setReading(null);
    setSpeaking(false);
  };
  setReading(id);
  // Never hold the words back for a slow download.
  window.setTimeout(() => {
    if (line === mine && audio.currentTime === 0) setReading(null);
  }, 1500);
  audio.play().catch(() => {
    if (line !== mine) return;
    setReading(null);
    sayInBrowserVoice(text);
  });
}

export function hush() {
  line++;
  player?.pause();
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  setReading(null);
  setSpeaking(false);
}
