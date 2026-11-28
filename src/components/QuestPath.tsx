"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { PathNode, type NodeState } from "./PathNode";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { RichText } from "./RichText";

const STEPS = [
  { title: "Learn a little", text: "Open a lesson, make a guess, study an example and try one yourself.", bg: "bg-mint" },
  { title: "Practice often", text: "Quick drills bring each idea back right when you are about to forget it.", bg: "bg-butter" },
  {
    title: "Rehearse with Bobbin",
    text: "Answer the kind of questions **an AI interviewer** asks, then check yourself against the key points.",
    bg: "bg-lilac",
  },
];

/** Past the last stop, at the flag. */
const FINISHED = STEPS.length;

/**
 * The wide layout is a staircase, 1000 by 545, climbing left to right so the steps read in order.
 * Each stop sits on a landing with its card underneath.
 */
const W = 1000;
const H = 545;
const TRAIL = "M 20 340 H 320 C 345 340 345 240 370 240 H 655 C 680 240 680 140 705 140 H 985";
const STOPS = [
  { x: 165, y: 340, cardLeft: 25 },
  { x: 512, y: 240, cardLeft: 372 },
  { x: 850, y: 140, cardLeft: 710 },
];
const BY_FLAG = { x: 925, y: 140 };
const pct = (n: number, of: number) => `${(n / of) * 100}%`;

const stateOf = (i: number, at: number): NodeState => (i < at ? "done" : i === at ? "current" : "locked");

function watchScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/** Which stop Bobbin is at, worked out from how far the page has been scrolled. */
function useScrollStep(read: () => number) {
  return useSyncExternalStore(watchScroll, read, () => 0);
}

function Flag() {
  return (
    <svg width="48" height="64" viewBox="0 0 48 64" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="4" y="0" width="5" height="64" fill="#4a3326" />
      <path d="M9 4h36v26H9z" fill="#ff9e80" stroke="#4a3326" strokeWidth="3" />
    </svg>
  );
}

/** Bobbin on the trail. A new `at` makes a little hop. */
function Walker({ at, size }: { at: number; size: number }) {
  return (
    <span key={at} className="quest-hop block" aria-hidden="true">
      <PixelArtBobbin mood={at === FINISHED ? "cheering" : "happy"} size={size} />
    </span>
  );
}

function Card({ step, n }: { step: (typeof STEPS)[number]; n: number }) {
  return (
    <div className={`pixel-box flex flex-col gap-1 p-4 text-left ${step.bg}`}>
      <span className="text-sm font-bold text-teal-deep">Step {n}</span>
      <h3 className="font-pixel text-xl font-bold text-ink">{step.title}</h3>
      <p className="text-[15px] leading-snug text-ink">
        <RichText text={step.text} />
      </p>
    </div>
  );
}

function WideTrail() {
  const ref = useRef<HTMLDivElement>(null);
  // Bobbin sets off once most of the path is on screen and reaches the flag as it nears the top.
  const at = useScrollStep(
    useCallback(() => {
      const box = ref.current?.getBoundingClientRect();
      if (!box?.height) return 0;
      const through = (window.innerHeight * 0.52 - box.top) / (window.innerHeight * 0.52);
      return Math.min(FINISHED, Math.max(0, Math.floor(through * (FINISHED + 1))));
    }, []),
  );
  const bird = at === FINISHED ? BY_FLAG : STOPS[at];

  return (
    <div ref={ref} className="relative mx-auto hidden w-full max-w-[1000px] lg:block" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <path d={TRAIL} stroke="#eccb8b" strokeWidth="40" strokeLinecap="square" />
        <path d={TRAIL} stroke="#4a3326" strokeWidth="4" strokeDasharray="12 12" />
      </svg>
      <div className="absolute" style={{ left: pct(968, W), bottom: pct(H - 140, H) }}>
        <Flag />
      </div>
      <ol>
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <span aria-hidden="true" className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pct(STOPS[i].x, W), top: pct(STOPS[i].y, H) }}>
              <PathNode state={stateOf(i, at)} />
            </span>
            <div className="absolute w-[28%]" style={{ left: pct(STOPS[i].cardLeft, W), top: pct(STOPS[i].y + 46, H) }}>
              <Card step={step} n={i + 1} />
            </div>
          </li>
        ))}
      </ol>
      <div
        className="pointer-events-none absolute -translate-x-1/2 transition-[left,bottom] duration-500 motion-reduce:transition-none"
        style={{ left: pct(bird.x, W), bottom: pct(H - bird.y + 26, H) }}
      >
        <Walker at={at} size={92} />
      </div>
    </div>
  );
}

function TallTrail() {
  const list = useRef<HTMLOListElement>(null);
  const end = useRef<HTMLDivElement>(null);
  // Bobbin is at the last step whose card has come up past the middle of the screen.
  const at = useScrollStep(
    useCallback(() => {
      if (!list.current?.offsetHeight) return 0;
      if (end.current!.getBoundingClientRect().top < window.innerHeight * 0.55) return FINISHED;
      const reached = [...list.current.querySelectorAll("li")].filter((li) => li.getBoundingClientRect().top < window.innerHeight * 0.55);
      return Math.max(0, reached.length - 1);
    }, []),
  );

  return (
    <div className="mx-auto w-full max-w-md lg:hidden">
      <div className="relative pt-6">
        {/* The dotted line stops in the middle of the finish marker. */}
        <span aria-hidden="true" className="absolute bottom-7 left-7 top-0 -translate-x-1/2 border-l-4 border-dashed border-line sm:bottom-[34px] sm:left-[34px]" />
        <ol ref={list} className="relative flex flex-col gap-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex items-center gap-4">
              <span aria-hidden="true" className="relative">
                <PathNode state={stateOf(i, at)} />
                <span className="absolute bottom-full left-1/2 w-16 -translate-x-1/2">{at === i && <Walker at={at} size={64} />}</span>
              </span>
              <div className="flex-1">
                <Card step={step} n={i + 1} />
              </div>
            </li>
          ))}
        </ol>
        {/* The finish is a marker like the others, so the flag sits squarely on the line. */}
        <div ref={end} aria-hidden="true" className="relative mt-24 w-fit">
          <span className="flex h-14 w-14 items-center justify-center border-[3px] border-line bg-paper sm:h-[68px] sm:w-[68px] [&_svg]:h-9 [&_svg]:w-auto">
            <Flag />
          </span>
          <span className="absolute bottom-full left-1/2 w-16 -translate-x-1/2">{at === FINISHED && <Walker at={at} size={64} />}</span>
        </div>
      </div>
    </div>
  );
}

/** Three steps as stops along a trail. Bobbin moves up it as the page is scrolled. */
export function QuestPath() {
  return (
    <>
      <WideTrail />
      <TallTrail />
    </>
  );
}
