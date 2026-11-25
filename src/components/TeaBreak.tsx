"use client";

import { useEffect, useRef, useState } from "react";
import { COMPANION } from "@/lib/config";
import type { Season } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import { PixelArtBobbin } from "./PixelArtBobbin";
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
/**
 * Where the arms leave the body in each outfit's sipping pose. Winter's start under the scarf,
 * which is drawn again on top of them.
 */
const SHOULDERS: Record<Season, { left: number; right: number; y: number; drop?: number }> = {
  // Winter's arms start low, so they slope less to still reach the middle of the cup.
  winter: { left: 36, right: 135, y: 95, drop: 15 },
  spring: { left: 34, right: 135, y: 90 },
  summer: { left: 35, right: 135, y: 92 },
  autumn: { left: 34, right: 135, y: 93 },
};
/** Half of one of Bobbin's pixels on screen, so the arms' outline matches the body's. */
const BLOCK = (BIRD / 200) * 2;
/** The ground a cup stands on when it's put down, just in front of Bobbin's feet. */
const GROUND = 162;

const SIPS = 3;
const SIP_MS = 1400;
const KEY = "tuftly-tea-v1";
const BREATHS = [
  "Breathe in for 4 seconds as you take your first sip.",
  "Nice. Hold your breath for 4 seconds.",
  "Breathe out for 4 seconds and let your shoulders drop.",
];

/** The tea last chosen on this device, so the next break starts with it. */
function savedTea(): TeaId {
  try {
    const saved = window.localStorage.getItem(KEY);
    return TEA_MENU.find((t) => t.id === saved)?.id ?? "matcha";
  } catch {
    return "matcha";
  }
}

/** A pause in the middle of a round: pick a tea and drink it with Bobbin. The clock is stopped. */
export function TeaBreak({ onReady }: { onReady: () => void }) {
  const [tea, setTea] = useState<TeaId>(savedTea);
  const [taken, setTaken] = useState(0);
  const [sipping, setSipping] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const season = useSeason();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const picked = TEA_MENU.find((t) => t.id === tea)!;
  const level = 1 - taken / SIPS;
  const finished = taken >= SIPS;
  const mouth = MOUTH[tea];
  const at = { x: mouth.x * PX, y: mouth.y * PX };
  const grip = GRIP[tea];
  // Between sips the cup is set down in front of Bobbin; to sip, it lifts straight up until its
  // mouth point meets the beak. Cups drunk from the rim tilt around that same point; a straw stays
  // upright.
  const held = {
    left: BEAK[season].x - at.x,
    top: sipping ? BEAK[season].y + mouth.drop - at.y : GROUND - teaRows(tea) * PX,
    transform: `rotate(${sipping && mouth.y > 0 ? -7 : 0}deg)`,
  };
  const mouthAt = { x: BEAK[season].x, y: BEAK[season].y + mouth.drop };
  // Winter sips sit higher, where cups drunk from the rim taper, so the hands reach further round.
  const wrap = season === "winter" && mouth.y > 0 ? 7 : 0;

  function choose(id: TeaId) {
    setTea(id);
    setTaken(0);
    try {
      window.localStorage.setItem(KEY, id);
    } catch {
      // Storage blocked: the choice just lasts for this break.
    }
  }

  function sip() {
    setSipping(true);
    timer.current = window.setTimeout(() => {
      setSipping(false);
      setTaken((n) => n + 1);
    }, SIP_MS);
  }

  const says = sipping
    ? "Sip… take your time."
    : finished
      ? "All finished. Pour another, or head back when you're ready."
      : BREATHS[taken];

  return (
    <section className="pixel-box flex w-full max-w-lg flex-col items-center gap-4 bg-teal-wash p-5 text-center sm:p-8">
      <h2 className="font-pixel text-2xl font-bold text-ink">Tea time</h2>
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
        <div className="relative h-[176px] w-[192px] shrink-0">
          {/* Both poses stay loaded so the swap doesn't flicker. The sipping one has no side wings. */}
          <span className={`absolute left-0 top-0 ${sipping ? "invisible" : ""}`}>
            <PixelArtBobbin mood={finished ? "happy" : "sparkle"} size={BIRD} />
          </span>
          <span className={`absolute left-0 top-0 ${sipping ? "" : "invisible"}`}>
            <PixelArtBobbin mood="sip" size={BIRD} priority />
          </span>
          <span
            className="absolute transition-all duration-500 motion-reduce:transition-none"
            style={{ ...held, transformOrigin: `${at.x}px ${at.y}px` }}
          >
            {/* No steam at the beak, where it would cover Bobbin's face. */}
            <TeaCup tea={tea} level={level} size={CUP} steam={!sipping} />
          </span>
          {sipping && (
            <span className="tea-wings absolute left-0 top-0">
              <HoldingWings
                size={BIRD}
                block={BLOCK}
                shoulders={SHOULDERS[season]}
                cup={{
                  left: mouthAt.x - at.x + grip.left * PX + wrap,
                  right: mouthAt.x - at.x + grip.right * PX - wrap,
                  y: mouthAt.y - at.y + grip.y * PX,
                }}
              />
            </span>
          )}
          {sipping && season === "winter" && (
            // The ends of the scarf, over the tops of the arms so they come out from under it.
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/bobbin/pixel/winter/sip-scarf.webp" alt="" width={BIRD} height={BIRD} className="pointer-events-none absolute left-0 top-0 [image-rendering:pixelated]" />
          )}
        </div>
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
