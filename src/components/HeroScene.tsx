"use client";

import type { ReactNode } from "react";
import { COMPANION } from "@/lib/config";
import { SKY } from "@/lib/island";
import { HELLO } from "@/lib/phrases";
import { useSeason } from "@/lib/useSeason";
import { IslandArt } from "./IslandArt";

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
  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center sm:max-w-[520px]">
      <div className="relative z-10 mb-3">
        <p className="pixel-box bg-paper px-4 py-3 text-center font-pixel text-lg font-bold text-ink sm:px-6 sm:text-2xl">
          {HELLO} I&apos;m {COMPANION.name}.
        </p>
        <span aria-hidden="true" className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-[3px] border-r-[3px] border-line bg-paper" />
      </div>
      <div className="w-full" aria-hidden="true">
        <IslandArt season={season} priority />
      </div>
    </div>
  );
}
