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

export type ListenError = "blocked" | "unsupported" | "failed";

const join = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(" ");

/** Turns speech into text until stopped. Pauses don't end it. */
export function useDictation() {
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<ListenError | null>(null);
  const active = useRef<Recognition | null>(null);
  const finalText = useRef("");

  const stop = useCallback(() => {
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
        setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "blocked" : "failed");
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
      try {
        r.start();
      } catch {
        setError("failed");
      }
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { heard: join(text, interim), error, start, stop };
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
