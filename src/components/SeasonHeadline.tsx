"use client";

import type { Season } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";

/** The landing page's headline, one for each of Bobbin's outfits. */
export const HEADLINES: Record<Season, string> = {
  winter: "Warm up for your next coding interview",
  spring: "Spring into your next coding interview",
  summer: "Dive into your next coding interview",
  autumn: "Fall into step for your next coding interview",
};

export function SeasonHeadline() {
  return HEADLINES[useSeason()];
}
