"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

/** Says a line out loud in the browser's voice, if it has one. */
export function speak(line: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function hush() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
