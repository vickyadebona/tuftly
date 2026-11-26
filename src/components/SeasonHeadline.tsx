"use client";

import type { Season } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import { TeaCup, type TeaId } from "./PixelIcon";

/** The landing page's headline, one for each of Bobbin's outfits. */
export const HEADLINES: Record<Season, string> = {
  winter: "Warm up for your next coding interview",
  spring: "Spring into your next coding interview",
  summer: "Dive into your next coding interview",
  autumn: "Fall into step for your next coding interview",
};

/** The tea of the season, poured at the end of the headline. */
export const SEASON_TEA: Record<Season, TeaId> = {
  winter: "breakfast",
  spring: "matcha",
  summer: "bubble",
  autumn: "chai",
};

/** The season's tea beside a line of small text: the landing note and the tea break button. */
export function SeasonBadgeTea() {
  const tea = SEASON_TEA[useSeason()];
  // Bubble tea is tall, so it's drawn narrower to keep the note the same height.
  return <TeaCup tea={tea} size={tea === "bubble" ? 24 : 32} compact />;
}

export function SeasonHeadline() {
  const season = useSeason();
  const words = HEADLINES[season].split(" ");
  const last = words.pop();
  return (
    <>
      {words.join(" ")}{" "}
      {/* Kept together, so the cup never wraps onto a line of its own. */}
      <span className="whitespace-nowrap">
        {last}
        <span className="ml-[0.25em] inline-block [&_svg]:!h-auto [&_svg]:!w-[1.1em]">
          <TeaCup tea={SEASON_TEA[season]} compact />
        </span>
      </span>
    </>
  );
}
