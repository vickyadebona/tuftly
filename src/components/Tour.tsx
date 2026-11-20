"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { completeTour } from "@/lib/account";
import { useSeason } from "@/lib/useSeason";
import type { BobbinMood } from "./Bobbin";
import { PixelArtBobbin } from "./PixelArtBobbin";

type Align = "center" | "end";
interface Step {
  title: string;
  text: string;
  mood: BobbinMood;
  /** Matches a data-tour="..." attribute on the page. No match: the card sits in the middle. */
  target: string;
  placement: "right" | "below";
  align?: Align;
}

const STEPS: Step[] = [
  {
    title: "Hi, I'm Bobbin!",
    text: "I'll practice with you. We start small: short lessons that take a few minutes each. Take your time. There's no rush here.",
    mood: "sparkle",
    target: "welcome",
    placement: "below",
  },
  {
    title: "Quest map",
    text: "Your lessons sit on a path. Guess first, study an example, then try one yourself. Finish one and the next opens up.",
    mood: "thinking",
    target: "nav-quest",
    placement: "right",
  },
  {
    title: "Practice",
    text: "After a lesson, quick drills come back at just the right time so it sticks. One short practice unlocks your first interview.",
    mood: "happy",
    target: "nav-review",
    placement: "right",
  },
  {
    title: "Interviews with me",
    text: "Pick how it feels: relaxed, standard or interview day. Need a breather? Take a tea break and the clock waits for you.",
    mood: "determined",
    target: "nav-interview",
    placement: "right",
  },
  {
    title: "Gentle streaks",
    text: "Pick up to two rest days a week and miss a day now and then. Your streak stays safe. No leaderboards, ever.",
    mood: "sleepy",
    target: "streak",
    placement: "below",
    align: "end",
  },
];

interface Box {
  /** Which step this measurement is for, so a stale one is never shown. */
  forTarget: string;
  found: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
}

const PAD = 6;
const MARGIN = 16;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** First-visit walkthrough that points at the real parts of the page. Skippable; Esc skips too. */
export function Tour() {
  const season = useSeason();
  const [step, setStep] = useState(0);
  const [measured, setMeasured] = useState<Box | null>(null);
  const [view, setView] = useState({ w: 1280, h: 800 });
  const [dlgH, setDlgH] = useState(380);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  const measure = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${s.target}"]`);
    let r = el?.getBoundingClientRect();
    if (el && r && (r.top < 0 || r.bottom > window.innerHeight)) {
      el.scrollIntoView({ block: "center" });
      r = el.getBoundingClientRect();
    }
    setMeasured({
      forTarget: s.target,
      found: !!r && r.width > 0,
      left: r?.left ?? 0,
      top: r?.top ?? 0,
      width: r?.width ?? 0,
      height: r?.height ?? 0,
    });
    setView({ w: window.innerWidth, h: window.innerHeight });
    if (dialogRef.current) setDlgH(dialogRef.current.offsetHeight);
  }, [s.target]);

  // Re-measure after layout settles, and whenever the window changes.
  useEffect(() => {
    let frame = requestAnimationFrame(measure);
    const again = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", again);
    window.addEventListener("scroll", again, true);
    // The page behind may still be filling in (skeleton, then content), so watch for changes.
    const observer = new MutationObserver(again);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", again);
      window.removeEventListener("scroll", again, true);
    };
  }, [measure]);

  useEffect(() => {
    nextRef.current?.focus();
  }, [step]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") completeTour();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Where the card goes: beside or under the highlighted part, or centered when there is none.
  const ready = measured?.forTarget === s.target;
  const box = ready && measured.found ? measured : null;
  const w = Math.min(400, view.w - MARGIN * 2);
  const narrow = view.w < 768;
  // Short windows: shrink the card so it can sit beside or above the highlight instead of on it.
  const compact = view.h < 760 || narrow;
  let pos: { left: number; top: number };
  if (!box) {
    pos = { left: (view.w - w) / 2, top: Math.max(MARGIN, (view.h - dlgH) / 2) };
  } else if (narrow) {
    // Phone: dock the card at the bottom, or at the top when the highlight sits low (the tab bar).
    const lowTarget = box.top > view.h / 2;
    pos = { left: (view.w - w) / 2, top: lowTarget ? MARGIN : view.h - dlgH - MARGIN };
  } else if (s.placement === "right") {
    pos = {
      left: clamp(box.left + box.width + PAD + 20, MARGIN, view.w - w - MARGIN),
      top: clamp(box.top - PAD, MARGIN, view.h - dlgH - MARGIN),
    };
  } else {
    const centerX = s.align === "end" ? box.left + box.width - w / 2 : box.left + box.width / 2;
    // Under the highlight when it fits, otherwise above it so the highlight is never covered.
    const below = box.top + box.height + PAD + 20;
    const above = box.top - PAD - 20 - dlgH;
    const top = below + dlgH <= view.h - MARGIN || above < PAD ? below : above;
    pos = {
      left: clamp(centerX - w / 2, MARGIN, view.w - w - MARGIN),
      top: clamp(top, MARGIN, view.h - dlgH - MARGIN),
    };
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Blocks clicks on the page behind the tour. */}
      <div className="absolute inset-0" aria-hidden="true" />
      {box ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute border-[3px] border-butter shadow-[0_0_0_9999px_rgb(74_51_38/0.5)]"
          style={{
            left: box.left - PAD,
            top: box.top - PAD,
            width: box.width + PAD * 2,
            height: box.height + PAD * 2,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-ink/50" aria-hidden="true" />
      )}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className={`pixel-box absolute flex flex-col items-center bg-peach text-center ${compact ? "gap-2 p-4" : "gap-3 p-6"}`}
        style={{ left: pos.left, top: pos.top, width: w, visibility: ready ? "visible" : "hidden" }}
      >
        <PixelArtBobbin mood={s.mood} outfit={season} size={compact ? 56 : 96} />
        <h2 id="tour-title" className="font-pixel text-2xl font-bold text-ink">
          {s.title}
        </h2>
        <p className={compact ? "text-ink" : "text-lg text-ink"}>{s.text}</p>
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-3 w-5 border-2 border-line ${i === step ? "bg-butter" : "bg-paper"}`} />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Step {step + 1} of {STEPS.length}
        </p>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={completeTour} className="min-h-11 px-1 font-semibold text-teal-deep underline">
            Skip tour
          </button>
          <div className="flex gap-3">
            {step > 0 && (
              <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button
              ref={nextRef}
              type="button"
              className="btn-primary"
              onClick={() => (last ? completeTour() : setStep(step + 1))}
            >
              {last ? "Let's go" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
