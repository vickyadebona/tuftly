"use client";

import { SEASON_OVERRIDE } from "@/lib/config";
import type { Season } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import { PixelArtBobbin } from "./PixelArtBobbin";

export type BobbinMood =
  | "wink"
  | "sparkle"
  | "calm"
  | "happy"
  | "thinking"
  | "cheering"
  | "sleepy"
  | "determined"
  | "nervous"
  | "teary";

/** Bobbin (pixel art) with an optional speech bubble. The outfit follows today's season. */
export function Bobbin({
  say,
  mood = "sparkle",
  outfit,
}: {
  say?: string;
  mood?: BobbinMood;
  /** Defaults to the season for today's date (or SEASON_OVERRIDE in config). */
  outfit?: Season;
}) {
  const detected = useSeason();
  const season = outfit ?? SEASON_OVERRIDE ?? detected;
  return (
    <div className="flex items-end gap-3">
      <PixelArtBobbin mood={mood} outfit={season} size={88} />
      {say && (
        <p className="pixel-box mb-3 px-4 py-2 text-ink">
          {say}
        </p>
      )}
    </div>
  );
}
