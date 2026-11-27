"use client";

import { useMemo, type ReactNode } from "react";
import { COMPANION } from "@/lib/config";
import { FEET, LEAF, LEAVES, scene, SCENE_H, SCENE_W, SKY } from "@/lib/island";
import { HELLO } from "@/lib/phrases";
import { useSeason } from "@/lib/useSeason";
import { PixelArtBobbin } from "./PixelArtBobbin";

/** Bobbin's width in scene pixels, and how far down the picture the feet are. */
const BIRD = 36;
const SPRITE_FEET = 0.905;

/** The hero's background, in the season's sky color. */
export function HeroSky({ children }: { children: ReactNode }) {
  return (
    <section className="px-5 py-10 sm:px-6 sm:py-16" style={{ background: SKY[useSeason()] }}>
      {children}
    </section>
  );
}

/** The landing page picture: Bobbin says hello from a floating island dressed for the season. */
export function HeroScene() {
  const season = useSeason();
  const layers = useMemo(() => scene(season), [season]);
  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center sm:max-w-[520px]">
      <div className="relative z-10 mb-3">
        <p className="pixel-box bg-paper px-4 py-3 text-center font-pixel text-lg font-bold text-ink sm:px-6 sm:text-2xl">
          {HELLO} I&apos;m {COMPANION.name}.
        </p>
        <span aria-hidden="true" className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-[3px] border-r-[3px] border-line bg-paper" />
      </div>
      <div className="relative w-full" aria-hidden="true">
        <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="block w-full" shapeRendering="crispEdges">
          {layers.map((layer, i) => (
            <path key={i} d={layer.d} fill={layer.color} />
          ))}
          {season === "autumn" &&
            LEAVES.map(({ x, y, flip }) => (
              <image
                key={`${x}-${y}`}
                href={LEAF.src}
                width={LEAF.width}
                height={LEAF.height}
                transform={flip ? `translate(${x + LEAF.width} ${y}) scale(-1 1)` : `translate(${x} ${y})`}
                style={{ imageRendering: "pixelated" }}
              />
            ))}
        </svg>
        <div
          className="absolute aspect-square [&_img]:h-full [&_img]:w-full"
          style={{
            width: `${(BIRD / SCENE_W) * 100}%`,
            left: `${((SCENE_W - BIRD) / 2 / SCENE_W) * 100}%`,
            top: `${((FEET - BIRD * SPRITE_FEET) / SCENE_H) * 100}%`,
          }}
        >
          <PixelArtBobbin mood="sparkle" size={300} priority />
        </div>
      </div>
    </div>
  );
}
