"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { COMPANION } from "@/lib/config";
import { chooseTea, useProgress } from "@/lib/store";
import type { Season } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import { TEA_TIME } from "@/lib/phrases";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { SEASON_TEA } from "./SeasonHeadline";
import { HoldingWings, TeaCup, teaRows, type TeaId } from "./PixelIcon";

export const TEA_MENU: { id: TeaId; name: string; note: string }[] = [
  { id: "matcha", name: "Matcha", note: "Grassy and smooth. Hold the bowl in both wings." },
  { id: "bubble", name: "Bubble tea", note: "Sweet, with chewy pearls. Watch the straw." },
  { id: "breakfast", name: "English breakfast", note: "Strong and cozy. A classic." },
  { id: "chai", name: "Chai", note: "Creamy and warmly spiced." },
];

const BIRD = 170;
const CUP = 62;
/** One sprite pixel of a cup, on screen. The cup drawings are 16 wide. */
const PX = CUP / 16;
/** Middle of Bobbin's beak while sipping, measured on each outfit's happy face. */
const BEAK: Record<Season, { x: number; y: number }> = {
  winter: { x: 82, y: 76 },
  spring: { x: 82, y: 77 },
  summer: { x: 83, y: 80 },
  autumn: { x: 82, y: 81 },
};
/**
 * The pixel of each drawing that meets the beak: the straw's tip, or the middle of the rim. A rim
 * sits `drop` pixels lower, just under the beak, while a straw goes into it.
 */
const MOUTH: Record<TeaId, { x: number; y: number; drop: number }> = {
  matcha: { x: 8, y: 4, drop: 5 },
  bubble: { x: 8, y: 0, drop: 2 },
  breakfast: { x: 6, y: 3, drop: 5 },
  chai: { x: 7, y: 3, drop: 5 },
};

/** Where each drawing's sides are, and how far down the wings take hold, in cup pixels. */
const GRIP: Record<TeaId, { left: number; right: number; y: number }> = {
  matcha: { left: 1, right: 15, y: 8 },
  bubble: { left: 2, right: 13, y: 7 },
  breakfast: { left: 1, right: 11, y: 8 },
  chai: { left: 1, right: 12, y: 8 },
};
/** Where the body's sides are at wing height in each outfit's sipping pose. */
const SHOULDERS: Record<Season, { left: number; right: number }> = {
  winter: { left: 39, right: 134 },
  spring: { left: 38, right: 134 },
  summer: { left: 39, right: 134 },
  autumn: { left: 38, right: 134 },
};
/** How far each hand reaches over the cup's side. */
const HOLD = 4;
/** Half of one of Bobbin's pixels on screen, so the wings' outline matches the body's. */
const BLOCK = (BIRD / 200) * 2;
/** The ground a cup stands on when it's put down, just in front of Bobbin's feet. */
const GROUND = 162;

const SIPS = 3;
const SIP_MS = 1400;
/** How long the cup takes to reach the beak. Matches its `duration-500`. */
const LIFT_MS = 500;
const BREATHS = [
  "Breathe in for 4 seconds as you take your first sip.",
  "Nice. Hold your breath for 4 seconds.",
  "Breathe out for 4 seconds and let your shoulders drop.",
];

/** Where Bobbin's wings take hold of a cup that has been lifted to the beak. */
function grasp(season: Season, tea: TeaId) {
  const mouth = MOUTH[tea];
  const at = { x: mouth.x * PX, y: mouth.y * PX };
  const grip = GRIP[tea];
  const mouthAt = { x: BEAK[season].x, y: BEAK[season].y + mouth.drop };
  // Winter sips sit higher, where cups drunk from the rim taper, so the hands reach further round.
  const wrap = season === "winter" && mouth.y > 0 ? 2 : 0;
  return {
    left: mouthAt.x - at.x + grip.left * PX + HOLD + wrap,
    right: mouthAt.x - at.x + grip.right * PX - HOLD - wrap,
    y: mouthAt.y - at.y + grip.y * PX,
  };
}

/**
 * Bobbin and a cup. `sipping` lifts the cup to the beak, and `holding` is true once it has arrived
 * and the wings are round it. Drawn 192 by 176.
 */
function Drinker({ tea, level, sipping, holding, rest }: {
  tea: TeaId;
  level: number;
  sipping: boolean;
  holding: boolean;
  /** Bobbin's face between sips. */
  rest: "sparkle" | "happy";
}) {
  const season = useSeason();
  const mouth = MOUTH[tea];
  const at = { x: mouth.x * PX, y: mouth.y * PX };
  // Between sips the cup is set down in front of Bobbin; to sip, it lifts straight up until its
  // mouth point meets the beak. Cups drunk from the rim tilt around that same point; a straw stays
  // upright.
  const held = {
    left: BEAK[season].x - at.x,
    top: sipping ? BEAK[season].y + mouth.drop - at.y : GROUND - teaRows(tea) * PX,
    transform: `rotate(${sipping && mouth.y > 0 ? -7 : 0}deg)`,
    transformOrigin: `${at.x}px ${at.y}px`,
  };
  return (
    <div className="relative h-[176px] w-[192px] shrink-0">
      {/* Everything that is part of Bobbin floats as one, so held wings and cup stay put on the body. */}
      <div className="bobbin-idle bobbin-still absolute inset-0">
        {/* Both poses stay loaded so the swap doesn't flicker. The sipping one has no side wings. */}
        <span className={`absolute left-0 top-0 ${holding ? "invisible" : ""}`}>
          <PixelArtBobbin mood={rest} size={BIRD} />
        </span>
        <span className={`absolute left-0 top-0 ${holding ? "" : "invisible"}`}>
          <PixelArtBobbin mood="sip" size={BIRD} priority />
        </span>
        {holding && (
          <>
            <span className="absolute" style={held}>
              <TeaCup tea={tea} level={level} size={CUP} steam={false} />
            </span>
            <span className="absolute left-0 top-0">
              <HoldingWings size={BIRD} block={BLOCK} shoulders={SHOULDERS[season]} cup={grasp(season, tea)} />
            </span>
          </>
        )}
      </div>
      {/* The cup on its way up or down, or standing on the ground, where it doesn't float. */}
      <span
        className={`absolute transition-[top,transform] duration-500 motion-reduce:transition-none ${holding ? "invisible" : ""}`}
        style={held}
      >
        {/* No steam on the way to the beak, where it would cover Bobbin's face. */}
        <TeaCup tea={tea} level={level} size={CUP} steam={!sipping} />
      </span>
    </div>
  );
}

const STILL = "(prefers-reduced-motion: reduce)";
const wantsStill = () => window.matchMedia(STILL).matches;
function watchStill(onChange: () => void) {
  const query = window.matchMedia(STILL);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** How long the cup rests on the ground between the landing page's sips. */
const PAUSE_MS = 1600;

/**
 * Bobbin sipping the season's tea over and over. With reduced motion, a still of the cup at the
 * beak.
 */
export function SippingBobbin() {
  const tea = SEASON_TEA[useSeason()];
  const still = useSyncExternalStore(watchStill, wantsStill, () => false);
  const [step, setStep] = useState<"down" | "lifting" | "holding">("down");

  useEffect(() => {
    if (still) return;
    const next = step === "down" ? "lifting" : step === "lifting" ? "holding" : "down";
    const wait = step === "down" ? PAUSE_MS : step === "lifting" ? LIFT_MS : SIP_MS - LIFT_MS;
    const timer = window.setTimeout(() => setStep(next), wait);
    return () => window.clearTimeout(timer);
  }, [step, still]);

  return (
    // Bobbin sits left of the drawing's middle (170 of 192 wide), so nudge it back to center.
    <div className="translate-x-[11px]">
      <Drinker tea={tea} level={1} rest="sparkle" sipping={still || step !== "down"} holding={still || step === "holding"} />
    </div>
  );
}

/** A pause in the middle of a round: pick a tea and drink it with Bobbin. The clock is stopped. */
export function TeaBreak({ onReady }: { onReady: () => void }) {
  // The last tea chosen is saved with the account. `chosen` keeps today's pick even if storage is blocked.
  const saved = useProgress().tea?.id;
  const [chosen, setChosen] = useState<TeaId | null>(null);
  const tea = TEA_MENU.find((t) => t.id === (chosen ?? saved))?.id ?? "matcha";
  const [taken, setTaken] = useState(0);
  const [sipping, setSipping] = useState(false);
  // True once the cup has arrived. Until then Bobbin keeps their wings at their sides.
  const [holding, setHolding] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const picked = TEA_MENU.find((t) => t.id === tea)!;
  const level = 1 - taken / SIPS;
  const finished = taken >= SIPS;

  function choose(id: TeaId) {
    setChosen(id);
    setTaken(0);
    chooseTea(id);
  }

  function sip() {
    setSipping(true);
    // With reduced motion the cup jumps straight there, so the wings take it at once.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current = [
      window.setTimeout(() => setHolding(true), still ? 0 : LIFT_MS),
      window.setTimeout(() => {
        setSipping(false);
        setHolding(false);
        setTaken((n) => n + 1);
      }, SIP_MS),
    ];
  }

  const says = sipping
    ? "Sip… take your time."
    : finished
      ? "All finished. Pour another, or head back when you're ready."
      : BREATHS[taken];

  return (
    <section className="pixel-box flex w-full max-w-lg flex-col items-center gap-4 bg-teal-wash p-5 text-center sm:p-8">
      <h2 className="font-pixel text-2xl font-bold text-ink">{TEA_TIME}</h2>
      <p className="text-ink">Pick a tea and drink it with {COMPANION.name}. The clock is paused.</p>

      <div role="radiogroup" aria-label="Choose a tea" className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {TEA_MENU.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={tea === t.id}
            disabled={sipping}
            onClick={() => choose(t.id)}
            className={`flex flex-col items-center gap-1 border-[3px] border-line p-2 text-sm font-bold text-ink ${
              tea === t.id ? "bg-butter outline outline-4 outline-offset-2 outline-teal-deep" : "bg-paper"
            }`}
          >
            <TeaCup tea={t.id} size={44} />
            {t.name}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink-soft">{picked.note}</p>

      {/* Bobbin picks the cup up for a sip and puts it down again, and yours tips alongside. */}
      <div className="flex items-end justify-center gap-2 sm:gap-6">
        <Drinker tea={tea} level={level} sipping={sipping} holding={holding} rest={finished ? "happy" : "sparkle"} />
        <div className="flex flex-col items-center gap-1 pb-2">
          <span className={`transition-transform duration-500 motion-reduce:transition-none ${sipping ? "-translate-y-6 -rotate-12" : ""}`}>
            <TeaCup tea={tea} level={level} size={66} />
          </span>
          <span className="font-pixel text-sm font-bold text-ink">Yours</span>
        </div>
      </div>

      <p role="status" className="min-h-12 text-lg text-ink">
        {says}
      </p>
      <p className="text-sm font-semibold text-ink">
        {finished ? "Cup finished" : `${SIPS - taken} ${SIPS - taken === 1 ? "sip" : "sips"} left`}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {finished ? (
          <button type="button" className="btn-accent" onClick={() => setTaken(0)}>
            Pour another
          </button>
        ) : (
          <button type="button" className="btn-accent" onClick={sip} disabled={sipping}>
            Take a sip together
          </button>
        )}
        <button type="button" className="btn-primary" onClick={onReady}>
          I&apos;m ready
        </button>
      </div>
    </section>
  );
}
